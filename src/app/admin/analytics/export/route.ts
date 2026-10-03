import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


type AnalyticsRange =
  | "today"
  | "7d"
  | "30d"
  | "all";


function startOfDay(
  date: Date
) {
  const result =
    new Date(
      date
    );


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


  if (
    range ===
    "today"
  ) {
    return today;
  }


  if (
    range ===
    "7d"
  ) {
    const start =
      new Date(
        today
      );


    start.setDate(
      start.getDate() -
        6
    );


    return start;
  }


  if (
    range ===
    "30d"
  ) {
    const start =
      new Date(
        today
      );


    start.setDate(
      start.getDate() -
        29
    );


    return start;
  }


  return null;
}


function parseRange(
  value:
    | string
    | null
): AnalyticsRange {
  switch (value) {
    case "today":
    case "7d":
    case "30d":
    case "all":
      return value;

    default:
      return "30d";
  }
}


function getRangeFileLabel(
  range: AnalyticsRange
) {
  switch (range) {
    case "today":
      return "today";

    case "7d":
      return "last-7-days";

    case "30d":
      return "last-30-days";

    case "all":
      return "all-time";
  }
}


function csvValue(
  value:
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return "";
  }


  const text =
    value instanceof Date
      ? value.toISOString()
      : String(
          value
        );


  return `"${text.replaceAll(
    '"',
    '""'
  )}"`;
}


export async function GET(
  request: NextRequest
) {
  /*
   * Authenticate separately so a database/export error is not
   * incorrectly returned to the browser as "Unauthorized".
   */
  try {
    await requireRole([
      "ADMIN",
      "ANALYST",
    ]);
  } catch {
    return NextResponse.json(
      {
        error:
          "Unauthorized.",
      },
      {
        status:
          401,

        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  }


  const range =
    parseRange(
      request.nextUrl.searchParams.get(
        "range"
      )
    );


  const startDate =
    getRangeStart(
      range
    );


  /*
   * These fields mirror the analytics page's existing AffiliateClick
   * queries, so the export stays aligned with the current Prisma model.
   */
  const clicks =
    await prisma.affiliateClick.findMany({
      where:
        startDate
          ? {
              createdAt: {
                gte:
                  startDate,
              },
            }
          : undefined,

      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        id: true,
        createdAt: true,

        referrer:
          true,

        deviceType:
          true,

        campaign:
          true,

        utmSource:
          true,

        utmMedium:
          true,

        utmCampaign:
          true,

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
    });


  const header = [
    "Click ID",
    "Timestamp",
    "Product ID",
    "Product",
    "Product Slug",
    "Provider ID",
    "Provider",
    "Provider Slug",
    "Article ID",
    "Article",
    "Article Slug",
    "Referrer",
    "Device",
    "Campaign",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
  ];


  const rows =
    clicks.map(
      (click) => [
        click.id,
        click.createdAt,

        click.product?.id ??
          "",

        click.product?.name ??
          "",

        click.product?.slug ??
          "",

        click.provider?.id ??
          "",

        click.provider?.name ??
          "",

        click.provider?.slug ??
          "",

        click.article?.id ??
          "",

        click.article?.title ??
          "",

        click.article?.slug ??
          "",

        click.referrer ??
          "",

        click.deviceType ??
          "",

        click.campaign ??
          "",

        click.utmSource ??
          "",

        click.utmMedium ??
          "",

        click.utmCampaign ??
          "",
      ]
    );


  const csv =
    [
      header
        .map(
          csvValue
        )
        .join(
          ","
        ),

      ...rows.map(
        (row) =>
          row
            .map(
              csvValue
            )
            .join(
              ","
            )
      ),
    ].join(
      "\r\n"
    );


  const filename =
    `venuvella-affiliate-analytics-${getRangeFileLabel(
      range
    )}-${new Date()
      .toISOString()
      .slice(
        0,
        10
      )}.csv`;


  return new NextResponse(
    `\uFEFF${csv}`,
    {
      status:
        200,

      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control":
          "private, no-store, max-age=0",
      },
    }
  );
}
