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


type RangeKey =
  "7d" |
  "30d" |
  "all";


type Priority =
  "High" |
  "Medium" |
  "Maintain";


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


function percentNumber(
  numerator: number,
  denominator: number
) {
  if (
    denominator <=
    0
  ) {
    return 0;
  }

  return (
    numerator /
    denominator
  ) * 100;
}


function formatPercent(
  value: number
) {
  return `${value.toFixed(1)}%`;
}


export default async function FunnelRecommendationsPage({
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
    articleViewGroups,
    articleClickGroups,
    impressionGroups,
    placementClickGroups,
    articleViewSessions,
    impressionSessions,
  ] =
    await sequential([
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

      prisma.articlePageView.groupBy({
        by: [
          "articleId",
          "sessionHash",
        ],

        where: {
          ...createdAtWhere,

          sessionHash: {
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
          "sessionHash",
        ],

        where: {
          ...createdAtWhere,

          sessionHash: {
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

          ...impressionGroups.map(
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
        impressionGroups.map(
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
    await sequential([
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


  const pageviewSessionCountByArticle =
    new Map<string, number>();


  articleViewSessions.forEach(
    (
      item
    ) => {
      pageviewSessionCountByArticle.set(
        item.articleId,
        (
          pageviewSessionCountByArticle.get(
            item.articleId
          ) ??
          0
        ) +
          1
      );
    }
  );


  const impressionSessionCountByArticle =
    new Map<string, number>();


  impressionSessions.forEach(
    (
      item
    ) => {
      impressionSessionCountByArticle.set(
        item.articleId,
        (
          impressionSessionCountByArticle.get(
            item.articleId
          ) ??
          0
        ) +
          1
      );
    }
  );


  const articleImpressionCountMap =
    new Map<string, number>();


  impressionGroups.forEach(
    (
      item
    ) => {
      articleImpressionCountMap.set(
        item.articleId,
        (
          articleImpressionCountMap.get(
            item.articleId
          ) ??
          0
        ) +
          item._count._all
      );
    }
  );


  const articleRows =
    articleViewGroups
      .map(
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

          const impressions =
            articleImpressionCountMap.get(
              item.articleId
            ) ??
            0;

          const pageviewSessions =
            pageviewSessionCountByArticle.get(
              item.articleId
            ) ??
            0;

          const impressionSessionsCount =
            impressionSessionCountByArticle.get(
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

            updatedAt:
              article?.updatedAt ??
              null,

            views:
              item._count._all,

            impressions,

            clicks,

            ctr:
              percentNumber(
                clicks,
                item._count._all
              ),

            reachRate:
              percentNumber(
                impressionSessionsCount,
                pageviewSessions
              ),

            pageviewSessions,

            impressionSessions:
              impressionSessionsCount,
          };
        }
      )
      .sort(
        (
          left,
          right
        ) =>
          right.views -
          left.views
      );


  const placementRows =
    impressionGroups
      .map(
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
              percentNumber(
                clicks,
                item._count._all
              ),
          };
        }
      );


  /*
   * Minimum sample sizes keep the recommendations from
   * overreacting to one or two visits.
   */
  const MIN_ARTICLE_VIEWS =
    10;

  const MIN_PLACEMENT_IMPRESSIONS =
    10;


  const eligibleArticleRows =
    articleRows.filter(
      (
        item
      ) =>
        item.views >=
        MIN_ARTICLE_VIEWS
    );


  const eligiblePlacementRows =
    placementRows.filter(
      (
        item
      ) =>
        item.impressions >=
        MIN_PLACEMENT_IMPRESSIONS
    );


  const averageEligibleArticleCtr =
    eligibleArticleRows.length >
    0
      ? eligibleArticleRows.reduce(
          (
            total,
            item
          ) =>
            total +
            item.ctr,
          0
        ) /
        eligibleArticleRows.length
      : 0;


  const averageEligiblePlacementCtr =
    eligiblePlacementRows.length >
    0
      ? eligiblePlacementRows.reduce(
          (
            total,
            item
          ) =>
            total +
            item.ctr,
          0
        ) /
        eligiblePlacementRows.length
      : 0;


  const highTrafficLowCtr =
    eligibleArticleRows
      .filter(
        (
          item
        ) =>
          item.ctr <
          averageEligibleArticleCtr
      )
      .sort(
        (
          left,
          right
        ) =>
          right.views -
          left.views
      )
      .slice(
        0,
        6
      );


  const strongArticles =
    eligibleArticleRows
      .filter(
        (
          item
        ) =>
          item.ctr >=
          averageEligibleArticleCtr &&
          item.clicks >
          0
      )
      .sort(
        (
          left,
          right
        ) =>
          right.ctr -
          left.ctr
      )
      .slice(
        0,
        6
      );


  const noPlacementReach =
    articleRows
      .filter(
        (
          item
        ) =>
          item.views >=
            MIN_ARTICLE_VIEWS &&
          item.impressions ===
            0
      )
      .sort(
        (
          left,
          right
        ) =>
          right.views -
          left.views
      )
      .slice(
        0,
        6
      );


  const weakReach =
    articleRows
      .filter(
        (
          item
        ) =>
          item.pageviewSessions >=
            MIN_ARTICLE_VIEWS &&
          item.impressionSessions >
            0 &&
          item.reachRate <
            40
      )
      .sort(
        (
          left,
          right
        ) =>
          left.reachRate -
          right.reachRate
      )
      .slice(
        0,
        6
      );


  const seenNotClicked =
    eligiblePlacementRows
      .filter(
        (
          item
        ) =>
          item.clicks ===
          0
      )
      .sort(
        (
          left,
          right
        ) =>
          right.impressions -
          left.impressions
      )
      .slice(
        0,
        8
      );


  const strongPlacements =
    eligiblePlacementRows
      .filter(
        (
          item
        ) =>
          item.clicks >
            0 &&
          item.ctr >=
            averageEligiblePlacementCtr
      )
      .sort(
        (
          left,
          right
        ) =>
          right.ctr -
          left.ctr
      )
      .slice(
        0,
        8
      );


  const recommendations: {
    priority:
      Priority;

    title:
      string;

    detail:
      string;

    href:
      string;
  }[] = [];


  if (
    noPlacementReach.length >
    0
  ) {
    const top =
      noPlacementReach[0];

    recommendations.push({
      priority:
        "High",

      title:
        "Add or expose a useful product recommendation",

      detail:
        `${top.title} has ${top.views} recorded article views but no visible product impressions in this period. Check whether the story contains a relevant product block and whether readers can reasonably reach it.`,

      href:
        "/admin/articles",
    });
  }


  if (
    highTrafficLowCtr.length >
    0
  ) {
    const top =
      highTrafficLowCtr[0];

    recommendations.push({
      priority:
        "High",

      title:
        "Review a high-traffic, below-baseline article",

      detail:
        `${top.title} has ${top.views} views and ${formatPercent(top.ctr)} article-to-retailer CTR, below the ${formatPercent(averageEligibleArticleCtr)} average among articles with at least ${MIN_ARTICLE_VIEWS} views.`,

      href:
        top.slug
          ? `/articles/${top.slug}`
          : "/admin/articles",
    });
  }


  if (
    seenNotClicked.length >
    0
  ) {
    const top =
      seenNotClicked[0];

    recommendations.push({
      priority:
        "Medium",

      title:
        "Reconsider a visible recommendation that gets no retailer clicks",

      detail:
        `${top.productName} in ${top.articleTitle} was seen ${top.impressions} times but produced no placement-attributed retailer clicks. Review relevance, copy, product fit and destination quality before adding more exposure.`,

      href:
        top.articleSlug
          ? `/articles/${top.articleSlug}`
          : "/admin/articles",
    });
  }


  if (
    weakReach.length >
    0
  ) {
    const top =
      weakReach[0];

    recommendations.push({
      priority:
        "Medium",

      title:
        "Readers may not be reaching the recommendation",

      detail:
        `Only ${formatPercent(top.reachRate)} of tracked article-view sessions for ${top.title} produced at least one product impression. Consider placement position and article flow before changing the product itself.`,

      href:
        top.slug
          ? `/articles/${top.slug}`
          : "/admin/articles",
    });
  }


  if (
    strongPlacements.length >
    0
  ) {
    const top =
      strongPlacements[0];

    recommendations.push({
      priority:
        "Maintain",

      title:
        "Protect a strong product placement",

      detail:
        `${top.productName} in ${top.articleTitle} has ${top.impressions} impressions and ${formatPercent(top.ctr)} placement CTR. Keep the recommendation accurate, available and contextually useful.`,

      href:
        top.articleSlug
          ? `/articles/${top.articleSlug}`
          : "/admin/articles",
    });
  }


  if (
    strongArticles.length >
    0
  ) {
    const top =
      strongArticles[0];

    recommendations.push({
      priority:
        "Maintain",

      title:
        "Study a strong article pattern",

      detail:
        `${top.title} currently has ${formatPercent(top.ctr)} article-to-retailer CTR from ${top.views} views. Use its product relevance and editorial structure as a reference, not as a template to copy mechanically.`,

      href:
        top.slug
          ? `/articles/${top.slug}`
          : "/admin/articles",
    });
  }


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
              Analytics / Funnel / Optimization
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Funnel recommendations
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Turn article views, visible product impressions and retailer clicks
              into practical editorial actions. Recommendations are directional
              and use minimum sample sizes to reduce overreaction to tiny datasets.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/analytics/funnel"
              className="admin-secondary"
            >
              Funnel dashboard
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
                Article recommendations require at least {MIN_ARTICLE_VIEWS} views;
                placement recommendations require at least {MIN_PLACEMENT_IMPRESSIONS} impressions.
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
                    href={`/admin/analytics/funnel/recommendations?range=${item.key}`}
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


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Action queue
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            What to work on next
          </h2>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {recommendations.length >
            0 ? (

              recommendations.map(
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

                    <div className="flex items-start justify-between gap-4">

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

              <div className="md:col-span-2 rounded-xl border border-dashed border-[var(--line)] p-6">

                <p className="font-medium">
                  More data is needed.
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  The tracking system is working, but there is not yet enough
                  qualifying article or placement activity to create reliable recommendations.
                </p>

              </div>

            )}

          </div>

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <ArticleSignalPanel
            eyebrow="Opportunity"
            title="High traffic, below-baseline CTR"
            description="Articles with enough views to evaluate, but lower retailer-click-through than the current eligible-article average."
            rows={
              highTrafficLowCtr
            }
            empty="No qualifying below-baseline articles."
          />


          <ArticleSignalPanel
            eyebrow="Maintain"
            title="Strong article CTR"
            description="Eligible articles at or above the current article CTR baseline with at least one retailer click."
            rows={
              strongArticles
            }
            empty="No qualifying strong article CTR signals yet."
          />

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <ArticleSignalPanel
            eyebrow="Reach problem"
            title="Views without product impressions"
            description="These articles have enough recorded views to evaluate but no visible product impressions in the selected period."
            rows={
              noPlacementReach
            }
            empty="No qualifying articles have a complete product-impression gap."
          />


          <ReachPanel
            rows={
              weakReach
            }
          />

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <PlacementPanel
            eyebrow="Opportunity"
            title="Seen but not clicked"
            description="Visible placements with enough impressions to evaluate but no placement-attributed retailer clicks."
            rows={
              seenNotClicked
            }
            empty="No qualifying zero-click placements."
          />


          <PlacementPanel
            eyebrow="Maintain"
            title="Strong placement CTR"
            description="Placements at or above the eligible-placement CTR baseline with recorded retailer clicks."
            rows={
              strongPlacements
            }
            empty="No qualifying strong placement signals yet."
          />

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Current baselines
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Context for the recommendations
          </h2>


          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <BaselineCard
              label="Eligible articles"
              value={
                eligibleArticleRows.length
              }
              helper={`At least ${MIN_ARTICLE_VIEWS} views`}
            />

            <BaselineCard
              label="Article CTR baseline"
              value={
                formatPercent(
                  averageEligibleArticleCtr
                )
              }
              helper="Average across eligible articles"
            />

            <BaselineCard
              label="Eligible placements"
              value={
                eligiblePlacementRows.length
              }
              helper={`At least ${MIN_PLACEMENT_IMPRESSIONS} impressions`}
            />

            <BaselineCard
              label="Placement CTR baseline"
              value={
                formatPercent(
                  averageEligiblePlacementCtr
                )
              }
              helper="Average across eligible placements"
            />

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Interpretation
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Optimize editorial usefulness, not clicks alone.
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            These signals are based on article views, visible product impressions
            and outbound retailer clicks. A recommendation can help you decide what
            to inspect, but it does not prove a purchase, revenue contribution or
            causal effect. Review editorial relevance and destination quality before
            changing placement frequency or product selection.
          </p>

        </section>

      </div>

    </main>
  );
}


function PriorityBadge({
  value,
}: {
  value:
    Priority;
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
    <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${className}`}>
      {value}
    </span>
  );
}


function ArticleSignalPanel({
  eyebrow,
  title,
  description,
  rows,
  empty,
}: {
  eyebrow:
    string;

  title:
    string;

  description:
    string;

  rows: Array<{
    id:
      string;

    title:
      string;

    slug:
      string |
      null;

    views:
      number;

    impressions:
      number;

    clicks:
      number;

    ctr:
      number;

    reachRate:
      number;
  }>;

  empty:
    string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        {eyebrow}
      </p>

      <h2 className="display-serif mt-2 text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>


      <div className="mt-6 divide-y divide-[var(--line)]">

        {rows.length >
        0 ? (

          rows.map(
            (
              row
            ) => (

              <div
                key={
                  row.id
                }
                className="py-4"
              >

                {row.slug ? (

                  <Link
                    href={`/articles/${row.slug}`}
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {row.title}
                  </Link>

                ) : (

                  <p className="font-medium">
                    {row.title}
                  </p>

                )}


                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">

                  <span>
                    {row.views} views
                  </span>

                  <span>
                    {row.impressions} impressions
                  </span>

                  <span>
                    {row.clicks} retailer clicks
                  </span>

                  <span className="font-semibold text-[var(--ink)]">
                    {formatPercent(row.ctr)} CTR
                  </span>

                </div>

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


function ReachPanel({
  rows,
}: {
  rows: Array<{
    id:
      string;

    title:
      string;

    slug:
      string |
      null;

    pageviewSessions:
      number;

    impressionSessions:
      number;

    reachRate:
      number;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        Placement reach
      </p>

      <h2 className="display-serif mt-2 text-3xl">
        Readers may not reach the product block
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Uses unique anonymous session hashes. This is a stronger reach signal than
        comparing raw pageviews with raw impressions, because one reader may see multiple products.
      </p>


      <div className="mt-6 divide-y divide-[var(--line)]">

        {rows.length >
        0 ? (

          rows.map(
            (
              row
            ) => (

              <div
                key={
                  row.id
                }
                className="py-4"
              >

                {row.slug ? (

                  <Link
                    href={`/articles/${row.slug}`}
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {row.title}
                  </Link>

                ) : (

                  <p className="font-medium">
                    {row.title}
                  </p>

                )}


                <p className="mt-2 text-xs text-[var(--muted)]">
                  {row.impressionSessions} of {row.pageviewSessions} tracked reader sessions reached at least one product placement ·{" "}
                  <span className="font-semibold text-[var(--ink)]">
                    {formatPercent(row.reachRate)}
                  </span>
                </p>

              </div>

            )
          )

        ) : (

          <p className="py-4 text-sm text-[var(--muted)]">
            No qualifying low-reach article signals.
          </p>

        )}

      </div>

    </div>
  );
}


function PlacementPanel({
  eyebrow,
  title,
  description,
  rows,
  empty,
}: {
  eyebrow:
    string;

  title:
    string;

  description:
    string;

  rows: Array<{
    key:
      string;

    articleTitle:
      string;

    articleSlug:
      string |
      null;

    productName:
      string;

    productSlug:
      string |
      null;

    placementType:
      string;

    position:
      number;

    impressions:
      number;

    clicks:
      number;

    ctr:
      number;
  }>;

  empty:
    string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        {eyebrow}
      </p>

      <h2 className="display-serif mt-2 text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>


      <div className="mt-6 divide-y divide-[var(--line)]">

        {rows.length >
        0 ? (

          rows.map(
            (
              row
            ) => (

              <div
                key={
                  row.key
                }
                className="py-4"
              >

                <p className="font-medium">
                  {row.productSlug ? (

                    <Link
                      href={`/products/${row.productSlug}`}
                      target="_blank"
                      className="hover:underline"
                    >
                      {row.productName}
                    </Link>

                  ) : (
                    row.productName
                  )}
                </p>


                <p className="mt-1 text-xs text-[var(--muted)]">
                  In{" "}
                  {row.articleSlug ? (

                    <Link
                      href={`/articles/${row.articleSlug}`}
                      target="_blank"
                      className="font-medium text-[var(--ink)] hover:underline"
                    >
                      {row.articleTitle}
                    </Link>

                  ) : (
                    row.articleTitle
                  )}
                  {" "}· {row.placementType} · block {row.position + 1}
                </p>


                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">

                  <span>
                    {row.impressions} impressions
                  </span>

                  <span>
                    {row.clicks} retailer clicks
                  </span>

                  <span className="font-semibold text-[var(--ink)]">
                    {formatPercent(row.ctr)} CTR
                  </span>

                </div>

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


function BaselineCard({
  label,
  value,
  helper,
}: {
  label:
    string;

  value:
    string |
    number;

  helper:
    string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {helper}
      </p>

    </div>
  );
}
