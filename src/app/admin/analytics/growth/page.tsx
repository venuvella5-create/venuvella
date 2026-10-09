import Link from "next/link";

import {
  prisma,
} from "@/lib/db/prisma";
import { sequential } from "@/lib/db/sequential";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";


export const dynamic =
  "force-dynamic";


function startOfDay(
  date: Date
) {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}


function percentage(
  value: number,
  total: number
) {
  if (total <= 0) {
    return 0;
  }

  return (
    value /
    total
  ) * 100;
}


function getChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    if (current === 0) {
      return {
        label: "No change",
        tone: "neutral" as const,
      };
    }

    return {
      label: "New activity",
      tone: "positive" as const,
    };
  }

  const change =
    (
      (
        current -
        previous
      ) /
      previous
    ) *
    100;

  if (
    Math.abs(change) <
    0.05
  ) {
    return {
      label: "0.0%",
      tone: "neutral" as const,
    };
  }

  return {
    label:
      change >
      0
        ? `â†‘ ${change.toFixed(1)}%`
        : `â†“ ${Math.abs(change).toFixed(1)}%`,

    tone:
      change >
      0
        ? "positive" as const
        : "watch" as const,
  };
}


function isSafeExternalUrl(
  value:
    string |
    null
) {
  if (!value) {
    return false;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    );
  } catch {
    return false;
  }
}


export default async function GrowthIntelligencePage() {
  await requirePageRole([
    "ADMIN",
    "ANALYST",
  ]);


  const today =
    startOfDay(
      new Date()
    );

  const currentStart =
    new Date(today);

  currentStart.setDate(
    currentStart.getDate() -
      6
  );

  const previousStart =
    new Date(currentStart);

  previousStart.setDate(
    previousStart.getDate() -
      7
  );


  const currentWhere = {
    createdAt: {
      gte:
        currentStart,
    },
  };


  const previousWhere = {
    createdAt: {
      gte:
        previousStart,

      lt:
        currentStart,
    },
  };


  const newsletterWhere = {
    OR: [
      {
        utmSource:
          "newsletter",
      },

      {
        utmMedium:
          "email",
      },

      {
        campaign: {
          startsWith:
            "edit-",
        },
      },
    ],
  };


  const [
    currentClicks,
    previousClicks,
    currentEditorialClicks,
    previousEditorialClicks,
    currentNewsletterClicks,
    previousNewsletterClicks,
    currentProductGroups,
    previousProductGroups,
    currentArticleGroups,
    previousArticleGroups,
    currentCategoryGroups,
    previousCategoryGroups,
    currentProviderGroups,
    previousProviderGroups,
    currentArticleProductGroups,
    publishedProducts,
  ] =
    await sequential([
      prisma.affiliateClick.count({
        where:
          currentWhere,
      }),

      prisma.affiliateClick.count({
        where:
          previousWhere,
      }),

      prisma.affiliateClick.count({
        where: {
          ...currentWhere,

          articleId: {
            not:
              null,
          },
        },
      }),

      prisma.affiliateClick.count({
        where: {
          ...previousWhere,

          articleId: {
            not:
              null,
          },
        },
      }),

      prisma.affiliateClick.count({
        where: {
          ...currentWhere,
          ...newsletterWhere,
        },
      }),

      prisma.affiliateClick.count({
        where: {
          ...previousWhere,
          ...newsletterWhere,
        },
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "productId",
        ],

        where: {
          ...currentWhere,

          productId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },

        orderBy: {
          _count: {
            productId:
              "desc",
          },
        },

        take:
          10,
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "productId",
        ],

        where: {
          ...previousWhere,

          productId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "articleId",
        ],

        where: {
          ...currentWhere,

          articleId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },

        orderBy: {
          _count: {
            articleId:
              "desc",
          },
        },

        take:
          10,
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "articleId",
        ],

        where: {
          ...previousWhere,

          articleId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "category",
        ],

        where: {
          ...currentWhere,

          category: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },

        orderBy: {
          _count: {
            category:
              "desc",
          },
        },

        take:
          10,
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "category",
        ],

        where: {
          ...previousWhere,

          category: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "providerId",
        ],

        where: {
          ...currentWhere,

          providerId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },

        orderBy: {
          _count: {
            providerId:
              "desc",
          },
        },

        take:
          10,
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "providerId",
        ],

        where: {
          ...previousWhere,

          providerId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "articleId",
          "productId",
        ],

        where: {
          ...currentWhere,

          articleId: {
            not:
              null,
          },

          productId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },

        orderBy: {
          _count: {
            articleId:
              "desc",
          },
        },

        take:
          8,
      }),

      prisma.product.findMany({
        where: {
          status:
            "PUBLISHED",
        },

        select: {
          id:
            true,

          name:
            true,

          slug:
            true,

          updatedAt:
            true,

          providerProducts: {
            where: {
              provider: {
                status: {
                  not:
                    "INACTIVE",
                },
              },
            },

            select: {
              providerId:
                true,

              affiliateUrl:
                true,

              productUrl:
                true,

              updatedAt:
                true,
            },
          },
        },
      }),
    ]);


  const productIds =
    Array.from(
      new Set(
        [
          ...currentProductGroups.map(
            (
              group
            ) =>
              group.productId
          ),

          ...currentArticleProductGroups.map(
            (
              group
            ) =>
              group.productId
          ),
        ].filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
      )
    );


  const articleIds =
    Array.from(
      new Set(
        [
          ...currentArticleGroups.map(
            (
              group
            ) =>
              group.articleId
          ),

          ...currentArticleProductGroups.map(
            (
              group
            ) =>
              group.articleId
          ),
        ].filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
      )
    );


  const providerIds =
    currentProviderGroups
      .map(
        (
          group
        ) =>
          group.providerId
      )
      .filter(
        (
          id
        ): id is string =>
          Boolean(id)
      );


  const [
    products,
    articles,
    providers,
  ] =
    await sequential([
      productIds.length >
      0
        ? prisma.product.findMany({
            where: {
              id: {
                in:
                  productIds,
              },
            },

            select: {
              id:
                true,
              name:
                true,
              slug:
                true,
            },
          })
        : Promise.resolve(
            []
          ),

      articleIds.length >
      0
        ? prisma.article.findMany({
            where: {
              id: {
                in:
                  articleIds,
              },
            },

            select: {
              id:
                true,
              title:
                true,
              slug:
                true,
              updatedAt:
                true,
            },
          })
        : Promise.resolve(
            []
          ),

      providerIds.length >
      0
        ? prisma.affiliateProvider.findMany({
            where: {
              id: {
                in:
                  providerIds,
              },
            },

            select: {
              id:
                true,
              name:
                true,
              slug:
                true,
            },
          })
        : Promise.resolve(
            []
          ),
    ]);


  const productMap =
    new Map(
      products.map(
        (
          product
        ) => [
          product.id,
          product,
        ]
      )
    );


  const articleMap =
    new Map(
      articles.map(
        (
          article
        ) => [
          article.id,
          article,
        ]
      )
    );


  const providerMap =
    new Map(
      providers.map(
        (
          provider
        ) => [
          provider.id,
          provider,
        ]
      )
    );


  const previousProductMap =
    new Map(
      previousProductGroups
        .filter(
          (
            group
          ) =>
            Boolean(
              group.productId
            )
        )
        .map(
          (
            group
          ) => [
            group.productId as string,
            group._count._all,
          ]
        )
    );


  const previousArticleMap =
    new Map(
      previousArticleGroups
        .filter(
          (
            group
          ) =>
            Boolean(
              group.articleId
            )
        )
        .map(
          (
            group
          ) => [
            group.articleId as string,
            group._count._all,
          ]
        )
    );


  const previousCategoryMap =
    new Map(
      previousCategoryGroups
        .filter(
          (
            group
          ) =>
            Boolean(
              group.category
            )
        )
        .map(
          (
            group
          ) => [
            group.category as string,
            group._count._all,
          ]
        )
    );


  const previousProviderMap =
    new Map(
      previousProviderGroups
        .filter(
          (
            group
          ) =>
            Boolean(
              group.providerId
            )
        )
        .map(
          (
            group
          ) => [
            group.providerId as string,
            group._count._all,
          ]
        )
    );


  const productsWithNoActiveProvider =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length ===
        0
    );


  const productsWithSingleProvider =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length ===
        1
    );


  const productsWithoutValidDestination =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length >
          0 &&
        product.providerProducts.every(
          (
            mapping
          ) =>
            !isSafeExternalUrl(
              mapping.affiliateUrl
            ) &&
            !isSafeExternalUrl(
              mapping.productUrl
            )
        )
    );


  const totalChange =
    getChange(
      currentClicks,
      previousClicks
    );


  const editorialChange =
    getChange(
      currentEditorialClicks,
      previousEditorialClicks
    );


  const newsletterChange =
    getChange(
      currentNewsletterClicks,
      previousNewsletterClicks
    );


  const topCategory =
    currentCategoryGroups[0] ??
    null;



  const topProduct =
    currentProductGroups[0] ??
    null;


  const topArticle =
    currentArticleGroups[0] ??
    null;


  const actions: {
    priority:
      "High" |
      "Medium" |
      "Maintain";

    title:
      string;

    detail:
      string;

    href:
      string;
  }[] = [];


  if (
    productsWithNoActiveProvider.length >
    0
  ) {
    actions.push({
      priority:
        "High",

      title:
        "Fix products with no active retailer",

      detail:
        `${productsWithNoActiveProvider.length} published product${productsWithNoActiveProvider.length === 1 ? "" : "s"} currently have no active provider mapping.`,

      href:
        "/admin/providers",
    });
  }


  if (
    productsWithoutValidDestination.length >
    0
  ) {
    actions.push({
      priority:
        "High",

      title:
        "Repair unusable retailer destinations",

      detail:
        `${productsWithoutValidDestination.length} published product${productsWithoutValidDestination.length === 1 ? "" : "s"} have provider mappings but no valid outbound URL.`,

      href:
        "/admin/providers",
    });
  }


  if (
    topArticle?.articleId &&
    topProduct?.productId
  ) {
    const article =
      articleMap.get(
        topArticle.articleId
      );

    const product =
      productMap.get(
        topProduct.productId
      );

    actions.push({
      priority:
        "Maintain",

      title:
        "Protect this week's strongest content",

      detail:
        `${article?.title ?? "The leading article"} and ${product?.name ?? "the leading product"} are currently the strongest individual retailer-intent signals. Keep their content, availability and destinations accurate.`,

      href:
        "/admin/articles",
    });
  }


  if (
    productsWithSingleProvider.length >
    0
  ) {
    actions.push({
      priority:
        "Medium",

      title:
        "Reduce single-provider dependency",

      detail:
        `${productsWithSingleProvider.length} published product${productsWithSingleProvider.length === 1 ? "" : "s"} rely on only one active provider. Prioritize alternatives for products already receiving retailer clicks.`,

      href:
        "/admin/providers",
    });
  }


  if (
    currentNewsletterClicks ===
      0
  ) {
    actions.push({
      priority:
        "Medium",

      title:
        "Establish newsletter retailer-intent baseline",

      detail:
        "No newsletter-attributed retailer clicks were recorded this week. Keep newsletter UTM attribution intact when production sending begins.",

      href:
        "/admin/newsletter/campaigns",
    });
  }


  if (
    topCategory?.category
  ) {
    actions.push({
      priority:
        "Maintain",

      title:
        `Keep ${topCategory.category} in the content mix`,

      detail:
        `${topCategory._count._all} retailer click${topCategory._count._all === 1 ? "" : "s"} were attributed to this category in the last 7 days. Treat this as a content-demand signal, not purchase data.`,

      href:
        "/admin/articles",
    });
  }


  const visibleActions =
    actions.slice(
      0,
      6
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Analytics / Growth
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Weekly growth intelligence
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              A seven-day operating brief for editorial,
              product and provider decisions. Metrics represent
              outbound retailer intent â€” not confirmed sales,
              conversions or revenue.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/analytics"
              className="admin-secondary"
            >
              Full analytics
            </Link>


            <Link
              href="/admin/providers"
              className="admin-secondary"
            >
              Providers
            </Link>


            <Link
              href="/admin"
              className="admin-primary"
            >
              Admin home
            </Link>

          </div>

        </div>


        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <KpiCard
            label="Retailer clicks"
            value={
              currentClicks
            }
            comparison={
              totalChange
            }
            previous={
              previousClicks
            }
          />


          <KpiCard
            label="Editorial clicks"
            value={
              currentEditorialClicks
            }
            comparison={
              editorialChange
            }
            previous={
              previousEditorialClicks
            }
          />


          <KpiCard
            label="Newsletter clicks"
            value={
              currentNewsletterClicks
            }
            comparison={
              newsletterChange
            }
            previous={
              previousNewsletterClicks
            }
          />


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Editorial share
            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {percentage(
                currentEditorialClicks,
                currentClicks
              ).toFixed(
                1
              )}
              %
            </p>

            <p className="mt-3 text-xs text-[var(--muted)]">
              Share of this week&apos;s retailer clicks attributed to articles.
            </p>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Next 7 days
              </p>

              <h2 className="display-serif mt-2 text-3xl">
                Prioritized action list
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Start with structural coverage problems, then improve
                proven editorial paths and expand only where the data supports it.
              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {visibleActions.length >
            0 ? (

              visibleActions.map(
                (
                  item,
                  index
                ) => (

                  <Link
                    key={`${item.title}-${index}`}
                    href={
                      item.href
                    }
                    className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:-translate-y-0.5 hover:bg-white"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <p className="font-semibold">
                        {item.title}
                      </p>

                      <PriorityBadge
                        value={
                          item.priority
                        }
                      />

                    </div>


                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {item.detail}
                    </p>

                  </Link>

                )
              )

            ) : (

              <p className="text-sm text-[var(--muted)]">
                No urgent growth actions are available yet.
              </p>

            )}

          </div>

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <RankedList
            eyebrow="Editorial intelligence"
            title="Articles driving retailer intent"
            empty="No article-attributed clicks were recorded this week."
            items={
              currentArticleGroups.map(
                (
                  group
                ) => {
                  const article =
                    group.articleId
                      ? articleMap.get(
                          group.articleId
                        )
                      : null;

                  const previous =
                    group.articleId
                      ? previousArticleMap.get(
                          group.articleId
                        ) ??
                        0
                      : 0;

                  return {
                    id:
                      group.articleId ??
                      "unknown",

                    label:
                      article?.title ??
                      "Unknown article",

                    value:
                      group._count._all,

                    comparison:
                      getChange(
                        group._count._all,
                        previous
                      ).label,

                    href:
                      article
                        ? `/articles/${article.slug}`
                        : null,
                  };
                }
              )
            }
          />


          <RankedList
            eyebrow="Product intelligence"
            title="Products receiving retailer interest"
            empty="No product-attributed clicks were recorded this week."
            items={
              currentProductGroups.map(
                (
                  group
                ) => {
                  const product =
                    group.productId
                      ? productMap.get(
                          group.productId
                        )
                      : null;

                  const previous =
                    group.productId
                      ? previousProductMap.get(
                          group.productId
                        ) ??
                        0
                      : 0;

                  return {
                    id:
                      group.productId ??
                      "unknown",

                    label:
                      product?.name ??
                      "Unknown product",

                    value:
                      group._count._all,

                    comparison:
                      getChange(
                        group._count._all,
                        previous
                      ).label,

                    href:
                      product
                        ? `/products/${product.slug}`
                        : null,
                  };
                }
              )
            }
          />

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <RankedList
            eyebrow="Category intelligence"
            title="Categories creating retailer intent"
            empty="No category-attributed clicks were recorded this week."
            items={
              currentCategoryGroups.map(
                (
                  group
                ) => {
                  const category =
                    group.category ??
                    "Uncategorized";

                  const previous =
                    group.category
                      ? previousCategoryMap.get(
                          group.category
                        ) ??
                        0
                      : 0;

                  return {
                    id:
                      category,

                    label:
                      category,

                    value:
                      group._count._all,

                    comparison:
                      getChange(
                        group._count._all,
                        previous
                      ).label,

                    href:
                      null,
                  };
                }
              )
            }
          />


          <RankedList
            eyebrow="Provider intelligence"
            title="Retailer destinations receiving interest"
            empty="No provider-attributed clicks were recorded this week."
            items={
              currentProviderGroups.map(
                (
                  group
                ) => {
                  const provider =
                    group.providerId
                      ? providerMap.get(
                          group.providerId
                        )
                      : null;

                  const previous =
                    group.providerId
                      ? previousProviderMap.get(
                          group.providerId
                        ) ??
                        0
                      : 0;

                  return {
                    id:
                      group.providerId ??
                      "unknown",

                    label:
                      provider?.name ??
                      "Unknown provider",

                    value:
                      group._count._all,

                    comparison:
                      getChange(
                        group._count._all,
                        previous
                      ).label,

                    href:
                      provider
                        ? `/admin/providers/${provider.id}`
                        : null,
                  };
                }
              )
            }
          />

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Strongest paths
            </p>

            <h2 className="display-serif mt-2 text-3xl">
              Article â†’ product this week
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Maintain accurate product recommendations on paths already generating outbound interest.
            </p>


            <div className="mt-6 divide-y divide-[var(--line)]">

              {currentArticleProductGroups.length >
              0 ? (

                currentArticleProductGroups.map(
                  (
                    group,
                    index
                  ) => {

                    const article =
                      group.articleId
                        ? articleMap.get(
                            group.articleId
                          )
                        : null;


                    const product =
                      group.productId
                        ? productMap.get(
                            group.productId
                          )
                        : null;


                    return (

                      <div
                        key={`${group.articleId}-${group.productId}`}
                        className="flex items-start justify-between gap-5 py-4"
                      >

                        <div>

                          <p className="text-xs font-semibold text-[var(--muted)]">
                            {index + 1}.{" "}
                            {article?.title ??
                              "Unknown article"}
                          </p>

                          <p className="mt-1 font-medium">
                            â†’{" "}
                            {product?.name ??
                              "Unknown product"}
                          </p>

                        </div>


                        <strong>
                          {group._count._all}
                        </strong>

                      </div>

                    );

                  }
                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">
                  No article-to-product retailer paths were recorded this week.
                </p>

              )}

            </div>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Catalog health
            </p>

            <h2 className="display-serif mt-2 text-3xl">
              Retailer coverage risks
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <CoverageMetric
                label="No provider"
                value={
                  productsWithNoActiveProvider.length
                }
              />

              <CoverageMetric
                label="One provider"
                value={
                  productsWithSingleProvider.length
                }
              />

              <CoverageMetric
                label="No valid URL"
                value={
                  productsWithoutValidDestination.length
                }
              />

            </div>


            <div className="mt-6">

              <Link
                href="/admin/providers"
                className="admin-primary inline-flex"
              >
                Review provider coverage
              </Link>

            </div>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Operating principle
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Optimize trust before click volume
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Use this report to decide what to maintain, refresh and expand.
            A rising click count means stronger outbound retailer intent.
            It does not prove that a customer purchased, that a provider converts better,
            or that a product generated revenue.
          </p>

        </section>

      </div>

    </main>
  );
}


function KpiCard({
  label,
  value,
  previous,
  comparison,
}: {
  label:
    string;

  value:
    number;

  previous:
    number;

  comparison: {
    label:
      string;

    tone:
      "positive" |
      "watch" |
      "neutral";
  };
}) {
  const className =
    comparison.tone ===
    "positive"
      ? "text-emerald-700"
      : comparison.tone ===
          "watch"
        ? "text-rose-700"
        : "text-[var(--muted)]";


  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        {label}
      </p>

      <p className="mt-4 text-4xl font-semibold tracking-tight">
        {value}
      </p>

      <p className={`mt-3 text-xs font-semibold ${className}`}>
        {comparison.label} vs previous 7 days
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        Previous: {previous}
      </p>

    </div>
  );
}


function PriorityBadge({
  value,
}: {
  value:
    "High" |
    "Medium" |
    "Maintain";
}) {
  const className =
    value ===
    "High"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : value ===
          "Medium"
        ? "border-amber-300 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";


  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${className}`}>
      {value}
    </span>
  );
}


function RankedList({
  eyebrow,
  title,
  items,
  empty,
}: {
  eyebrow:
    string;

  title:
    string;

  empty:
    string;

  items: {
    id:
      string;

    label:
      string;

    value:
      number;

    comparison:
      string;

    href:
      string |
      null;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        {eyebrow}
      </p>

      <h2 className="display-serif mt-2 text-3xl">
        {title}
      </h2>


      <div className="mt-6 divide-y divide-[var(--line)]">

        {items.length >
        0 ? (

          items.map(
            (
              item,
              index
            ) => (

              <div
                key={
                  item.id
                }
                className="flex items-center justify-between gap-5 py-4"
              >

                <div className="min-w-0">

                  <p className="text-xs text-[var(--muted)]">
                    #{index + 1}
                  </p>


                  {item.href ? (

                    <Link
                      href={
                        item.href
                      }
                      className="mt-1 block font-medium hover:underline"
                    >
                      {item.label}
                    </Link>

                  ) : (

                    <p className="mt-1 font-medium">
                      {item.label}
                    </p>

                  )}


                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {item.comparison} vs previous week
                  </p>

                </div>


                <strong className="text-xl">
                  {item.value}
                </strong>

              </div>

            )
          )

        ) : (

          <p className="py-4 text-sm text-[var(--muted)]">
            {empty}
          </p>

        )}

      </div>

    </div>
  );
}


function CoverageMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>

    </div>
  );
}

