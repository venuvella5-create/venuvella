import Link from "next/link";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";


export const dynamic =
  "force-dynamic";


type RangeKey =
  "7d" |
  "30d" |
  "all";


function startOfDay(
  value: Date
) {
  const date =
    new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
}


function getRangeStart(
  range: RangeKey
) {
  if (
    range ===
    "all"
  ) {
    return null;
  }

  const date =
    startOfDay(
      new Date()
    );

  date.setDate(
    date.getDate() -
      (
        range ===
        "7d"
          ? 6
          : 29
      )
  );

  return date;
}


function percentage(
  numerator: number,
  denominator: number
) {
  if (
    denominator <=
    0
  ) {
    return "0.0";
  }

  return (
    (
      numerator /
      denominator
    ) *
    100
  ).toFixed(
    1
  );
}


export default async function FunnelAnalyticsPage({
  searchParams,
}: {
  searchParams:
    Promise<{
      range?:
        string;
    }>;
}) {
  await requirePageRole([
    "ADMIN",
    "ANALYST",
  ]);


  const params =
    await searchParams;

  const range:
    RangeKey =
      params.range ===
        "7d" ||
      params.range ===
        "all"
        ? params.range
        : "30d";

  const startDate =
    getRangeStart(
      range
    );

  const createdAtWhere =
    startDate
      ? {
          createdAt: {
            gte:
              startDate,
          },
        }
      : {};


  const [
    articleViews,
    productImpressions,
    editorialRetailerClicks,
    placementRetailerClicks,
    articleViewGroups,
    articleClickGroups,
    placementImpressionGroups,
    placementClickGroups,
  ] =
    await Promise.all([
      prisma.articlePageView.count({
        where:
          createdAtWhere,
      }),

      prisma.productImpression.count({
        where:
          createdAtWhere,
      }),

      prisma.affiliateClick.count({
        where: {
          ...createdAtWhere,

          articleId: {
            not:
              null,
          },
        },
      }),

      prisma.affiliateClick.count({
        where: {
          ...createdAtWhere,

          articleId: {
            not:
              null,
          },

          placementKey: {
            not:
              null,
          },
        },
      }),

      prisma.articlePageView.groupBy({
        by: [
          "articleId",
        ],

        where:
          createdAtWhere,

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
          20,
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "articleId",
        ],

        where: {
          ...createdAtWhere,

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

      prisma.productImpression.groupBy({
        by: [
          "articleId",
          "productId",
          "placementKey",
          "placementType",
          "position",
        ],

        where:
          createdAtWhere,

        _count: {
          _all:
            true,
        },

        orderBy: {
          _count: {
            placementKey:
              "desc",
          },
        },

        take:
          30,
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "articleId",
          "productId",
          "placementKey",
        ],

        where: {
          ...createdAtWhere,

          articleId: {
            not:
              null,
          },

          productId: {
            not:
              null,
          },

          placementKey: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },
      }),
    ]);


  const articleIds =
    Array.from(
      new Set(
        [
          ...articleViewGroups.map(
            (
              item
            ) =>
              item.articleId
          ),

          ...placementImpressionGroups.map(
            (
              item
            ) =>
              item.articleId
          ),
        ]
      )
    );


  const productIds =
    Array.from(
      new Set(
        placementImpressionGroups.map(
          (
            item
          ) =>
            item.productId
        )
      )
    );


  const [
    articles,
    products,
  ] =
    await Promise.all([
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
            },
          })
        : Promise.resolve(
            []
          ),

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
    ]);


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


  const articleClickMap =
    new Map(
      articleClickGroups
        .filter(
          (
            item
          ) =>
            Boolean(
              item.articleId
            )
        )
        .map(
          (
            item
          ) => [
            item.articleId as string,
            item._count._all,
          ]
        )
    );


  const placementClickMap =
    new Map(
      placementClickGroups
        .filter(
          (
            item
          ) =>
            Boolean(
              item.articleId &&
              item.productId &&
              item.placementKey
            )
        )
        .map(
          (
            item
          ) => [
            `${item.articleId}:${item.productId}:${item.placementKey}`,
            item._count._all,
          ]
        )
    );


  const articleRows =
    articleViewGroups.map(
      (
        item
      ) => {
        const article =
          articleMap.get(
            item.articleId
          );

        const clicks =
          articleClickMap.get(
            item.articleId
          ) ??
          0;

        return {
          id:
            item.articleId,

          title:
            article?.title ??
            "Unknown article",

          slug:
            article?.slug ??
            null,

          views:
            item._count._all,

          clicks,

          ctr:
            percentage(
              clicks,
              item._count._all
            ),
        };
      }
    );


  const placementRows =
    placementImpressionGroups.map(
      (
        item
      ) => {
        const article =
          articleMap.get(
            item.articleId
          );

        const product =
          productMap.get(
            item.productId
          );

        const clicks =
          placementClickMap.get(
            `${item.articleId}:${item.productId}:${item.placementKey}`
          ) ??
          0;

        return {
          key:
            `${item.articleId}:${item.productId}:${item.placementKey}`,

          articleTitle:
            article?.title ??
            "Unknown article",

          articleSlug:
            article?.slug ??
            null,

          productName:
            product?.name ??
            "Unknown product",

          productSlug:
            product?.slug ??
            null,

          placementType:
            item.placementType,

          position:
            item.position,

          impressions:
            item._count._all,

          clicks,

          ctr:
            percentage(
              clicks,
              item._count._all
            ),
        };
      }
    );


  const articleCtr =
    percentage(
      editorialRetailerClicks,
      articleViews
    );

  const placementCtr =
    percentage(
      placementRetailerClicks,
      productImpressions
    );


  const ranges: {
    key:
      RangeKey;

    label:
      string;
  }[] = [
    {
      key:
        "7d",
      label:
        "Last 7 days",
    },
    {
      key:
        "30d",
      label:
        "Last 30 days",
    },
    {
      key:
        "all",
      label:
        "All time",
    },
  ];


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Analytics / Funnel
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Editorial funnel
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Measure the path from article reading to visible product
              recommendations and outbound retailer clicks. These metrics
              describe click-through behavior, not purchases or revenue.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/analytics"
              className="admin-secondary"
            >
              Affiliate analytics
            </Link>

            <Link
              href="/admin/analytics/growth"
              className="admin-secondary"
            >
              Growth intelligence
            </Link>

            <Link
              href="/admin"
              className="admin-primary"
            >
              Admin home
            </Link>

          </div>

        </div>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-4">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Reporting period
              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Funnel measurement uses data collected after Phase 9.6 tracking was enabled.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              {ranges.map(
                (
                  item
                ) => (

                  <Link
                    key={
                      item.key
                    }
                    href={`/admin/analytics/funnel?range=${item.key}`}
                    className={
                      range ===
                      item.key
                        ? "admin-primary"
                        : "admin-secondary"
                    }
                  >
                    {item.label}
                  </Link>

                )
              )}

            </div>

          </div>

        </section>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            label="Article views"
            value={
              articleViews
            }
            helper="Deduplicated article pageviews"
          />

          <MetricCard
            label="Product impressions"
            value={
              productImpressions
            }
            helper="Recommendations actually seen"
          />

          <MetricCard
            label="Editorial retailer clicks"
            value={
              editorialRetailerClicks
            }
            helper={`${articleCtr}% article → retailer CTR`}
          />

          <MetricCard
            label="Placement retailer clicks"
            value={
              placementRetailerClicks
            }
            helper={`${placementCtr}% impression → retailer CTR`}
          />

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Funnel overview
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            View → impression → retailer click
          </h2>


          <div className="mt-8 grid gap-4 md:grid-cols-3">

            <FunnelStep
              step="01"
              label="Article views"
              value={
                articleViews
              }
              helper="A reader opened a published article."
            />

            <FunnelStep
              step="02"
              label="Product impressions"
              value={
                productImpressions
              }
              helper="A product placement reached the visibility threshold."
            />

            <FunnelStep
              step="03"
              label="Retailer clicks"
              value={
                placementRetailerClicks
              }
              helper="A retailer click preserved a specific placement identity."
            />

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Article CTR
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Which stories turn readers into retailer visitors?
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Article CTR = retailer clicks attributed to the article ÷ article pageviews.
          </p>


          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[720px] text-left text-sm">

              <thead>

                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">

                  <th className="py-3 pr-4">
                    Article
                  </th>

                  <th className="px-4 py-3 text-right">
                    Views
                  </th>

                  <th className="px-4 py-3 text-right">
                    Retailer clicks
                  </th>

                  <th className="py-3 pl-4 text-right">
                    CTR
                  </th>

                </tr>

              </thead>


              <tbody>

                {articleRows.length >
                0 ? (

                  articleRows.map(
                    (
                      row
                    ) => (

                      <tr
                        key={
                          row.id
                        }
                        className="border-b border-[var(--line)]"
                      >

                        <td className="py-4 pr-4">

                          {row.slug ? (

                            <Link
                              href={`/articles/${row.slug}`}
                              target="_blank"
                              className="font-medium hover:underline"
                            >
                              {row.title}
                            </Link>

                          ) : (

                            <span className="font-medium">
                              {row.title}
                            </span>

                          )}

                        </td>

                        <td className="px-4 py-4 text-right">
                          {row.views}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {row.clicks}
                        </td>

                        <td className="py-4 pl-4 text-right font-semibold">
                          {row.ctr}%
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={
                        4
                      }
                      className="py-8 text-center text-[var(--muted)]"
                    >
                      No article-view data is available for this period.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Placement CTR
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Which visible recommendations lead to retailer clicks?
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Placement CTR = retailer clicks carrying that exact placement key ÷
            visible product impressions for the same article/product placement.
          </p>


          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[980px] text-left text-sm">

              <thead>

                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">

                  <th className="py-3 pr-4">
                    Article
                  </th>

                  <th className="px-4 py-3">
                    Product
                  </th>

                  <th className="px-4 py-3">
                    Placement
                  </th>

                  <th className="px-4 py-3 text-right">
                    Impressions
                  </th>

                  <th className="px-4 py-3 text-right">
                    Retailer clicks
                  </th>

                  <th className="py-3 pl-4 text-right">
                    CTR
                  </th>

                </tr>

              </thead>


              <tbody>

                {placementRows.length >
                0 ? (

                  placementRows.map(
                    (
                      row
                    ) => (

                      <tr
                        key={
                          row.key
                        }
                        className="border-b border-[var(--line)]"
                      >

                        <td className="py-4 pr-4">

                          {row.articleSlug ? (

                            <Link
                              href={`/articles/${row.articleSlug}`}
                              target="_blank"
                              className="font-medium hover:underline"
                            >
                              {row.articleTitle}
                            </Link>

                          ) : (
                            row.articleTitle
                          )}

                        </td>

                        <td className="px-4 py-4">

                          {row.productSlug ? (

                            <Link
                              href={`/products/${row.productSlug}`}
                              target="_blank"
                              className="font-medium hover:underline"
                            >
                              {row.productName}
                            </Link>

                          ) : (
                            row.productName
                          )}

                        </td>

                        <td className="px-4 py-4 text-[var(--muted)]">
                          {row.placementType} · block {row.position + 1}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {row.impressions}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {row.clicks}
                        </td>

                        <td className="py-4 pl-4 text-right font-semibold">
                          {row.ctr}%
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={
                        6
                      }
                      className="py-8 text-center text-[var(--muted)]"
                    >
                      No product-impression data is available for this period.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Interpretation
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Read CTR as intent, not conversion.
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            A higher CTR means more readers continued from Venuvella toward a retailer.
            It does not prove a purchase, revenue contribution or provider conversion rate.
            Placement metrics begin only after placement-key tracking is deployed, so older
            affiliate clicks cannot be retroactively assigned to a specific product block.
          </p>

        </section>

      </div>

    </main>
  );
}


function MetricCard({
  label,
  value,
  helper,
}: {
  label:
    string;

  value:
    number;

  helper:
    string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        {label}
      </p>

      <p className="mt-4 text-4xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {helper}
      </p>

    </div>
  );
}


function FunnelStep({
  step,
  label,
  value,
  helper,
}: {
  step:
    string;

  label:
    string;

  value:
    number;

  helper:
    string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Step {step}
      </p>

      <p className="mt-3 text-lg font-semibold">
        {label}
      </p>

      <p className="mt-3 text-4xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
        {helper}
      </p>

    </div>
  );
}
