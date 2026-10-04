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

    categoryGroups,

    categorizedClicks,

    deviceAttributedClicks,

    recentClicks,

    desktopClicks,

    mobileClicks,

    tabletClicks,

    editorialClicks,

    nonEditorialClicks,

    newsletterClicks,

    newsletterEditorialClicks,

    articleProductGroups,

    providerProductGroups,

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

     * Categories

     */

    prisma.affiliateClick.groupBy({

      by: [

        "category",

      ],

      where: {

        ...clickWhere,

        category: {

          not: null,

        },

      },

      _count: {

        _all: true,

      },

      orderBy: {

        _count: {

          category:

            "desc",

        },

      },

      take: 10,

    }),

    /*

     * Category tracking coverage

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        category: {

          not: null,

        },

      },

    }),

    /*

     * Device tracking coverage

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        deviceType: {

          not: null,

        },

      },

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

     * Newsletter-attributed retailer clicks

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

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

      },

    }),

    /*

     * Newsletter clicks with editorial attribution

     */

    prisma.affiliateClick.count({

      where: {

        ...clickWhere,

        articleId: {

          not: null,

        },

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

      },

    }),

    /*

     * Article → product paths

     */

    prisma.affiliateClick.groupBy({

      by: [

        "articleId",

        "productId",

      ],

      where: {

        ...clickWhere,

        articleId: {

          not: null,

        },

        productId: {

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

     * Provider → product paths

     */

    prisma.affiliateClick.groupBy({

      by: [

        "providerId",

        "productId",

      ],

      where: {

        ...clickWhere,

        providerId: {

          not: null,

        },

        productId: {

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

    Array.from(

      new Set(

        [

          ...providerGroups.map(

            (group) =>

              group.providerId

          ),

          ...providerProductGroups.map(

            (group) =>

              group.providerId

          ),

        ].filter(

          (

            id

          ): id is string =>

            Boolean(id)

        )

      )

    );

  /*

   * Load referenced products.

   */

  const productIds =

    Array.from(

      new Set(

        [

          ...productGroups.map(

            (group) =>

              group.productId

          ),

          ...articleProductGroups.map(

            (group) =>

              group.productId

          ),

          ...providerProductGroups.map(

            (group) =>

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

  /*

   * Load referenced articles.

   */

  const articleIds =

    Array.from(

      new Set(

        [

          ...articleGroups.map(

            (group) =>

              group.articleId

          ),

          ...articleProductGroups.map(

            (group) =>

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


  const uncategorizedClicks =

    Math.max(

      0,

      totalClicks -

      categorizedClicks

    );


  const unknownDeviceClicks =

    Math.max(

      0,

      totalClicks -

      deviceAttributedClicks

    );

  const newsletterShare =

    percentage(

      newsletterClicks,

      totalClicks

    );


  const newsletterEditorialShare =

    percentage(

      newsletterEditorialClicks,

      newsletterClicks

    );


  const topProviderClickShare =

    providerGroups[0]

      ? Number(

          percentage(

            providerGroups[0]._count._all,

            totalClicks

          )

        )

      : 0;


  const topProductClickShare =

    productGroups[0]

      ? Number(

          percentage(

            productGroups[0]._count._all,

            totalClicks

          )

        )

      : 0;


  const optimizationSignals: {

    title: string;

    detail: string;

    tone:

      | "positive"

      | "watch"

      | "neutral";

  }[] = [];


  if (

    totalClicks === 0

  ) {

    optimizationSignals.push({

      title:

        "Build the first retailer-intent baseline",

      detail:

        "No outbound retailer clicks are recorded for this period yet. Publish and promote a small set of strong buying guides before making optimization decisions.",

      tone:

        "neutral",

    });

  } else {

    if (

      articleProductGroups.length >

      0

    ) {

      const topPath =

        articleProductGroups[0];


      const article =

        topPath.articleId

          ? articleMap.get(

              topPath.articleId

            )

          : null;


      const product =

        topPath.productId

          ? productMap.get(

              topPath.productId

            )

          : null;


      optimizationSignals.push({

        title:

          "Protect the strongest editorial path",

        detail:

          `${article?.title ?? "An article"} → ${product?.name ?? "a product"} generated ${topPath._count._all} retailer click${topPath._count._all === 1 ? "" : "s"} in this period. Keep the recommendation accurate, available and editorially useful.`,

        tone:

          "positive",

      });

    }


    if (

      topProviderClickShare >=

      70

    ) {

      optimizationSignals.push({

        title:

          "Provider concentration is high",

        detail:

          `${topProviderClickShare.toFixed(1)}% of recorded retailer clicks went to the leading provider. Review provider coverage on high-interest products so Venuvella is not overly dependent on one destination.`,

        tone:

          "watch",

      });

    } else if (

      providerGroups.length >

      1

    ) {

      optimizationSignals.push({

        title:

          "Retailer interest is distributed",

        detail:

          `The leading provider accounts for ${topProviderClickShare.toFixed(1)}% of retailer clicks. Continue comparing provider availability and destination quality rather than optimizing for click volume alone.`,

        tone:

          "positive",

      });

    }


    if (

      newsletterClicks >

      0

    ) {

      optimizationSignals.push({

        title:

          "Newsletter attribution is working",

        detail:

          `${newsletterClicks} retailer click${newsletterClicks === 1 ? "" : "s"} (${newsletterShare}%) were attributed to newsletter/email traffic; ${newsletterEditorialShare}% of those retained article attribution.`,

        tone:

          "positive",

      });

    } else {

      optimizationSignals.push({

        title:

          "Newsletter retailer intent has not started yet",

        detail:

          "No newsletter-attributed retailer clicks are recorded for this period. That is expected until production newsletter sending is active; keep the campaign UTM convention when it launches.",

        tone:

          "neutral",

      });

    }


    if (

      uncategorizedClicks >

      0

    ) {

      optimizationSignals.push({

        title:

          "Finish category attribution rollout",

        detail:

          `${uncategorizedClicks} click${uncategorizedClicks === 1 ? "" : "s"} in this period lack category attribution. Keep historical data visible, but use newer fully-attributed clicks for category decisions.`,

        tone:

          "watch",

      });

    }


    if (

      editorialClicks === 0 &&

      totalClicks >

      0

    ) {

      optimizationSignals.push({

        title:

          "Editorial product paths need testing",

        detail:

          "Retailer activity exists, but none of the selected-period clicks are attributed to articles. Test contextual product blocks in relevant buying guides rather than adding links indiscriminately.",

        tone:

          "watch",

      });

    }

  }


  const visibleSignals =

    optimizationSignals.slice(

      0,

      4

    );


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

              <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Newsletter intent

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {newsletterClicks}

            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">

              {newsletterShare}% of recorded retailer clicks

            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Newsletter editorial

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {newsletterEditorialShare}%

            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">

              Newsletter clicks retaining article attribution

            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Provider concentration

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {topProviderClickShare.toFixed(

                1

              )}

              %

            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">

              Share of clicks to the leading provider

            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Product concentration

            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">

              {topProductClickShare.toFixed(

                1

              )}

              %

            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">

              Share of clicks to the leading product

            </p>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="admin-eyebrow">

                Growth intelligence

              </p>

              <h2 className="display-serif mt-2 text-3xl">

                What the click data suggests

              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">

                Directional recommendations from retailer-click behavior only.

                They do not represent confirmed purchases, conversions or revenue.

              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {visibleSignals.map(

              (

                signal,

                index

              ) => (

                <div

                  key={`${signal.title}-${index}`}

                  className={`rounded-xl border p-5 ${

                    signal.tone ===

                    "positive"

                      ? "border-emerald-200 bg-emerald-50"

                      : signal.tone ===

                          "watch"

                        ? "border-amber-300 bg-amber-50"

                        : "border-[var(--line)] bg-[var(--paper)]"

                  }`}

                >

                  <p className="font-semibold">

                    {signal.title}

                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">

                    {signal.detail}

                  </p>

                </div>

              )

            )}

          </div>

        </section>


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

                        <div className="text-right">

                          <strong>

                            {

                              group

                                ._count

                                ._all

                            }

                          </strong>


                          <p className="mt-1 text-xs text-[var(--muted)]">

                            {

                              percentage(

                                group._count._all,

                                totalClicks

                              )

                            }

                            % of clicks

                          </p>

                        </div>

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

                        <div className="text-right">

                          <strong>

                            {

                              group

                                ._count

                                ._all

                            }

                          </strong>


                          <p className="mt-1 text-xs text-[var(--muted)]">

                            {

                              percentage(

                                group._count._all,

                                totalClicks

                              )

                            }

                            % of clicks

                          </p>

                        </div>

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

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Editorial paths

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Article → product clicks

            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">

              The strongest recorded editorial paths to retailer intent.

              Use these as a signal for content maintenance, not as purchase data.

            </p>


            <div className="mt-6 divide-y divide-[var(--line)]">

              {articleProductGroups.length >

              0 ? (

                articleProductGroups.map(

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

                        className="py-4"

                      >

                        <div className="flex items-start justify-between gap-5">

                          <div className="min-w-0">

                            <p className="text-xs font-semibold text-[var(--muted)]">

                              {index + 1}.{" "}

                              {article?.title ??

                                "Unknown article"}

                            </p>

                            <p className="mt-1 font-medium">

                              →{" "}

                              {product?.name ??

                                "Unknown product"}

                            </p>

                          </div>

                          <strong>

                            {group._count._all}

                          </strong>

                        </div>

                      </div>

                    );

                  }

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No article-to-product retailer paths are recorded for this period.

                </p>

              )}

            </div>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Retailer paths

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Provider → product clicks

            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">

              Shows which provider/product combinations receive outbound interest.

            </p>


            <div className="mt-6 divide-y divide-[var(--line)]">

              {providerProductGroups.length >

              0 ? (

                providerProductGroups.map(

                  (

                    group,

                    index

                  ) => {

                    const provider =

                      group.providerId

                        ? providerMap.get(

                            group.providerId

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

                        key={`${group.providerId}-${group.productId}`}

                        className="py-4"

                      >

                        <div className="flex items-start justify-between gap-5">

                          <div className="min-w-0">

                            <p className="text-xs font-semibold text-[var(--muted)]">

                              {index + 1}.{" "}

                              {provider?.name ??

                                "Unknown provider"}

                            </p>

                            <p className="mt-1 font-medium">

                              →{" "}

                              {product?.name ??

                                "Unknown product"}

                            </p>

                          </div>

                          <strong>

                            {group._count._all}

                          </strong>

                        </div>

                      </div>

                    );

                  }

                )

              ) : (

                <p className="py-4 text-sm text-[var(--muted)]">

                  No provider-to-product retailer paths are recorded for this period.

                </p>

              )}

            </div>

          </div>

        </section>


        {/* Category intelligence + tracking health */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Category performance

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Top categories

            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">

              Category attribution is recorded on newer affiliate clicks.
              Historical clicks without category data remain visible in the
              tracking-health panel.

            </p>

            <div className="mt-6 divide-y divide-[var(--line)]">

              {categoryGroups.length > 0 ? (

                categoryGroups.map(

                  (

                    group,

                    index

                  ) => (

                    <div

                      key={

                        group.category ??

                        "uncategorized"

                      }

                      className="flex items-center justify-between gap-4 py-4"

                    >

                      <div>

                        <p className="font-medium">

                          {index + 1}.{" "}

                          {

                            group.category ??

                            "Uncategorized"

                          }

                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">

                          {

                            percentage(

                              group._count._all,

                              totalClicks

                            )

                          }

                          % of clicks

                        </p>

                      </div>

                      <strong>

                        {

                          group._count._all

                        }

                      </strong>

                    </div>

                  )

                )

              ) : (

                <div className="py-6">

                  <p className="text-sm text-[var(--muted)]">

                    No category-attributed clicks are available for this period.

                  </p>

                </div>

              )}

            </div>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">

              Tracking health

            </p>

            <h2 className="display-serif mt-2 text-3xl">

              Attribution coverage

            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">

              Coverage shows how much of the selected click activity contains
              the newer affiliate-intelligence fields.

            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">

                  Category coverage

                </p>

                <p className="mt-3 text-3xl font-semibold">

                  {

                    percentage(

                      categorizedClicks,

                      totalClicks

                    )

                  }

                  %

                </p>

                <p className="mt-2 text-xs text-[var(--muted)]">

                  {categorizedClicks} categorized · {uncategorizedClicks} without category

                </p>

              </div>


              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">

                  Device coverage

                </p>

                <p className="mt-3 text-3xl font-semibold">

                  {

                    percentage(

                      deviceAttributedClicks,

                      totalClicks

                    )

                  }

                  %

                </p>

                <p className="mt-2 text-xs text-[var(--muted)]">

                  {deviceAttributedClicks} identified · {unknownDeviceClicks} unknown

                </p>

              </div>


              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:col-span-2">

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">

                  Editorial attribution

                </p>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">

                  <div>

                    <p className="text-3xl font-semibold">

                      {

                        percentage(

                          editorialClicks,

                          totalClicks

                        )

                      }

                      %

                    </p>

                    <p className="mt-2 text-xs text-[var(--muted)]">

                      {editorialClicks} article-driven clicks in the selected period

                    </p>

                  </div>

                  <p className="text-xs text-[var(--muted)]">

                    Product/direct: {nonEditorialClicks}

                  </p>

                </div>

              </div>

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

                      Category

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

                        <td className="px-3 py-4 text-xs capitalize">

                          {

                            click.category ??

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
