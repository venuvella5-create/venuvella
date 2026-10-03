import Link from "next/link";

import { prisma } from "@/lib/db/prisma";

import { requirePageRole } from "@/lib/auth/require-admin";

export const dynamic =

  "force-dynamic";

type AnalyticsRange =

  | "today"

  | "7d"

  | "30d"

  | "all";

type DailyTrend = {

  date: string;

  label: string;

  clicks: number;

};

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

function getRangeStart(

  range: AnalyticsRange

) {

  const today =

    startOfDay(

      new Date()

    );

  if (range === "today") {

    return today;

  }

  if (range === "7d") {

    const start =

      new Date(today);

    start.setDate(

      start.getDate() - 6

    );

    return start;

  }

  if (range === "30d") {

    const start =

      new Date(today);

    start.setDate(

      start.getDate() - 29

    );

    return start;

  }

  return null;

}

function getRangeLabel(

  range: AnalyticsRange

) {

  if (range === "today") {

    return "Today";

  }

  if (range === "7d") {

    return "Last 7 days";

  }

  if (range === "30d") {

    return "Last 30 days";

  }

  return "All time";

}

function formatDateKey(

  date: Date

) {

  const year =

    date.getFullYear();

  const month =

    String(

      date.getMonth() + 1

    ).padStart(

      2,

      "0"

    );

  const day =

    String(

      date.getDate()

    ).padStart(

      2,

      "0"

    );

  return `${year}-${month}-${day}`;

}

function formatShortDate(

  date: Date

) {

  return date.toLocaleDateString(

    "en-US",

    {

      month: "short",

      day: "numeric",

    }

  );

}

function buildDailyTrend(

  clickDates: Date[],

  startDate: Date | null

): DailyTrend[] {

  if (

    clickDates.length === 0

  ) {

    return [];

  }

  let firstDate: Date;

  if (startDate) {

    firstDate =

      startOfDay(

        startDate

      );

  } else {

    const sorted =

      [...clickDates].sort(

        (a, b) =>

          a.getTime() -

          b.getTime()

      );

    firstDate =

      startOfDay(

        sorted[0]

      );

  }

  const lastDate =

    startOfDay(

      new Date()

    );

  const counts =

    new Map<

      string,

      number

    >();

  for (

    const createdAt

    of clickDates

  ) {

    const key =

      formatDateKey(

        createdAt

      );

    counts.set(

      key,

      (

        counts.get(key) ??

        0

      ) + 1

    );

  }

  const trend:

    DailyTrend[] = [];

  const cursor =

    new Date(

      firstDate

    );

  while (

    cursor <= lastDate

  ) {

    const key =

      formatDateKey(

        cursor

      );

    trend.push({

      date:

        key,

      label:

        formatShortDate(

          cursor

        ),

      clicks:

        counts.get(key) ??

        0,

    });

    cursor.setDate(

      cursor.getDate() + 1

    );

  }

  return trend;

}

function getReferrerLabel(

  referrer: string | null

) {

  if (!referrer) {

    return "Direct / unknown";

  }

  try {

    const url =

      new URL(

        referrer

      );

    return url.hostname.replace(

      /^www\./,

      ""

    );

  } catch {

    return referrer;

  }

}

function percentage(

  value: number,

  total: number

) {

  if (total <= 0) {

    return "0.0";

  }

  return (

    (

      value /

      total

    ) *

    100

  ).toFixed(1);

}

type ComparisonResult = {
  label: string;
  className: string;
};

function getPreviousRangeStart(
  range: AnalyticsRange,
  currentStart: Date
) {
  const previousStart = new Date(currentStart);

  if (range === "today") {
    previousStart.setDate(previousStart.getDate() - 1);
    return previousStart;
  }

  if (range === "7d") {
    previousStart.setDate(previousStart.getDate() - 7);
    return previousStart;
  }

  if (range === "30d") {
    previousStart.setDate(previousStart.getDate() - 30);
    return previousStart;
  }

  return null;
}

function getPreviousRangeLabel(
  range: AnalyticsRange
) {
  if (range === "today") {
    return "yesterday";
  }

  if (range === "7d") {
    return "the previous 7 days";
  }

  if (range === "30d") {
    return "the previous 30 days";
  }

  return null;
}

function getComparison(
  current: number,
  previous: number | null
): ComparisonResult {
  if (previous === null) {
    return {
      label: "No comparison period",
      className: "text-[var(--muted)]",
    };
  }

  if (previous === 0) {
    if (current === 0) {
      return {
        label: "No change",
        className: "text-[var(--muted)]",
      };
    }

    return {
      label: "New activity",
      className: "text-emerald-700",
    };
  }

  const change = ((current - previous) / previous) * 100;

  if (Math.abs(change) < 0.05) {
    return {
      label: "0.0%",
      className: "text-[var(--muted)]",
    };
  }

  if (change > 0) {
    return {
      label: `↑ ${change.toFixed(1)}%`,
      className: "text-emerald-700",
    };
  }

  return {
    label: `↓ ${Math.abs(change).toFixed(1)}%`,
    className: "text-rose-700",
  };
}

export default async function AnalyticsPage({

  searchParams,

}: {

  searchParams: Promise<{

    range?: string;

  }>;

}) {

    await requirePageRole([

    "ADMIN",

    "ANALYST",

  ]);

const params =

    await searchParams;

  const allowedRanges:

    AnalyticsRange[] = [

      "today",

      "7d",

      "30d",

      "all",

    ];

  const requestedRange =

    params.range ??

    "30d";

  const range:

    AnalyticsRange =

    allowedRanges.includes(

      requestedRange as AnalyticsRange

    )

      ? requestedRange as AnalyticsRange

      : "30d";

  const startDate =

    getRangeStart(

      range

    );

  const previousStartDate =
    startDate
      ? getPreviousRangeStart(
          range,
          startDate
        )
      : null;

  const previousRangeLabel =
    getPreviousRangeLabel(
      range
    );

  const previousClickWhere =
    startDate &&
    previousStartDate
      ? {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        }
      : null;

  const clickWhere =

    startDate

      ? {

          createdAt: {

            gte:

              startDate,

          },

        }

      : {};

  const [

    totalClicks,

    providerGroups,

    productGroups,

    articleGroups,

    referrerGroups,

    utmSourceGroups,

    utmMediumGroups,

    utmCampaignGroups,

    campaignGroups,

    recentClicks,

    desktopClicks,

    mobileClicks,

    tabletClicks,

    editorialClicks,

    nonEditorialClicks,

    trendClicks,

    previousTotalClicks,

    previousDesktopClicks,

    previousMobileClicks,

    previousTabletClicks,

    previousEditorialClicks,

    previousNonEditorialClicks,

  ] = await Promise.all([

    /*

     * Total clicks

     */

    prisma.affiliateClick.count({

      where:

        clickWhere,

    }),

    /*

     * Providers

     */

    prisma.affiliateClick.groupBy({

      by: [

        "providerId",

      ],

      where: {

        ...clickWhere,

        providerId: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          providerId:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * Products

     */

    prisma.affiliateClick.groupBy({

      by: [

        "productId",

      ],

      where: {

        ...clickWhere,

        productId: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          productId:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * Articles

     */

    prisma.affiliateClick.groupBy({

      by: [

        "articleId",

      ],

      where: {

        ...clickWhere,

        articleId: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          articleId:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * Referrers

     */

    prisma.affiliateClick.groupBy({

      by: [

        "referrer",

      ],

      where:

        clickWhere,

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          referrer:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * UTM sources

     */

    prisma.affiliateClick.groupBy({

      by: [

        "utmSource",

      ],

      where: {

        ...clickWhere,

        utmSource: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          utmSource:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * UTM mediums

     */

    prisma.affiliateClick.groupBy({

      by: [

        "utmMedium",

      ],

      where: {

        ...clickWhere,

        utmMedium: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          utmMedium:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * UTM campaigns

     */

    prisma.affiliateClick.groupBy({

      by: [

        "utmCampaign",

      ],

      where: {

        ...clickWhere,

        utmCampaign: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          utmCampaign:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * Custom campaigns

     */

    prisma.affiliateClick.groupBy({

      by: [

        "campaign",

      ],

      where: {

        ...clickWhere,

        campaign: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          campaign:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * Recent activity

     */

    prisma.affiliateClick.findMany({

      where:

        clickWhere,

      orderBy: {

        createdAt:

          "desc",

      },

      take: 25,

      include: {

        product: {

          select: {

            id: true,

            name: true,

            slug: true,

          },

        },

        provider: {

          select: {

            id: true,

            name: true,

            slug: true,

          },

        },

        article: {

          select: {

            id: true,

            title: true,

            slug: true,

          },

        },

      },

    }),

    /*

     * Device counts

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        deviceType:

          "desktop",

      },

    }),

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        deviceType:

          "mobile",

      },

    }),

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        deviceType:

          "tablet",

      },

    }),

    /*

     * Editorial attribution

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        articleId: {

          not: null,

        },

      },

    }),

    /*

     * Product/direct attribution

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        articleId:

          null,

      },

    }),

    /*

     * Trend dates

     */

    prisma.affiliateClick.findMany({

      where:

        clickWhere,

      select: {

        createdAt:

          true,

      },

      orderBy: {

        createdAt:

          "asc",

      },

    }),

    previousClickWhere
      ? prisma.affiliateClick.count({
          where: previousClickWhere,
        })
      : Promise.resolve(null),

    previousClickWhere
      ? prisma.affiliateClick.count({
          where: {
            ...previousClickWhere,
            deviceType: "desktop",
          },
        })
      : Promise.resolve(null),

    previousClickWhere
      ? prisma.affiliateClick.count({
          where: {
            ...previousClickWhere,
            deviceType: "mobile",
          },
        })
      : Promise.resolve(null),

    previousClickWhere
      ? prisma.affiliateClick.count({
          where: {
            ...previousClickWhere,
            deviceType: "tablet",
          },
        })
      : Promise.resolve(null),

    previousClickWhere
      ? prisma.affiliateClick.count({
          where: {
            ...previousClickWhere,
            articleId: {
              not: null,
            },
          },
        })
      : Promise.resolve(null),

    previousClickWhere
      ? prisma.affiliateClick.count({
          where: {
            ...previousClickWhere,
            articleId: null,
          },
        })
      : Promise.resolve(null),

  ]);

  const totalClicksComparison =
    getComparison(
      totalClicks,
      previousTotalClicks
    );

  const desktopComparison =
    getComparison(
      desktopClicks,
      previousDesktopClicks
    );

  const mobileComparison =
    getComparison(
      mobileClicks,
      previousMobileClicks
    );

  const tabletComparison =
    getComparison(
      tabletClicks,
      previousTabletClicks
    );

  const editorialComparison =
    getComparison(
      editorialClicks,
      previousEditorialClicks
    );

  const nonEditorialComparison =
    getComparison(
      nonEditorialClicks,
      previousNonEditorialClicks
    );

  /*

   * Load referenced providers.

   */

  const providerIds =

    providerGroups

      .map(

        (group) =>

          group.providerId

      )

      .filter(

        (

          id

        ): id is string =>

          Boolean(id)

      );

  /*

   * Load referenced products.

   */

  const productIds =

    productGroups

      .map(

        (group) =>

          group.productId

      )

      .filter(

        (

          id

        ): id is string =>

          Boolean(id)

      );

  /*

   * Load referenced articles.

   */

  const articleIds =

    articleGroups

      .map(

        (group) =>

          group.articleId

      )

      .filter(

        (

          id

        ): id is string =>

          Boolean(id)

      );

  const [

    providers,

    products,

    articles,

  ] = await Promise.all([

    providerIds.length > 0

      ? prisma.affiliateProvider.findMany({

          where: {

            id: {

              in:

                providerIds,

            },

          },

          select: {

            id: true,

            name: true,

            slug: true,

          },

        })

      : Promise.resolve(

          []

        ),

    productIds.length > 0

      ? prisma.product.findMany({

          where: {

            id: {

              in:

                productIds,

            },

          },

          select: {

            id: true,

            name: true,

            slug: true,

          },

        })

      : Promise.resolve(

          []

        ),

    articleIds.length > 0

      ? prisma.article.findMany({

          where: {

            id: {

              in:

                articleIds,

            },

          },

          select: {

            id: true,

            title: true,

            slug: true,

          },

        })

      : Promise.resolve(

          []

        ),

  ]);

  const providerMap =

    new Map(

      providers.map(

        (provider) => [

          provider.id,

          provider,

        ]

      )

    );

  const productMap =

    new Map(

      products.map(

        (product) => [

          product.id,

          product,

        ]

      )

    );

  const articleMap =

    new Map(

      articles.map(

        (article) => [

          article.id,

          article,

        ]

      )

    );

  /*

   * Click trend.

   */

  const dailyTrend =

    buildDailyTrend(

      trendClicks.map(

        (click) =>

          click.createdAt

      ),

      startDate

    );

  const maxDailyClicks =

    Math.max(

      1,

      ...dailyTrend.map(

        (item) =>

          item.clicks

      )

    );

  const averageDailyClicks =

    dailyTrend.length > 0

      ? totalClicks /

        dailyTrend.length

      : 0;

  const peakDay =

    dailyTrend.length > 0

      ? dailyTrend.reduce(

          (

            highest,

            current

          ) =>

            current.clicks >

            highest.clicks

              ? current

              : highest

        )

      : null;

  /*

   * Range navigation.

   */

  const ranges: {

    key: AnalyticsRange;

    label: string;

  }[] = [

    {

      key:

        "today",

      label:

        "Today",

    },

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

        {/* Header */}

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">

              Analytics / Affiliate

            </p>

            <h1 className="display-serif mt-2 text-5xl">

              Affiliate analytics

            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">

              Understand outbound clicks,

              product performance,

              provider performance,

              editorial attribution and

              marketing campaign traffic.

            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Link

              href="/admin/products"

              className="admin-secondary"

            >

              Products

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

        {/* Reporting range */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-4">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <p className="admin-eyebrow">

                Reporting period

              </p>

              <p className="mt-1 text-sm text-[var(--muted)]">

                Showing analytics for{" "}

                <span className="font-medium text-[var(--ink)]">

                  {

                    getRangeLabel(

                      range

                    )

                  }

                </span>

              </p>

              {previousRangeLabel && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Compared with {previousRangeLabel}.
                </p>
              )}

            </div>

            <div className="flex flex-wrap gap-2">

              {ranges.map(

                (item) => (

                  <Link

                    key={

                      item.key

                    }

                    href={`/admin/analytics?range=${item.key}`}

                    className={

                      item.key ===

                      range

                        ? "admin-primary"

                        : "admin-secondary"

                    }

                  >

                    {

                      item.label

                    }

                  </Link>

                )

              )}

            </div>

          </div>

        </section>

        {/* Main KPI cards */}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Total clicks

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {totalClicks}

            </p>

            {previousRangeLabel && (
              <p className={`mt-3 text-xs font-semibold ${totalClicksComparison.className}`}>
                {totalClicksComparison.label} vs {previousRangeLabel}
              </p>
            )}

          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Desktop

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {desktopClicks}

            </p>

            {previousRangeLabel && (
              <p className={`mt-3 text-xs font-semibold ${desktopComparison.className}`}>
                {desktopComparison.label} vs {previousRangeLabel}
              </p>
            )}

          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Mobile

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {mobileClicks}

            </p>

            {previousRangeLabel && (
              <p className={`mt-3 text-xs font-semibold ${mobileComparison.className}`}>
                {mobileComparison.label} vs {previousRangeLabel}
              </p>
            )}

          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Tablet

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {tabletClicks}

            </p>

            {previousRangeLabel && (
              <p className={`mt-3 text-xs font-semibold ${tabletComparison.className}`}>
                {tabletComparison.label} vs {previousRangeLabel}
              </p>
            )}

          </div>

        </section>

        {/* Attribution KPI */}

        <section className="mt-4 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Editorial attribution

            </p>

            <div className="mt-4 flex items-end justify-between gap-6">

              <div>

                <p className="text-4xl font-semibold tracking-tight">

                  {

                    editorialClicks

                  }

                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">

                  Clicks attributed to articles

                </p>

              </div>

              <p className="text-2xl font-semibold">

                {

                  percentage(

                    editorialClicks,

                    totalClicks

                  )

                }

                %

              </p>

            </div>

          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Product / direct

            </p>

            <div className="mt-4 flex items-end justify-between gap-6">

              <div>

                <p className="text-4xl font-semibold tracking-tight">

                  {

                    nonEditorialClicks

                  }

                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">

                  Clicks without article attribution

                </p>

              </div>

              <p className="text-2xl font-semibold">

                {

                  percentage(

                    nonEditorialClicks,

                    totalClicks

                  )

                }

                %

              </p>

            </div>

          </div>

        </section>

        {previousRangeLabel && (
          <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="admin-eyebrow">
                  Period comparison
                </p>

                <h2 className="display-serif mt-2 text-3xl">
                  Current vs previous period
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Directional click changes compared with {previousRangeLabel}.
                </p>
              </div>

              <p className="text-xs text-[var(--muted)]">
                Positive change indicates more outbound clicks, not confirmed sales or revenue.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Total clicks", totalClicks, previousTotalClicks, totalClicksComparison],
                ["Editorial", editorialClicks, previousEditorialClicks, editorialComparison],
                ["Product / direct", nonEditorialClicks, previousNonEditorialClicks, nonEditorialComparison],
                ["Desktop", desktopClicks, previousDesktopClicks, desktopComparison],
                ["Mobile", mobileClicks, previousMobileClicks, mobileComparison],
                ["Tablet", tabletClicks, previousTabletClicks, tabletComparison],
              ].map(([label, current, previous, comparison]) => {
                const result = comparison as ComparisonResult;

                return (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {String(label)}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold">
                          {Number(current)}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Previous: {previous === null ? "—" : Number(previous)}
                        </p>
                      </div>

                      <p className={`text-sm font-semibold ${result.className}`}>
                        {result.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Click trend */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-start justify-between gap-6">

            <div>

              <p className="admin-eyebrow">

                Click trends

              </p>

              <h2 className="display-serif mt-2 text-3xl">

                Outbound clicks over time

              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">

                Daily affiliate click activity for{" "}

                {

                  getRangeLabel(

                    range

                  ).toLowerCase()

                }.

              </p>

            </div>

            <div className="flex flex-wrap gap-8">

              <div>

                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">

                  Daily average

                </p>

                <p className="mt-1 text-xl font-semibold">

                  {

                    averageDailyClicks.toFixed(

                      1

                    )

                  }

                </p>

              </div>

              <div>

                <p className="text-xs uppercase tracking-wider text-[var(--muted)]">

                  Peak day

                </p>

                <p className="mt-1 text-xl font-semibold">

                  {

                    peakDay?.clicks ??

                    0

                  }

                </p>

                {peakDay && (

                  <p className="text-xs text-[var(--muted)]">

                    {

                      peakDay.label

                    }

                  </p>

                )}

              </div>

            </div>

          </div>

          {dailyTrend.length >

          0 ? (

            <div className="mt-8 overflow-x-auto">

              <div className="flex h-72 min-w-max items-end gap-2 border-b border-[var(--line)] px-2">

                {dailyTrend.map(

                  (

                    item,

                    index

                  ) => {

                    const height =

                      item.clicks >

                      0

                        ? Math.max(

                            12,

                            Math.round(

                              (

                                item.clicks /

                                maxDailyClicks

                              ) *

                                220

                            )

                          )

                        : 4;

                    const showLabel =

                      dailyTrend.length <=

                      14

                        ? true

                        : index %

                            Math.ceil(

                              dailyTrend.length /

                                12

                            ) ===

                          0;

                    return (

                      <div

                        key={

                          item.date

                        }

                        className="flex w-10 shrink-0 flex-col items-center justify-end"

                      >

                        <div className="mb-2 text-xs font-semibold">

                          {item.clicks >

                          0

                            ? item.clicks

                            : ""}

                        </div>

                        <div

                          title={`${item.label}: ${item.clicks} clicks`}

                          className="w-7 rounded-t-md bg-black transition-opacity hover:opacity-70"

                          style={{

                            height:

                              `${height}px`,

                          }}

                        />

                        <div className="mt-2 h-10 text-center text-[10px] text-[var(--muted)]">

                          {showLabel

                            ? item.label

                            : ""}

                        </div>

                      </div>

                    );

                  }

                )}

              </div>

            </div>

          ) : (

            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-10 text-center">

              <p className="text-sm text-[var(--muted)]">

                No click trend data is available for this period.

              </p>

            </div>

          )}

        </section>

        {/* Provider + Product */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          {/* Providers */}

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Provider performance

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top providers

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {providerGroups.length >

              0 ? (

                providerGroups.map(

                  (

                    group,

                    index

                  ) => {

                    if (

                      !group.providerId

                    ) {

                      return null;

                    }

                    const provider =

                      providerMap.get(

                        group.providerId

                      );

                    return (

                      <div

                        key={

                          group.providerId

                        }

                        className="flex items-center justify-between gap-4 py-4"

                      >

                        <p className="font-medium">

                          {index + 1}.{" "}

                          {

                            provider?.name ??

                            "Unknown provider"

                          }

                        </p>

                        <strong>

                          {

                            group

                              ._count

                              ._all

                          }

                        </strong>

                      </div>

                    );

                  }

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No provider data.

                </p>

              )}

            </div>

          </div>

          {/* Products */}

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Product performance

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top products

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {productGroups.length >

              0 ? (

                productGroups.map(

                  (

                    group,

                    index

                  ) => {

                    if (

                      !group.productId

                    ) {

                      return null;

                    }

                    const product =

                      productMap.get(

                        group.productId

                      );

                    return (

                      <div

                        key={

                          group.productId

                        }

                        className="flex items-center justify-between gap-4 py-4"

                      >

                        {product ? (

                          <Link

                            href={`/products/${product.slug}`}

                            target="_blank"

                            className="font-medium hover:underline"

                          >

                            {index + 1}.{" "}

                            {

                              product.name

                            }

                          </Link>

                        ) : (

                          <p className="font-medium">

                            Unknown product

                          </p>

                        )}

                        <strong>

                          {

                            group

                              ._count

                              ._all

                          }

                        </strong>

                      </div>

                    );

                  }

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No product data.

                </p>

              )}

            </div>

          </div>

        </section>

        {/* UTM Source + Medium */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Marketing attribution

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top UTM sources

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {utmSourceGroups.length >

              0 ? (

                utmSourceGroups.map(

                  (

                    group,

                    index

                  ) => (

                    <div

                      key={

                        group.utmSource ??

                        "unknown"

                      }

                      className="flex items-center justify-between gap-4 py-4"

                    >

                      <div>

                        <p className="font-medium">

                          {index + 1}.{" "}

                          {

                            group.utmSource ??

                            "Unknown"

                          }

                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">

                          {

                            percentage(

                              group

                                ._count

                                ._all,

                              totalClicks

                            )

                          }

                          % of clicks

                        </p>

                      </div>

                      <strong>

                        {

                          group

                            ._count

                            ._all

                        }

                      </strong>

                    </div>

                  )

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No UTM source data.

                </p>

              )}

            </div>

          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Marketing attribution

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top UTM mediums

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {utmMediumGroups.length >

              0 ? (

                utmMediumGroups.map(

                  (

                    group,

                    index

                  ) => (

                    <div

                      key={

                        group.utmMedium ??

                        "unknown"

                      }

                      className="flex items-center justify-between gap-4 py-4"

                    >

                      <div>

                        <p className="font-medium">

                          {index + 1}.{" "}

                          {

                            group.utmMedium ??

                            "Unknown"

                          }

                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">

                          {

                            percentage(

                              group

                                ._count

                                ._all,

                              totalClicks

                            )

                          }

                          % of clicks

                        </p>

                      </div>

                      <strong>

                        {

                          group

                            ._count

                            ._all

                        }

                      </strong>

                    </div>

                  )

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No UTM medium data.

                </p>

              )}

            </div>

          </div>

        </section>

        {/* Campaign analytics */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Campaign attribution

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top UTM campaigns

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {utmCampaignGroups.length >

              0 ? (

                utmCampaignGroups.map(

                  (

                    group,

                    index

                  ) => (

                    <div

                      key={

                        group.utmCampaign ??

                        "unknown"

                      }

                      className="flex items-center justify-between gap-4 py-4"

                    >

                      <div>

                        <p className="font-medium">

                          {index + 1}.{" "}

                          {

                            group.utmCampaign ??

                            "Unknown"

                          }

                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">

                          {

                            percentage(

                              group

                                ._count

                                ._all,

                              totalClicks

                            )

                          }

                          % of clicks

                        </p>

                      </div>

                      <strong>

                        {

                          group

                            ._count

                            ._all

                        }

                      </strong>

                    </div>

                  )

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No UTM campaign data.

                </p>

              )}

            </div>

          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Campaign attribution

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Custom campaigns

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {campaignGroups.length >

              0 ? (

                campaignGroups.map(

                  (

                    group,

                    index

                  ) => (

                    <div

                      key={

                        group.campaign ??

                        "unknown"

                      }

                      className="flex items-center justify-between gap-4 py-4"

                    >

                      <p className="font-medium">

                        {index + 1}.{" "}

                        {

                          group.campaign ??

                          "Unknown"

                        }

                      </p>

                      <strong>

                        {

                          group

                            ._count

                            ._all

                        }

                      </strong>

                    </div>

                  )

                )

              ) : (

                <div className="py-6">

                  <p className="text-sm text-[var(--muted)]">

                    No custom campaigns recorded yet.

                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">

                    Campaign values will appear when URLs contain

                    the campaign parameter.

                  </p>

                </div>

              )}

            </div>

          </div>

        </section>

        {/* Editorial + Referrer attribution */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          {/* Articles */}

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Editorial attribution

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top articles

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {articleGroups.length >

              0 ? (

                articleGroups.map(

                  (

                    group,

                    index

                  ) => {

                    if (

                      !group.articleId

                    ) {

                      return null;

                    }

                    const article =

                      articleMap.get(

                        group.articleId

                      );

                    return (

                      <div

                        key={

                          group.articleId

                        }

                        className="flex items-center justify-between gap-6 py-4"

                      >

                        {article ? (

                          <Link

                            href={`/articles/${article.slug}`}

                            target="_blank"

                            className="font-medium hover:underline"

                          >

                            {index + 1}.{" "}

                            {

                              article.title

                            }

                          </Link>

                        ) : (

                          <p className="font-medium">

                            Unknown article

                          </p>

                        )}

                        <strong>

                          {

                            group

                              ._count

                              ._all

                          }

                        </strong>

                      </div>

                    );

                  }

                )

              ) : (

                <div className="py-6">

                  <p className="text-sm text-[var(--muted)]">

                    No article-attributed clicks yet.

                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">

                    Open an article, select an embedded product,

                    then use the affiliate CTA to test attribution.

                  </p>

                </div>

              )}

            </div>

          </div>

          {/* Referrers */}

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Traffic attribution

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top referring sources

            </h2>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {referrerGroups.length >

              0 ? (

                referrerGroups.map(

                  (

                    group,

                    index

                  ) => (

                    <div

                      key={

                        group.referrer ??

                        "direct"

                      }

                      className="flex items-center justify-between gap-6 py-4"

                    >

                      <div className="min-w-0">

                        <p className="truncate font-medium">

                          {index + 1}.{" "}

                          {

                            getReferrerLabel(

                              group.referrer

                            )

                          }

                        </p>

                        {group.referrer && (

                          <p className="mt-1 max-w-md truncate text-xs text-[var(--muted)]">

                            {

                              group.referrer

                            }

                          </p>

                        )}

                      </div>

                      <strong>

                        {

                          group

                            ._count

                            ._all

                        }

                      </strong>

                    </div>

                  )

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No referrer data.

                </p>

              )}

            </div>

          </div>

        </section>

        {/* Recent clicks */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-end justify-between gap-3">

            <div>

              <p className="admin-eyebrow">

                Activity

              </p>

              <h2 className="display-serif mt-2 text-3xl">

                Recent outbound clicks

              </h2>

            </div>

            <p className="text-xs text-[var(--muted)]">

              {

                getRangeLabel(

                  range

                )

              }

            </p>

          </div>

          {recentClicks.length >

          0 ? (

            <div className="mt-6 overflow-x-auto">

              <table className="min-w-full text-left">

                <thead>

                  <tr className="border-b border-[var(--line)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                    <th className="px-3 py-3">

                      Time

                    </th>

                    <th className="px-3 py-3">

                      Product

                    </th>

                    <th className="px-3 py-3">

                      Provider

                    </th>

                    <th className="px-3 py-3">

                      Article

                    </th>

                    <th className="px-3 py-3">

                      Source

                    </th>

                    <th className="px-3 py-3">

                      Medium

                    </th>

                    <th className="px-3 py-3">

                      Campaign

                    </th>

                    <th className="px-3 py-3">

                      Device

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentClicks.map(

                    (click) => (

                      <tr

                        key={

                          click.id

                        }

                        className="border-b border-[var(--line)] text-sm last:border-b-0"

                      >

                        <td className="whitespace-nowrap px-3 py-4 text-xs text-[var(--muted)]">

                          {

                            click.createdAt.toLocaleString()

                          }

                        </td>

                        <td className="px-3 py-4">

                          {click.product ? (

                            <Link

                              href={`/products/${click.product.slug}`}

                              target="_blank"

                              className="font-medium hover:underline"

                            >

                              {

                                click.product

                                  .name

                              }

                            </Link>

                          ) : (

                            "—"

                          )}

                        </td>

                        <td className="px-3 py-4">

                          {

                            click.provider

                              ?.name ??

                            "—"

                          }

                        </td>

                        <td className="max-w-xs px-3 py-4">

                          {click.article ? (

                            <Link

                              href={`/articles/${click.article.slug}`}

                              target="_blank"

                              className="hover:underline"

                            >

                              {

                                click.article

                                  .title

                              }

                            </Link>

                          ) : (

                            "—"

                          )}

                        </td>

                        <td className="px-3 py-4 text-xs">

                          {

                            click.utmSource ??

                            "—"

                          }

                        </td>

                        <td className="px-3 py-4 text-xs">

                          {

                            click.utmMedium ??

                            "—"

                          }

                        </td>

                        <td className="px-3 py-4 text-xs">

                          {

                            click.utmCampaign ??

                            click.campaign ??

                            "—"

                          }

                        </td>

                        <td className="px-3 py-4 capitalize">

                          {

                            click.deviceType ??

                            "Unknown"

                          }

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-8 text-center">

              <p className="text-sm text-[var(--muted)]">

                No affiliate clicks were recorded during this period.

              </p>

            </div>

          )}

        </section>

      </div>

    </main>

  );

}
