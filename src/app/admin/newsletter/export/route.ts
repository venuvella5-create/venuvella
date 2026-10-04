import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  Prisma,
} from "@prisma/client";

import {
  requireRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


function normalizeSearchValue(
  value:
    string |
    null
) {
  if (
    !value
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      160
    );
}


function normalizeStatus(
  value:
    string |
    null
) {
  if (
    value ===
      "confirmed" ||
    value ===
      "unconfirmed"
  ) {
    return value;
  }

  return "all";
}


function escapeCsvValue(
  value:
    string |
    number |
    null |
    undefined
) {
  const normalized =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return `"${normalized.replace(
    /"/g,
    '""'
  )}"`;
}


function formatCsvDate(
  value:
    Date |
    null
) {
  if (
    !value
  ) {
    return "";
  }

  return value.toISOString();
}


export async function GET(
  request:
    NextRequest
) {
  await requireRole([
    "ADMIN",
  ]);


  const q =
    normalizeSearchValue(
      request.nextUrl.searchParams.get(
        "q"
      )
    );


  const status =
    normalizeStatus(
      request.nextUrl.searchParams.get(
        "status"
      )
    );


  const where:
    Prisma.NewsletterSubscriberWhereInput =
      {};


  if (
    q
  ) {
    where.email = {
      contains:
        q,

      mode:
        "insensitive",
    };
  }


  if (
    status ===
    "confirmed"
  ) {
    where.confirmedAt = {
      not:
        null,
    };
  }


  if (
    status ===
    "unconfirmed"
  ) {
    where.confirmedAt =
      null;
  }


  const subscribers =
    await prisma.newsletterSubscriber.findMany({
      where,

      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        id:
          true,

        email:
          true,

        confirmedAt:
          true,

        createdAt:
          true,

        updatedAt:
          true,
      },
    });


  const rows = [
    [
      "subscriber_id",
      "email",
      "status",
      "subscribed_at",
      "confirmed_at",
      "updated_at",
    ],

    ...subscribers.map(
      (subscriber) => [
        subscriber.id,
        subscriber.email,

        subscriber.confirmedAt
          ? "confirmed"
          : "unconfirmed",

        formatCsvDate(
          subscriber.createdAt
        ),

        formatCsvDate(
          subscriber.confirmedAt
        ),

        formatCsvDate(
          subscriber.updatedAt
        ),
      ]
    ),
  ];


  const csv =
    rows
      .map(
        (row) =>
          row
            .map(
              (value) =>
                escapeCsvValue(
                  value
                )
            )
            .join(",")
      )
      .join("\r\n");


  const dateStamp =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );


  return new NextResponse(
    `\uFEFF${csv}`,
    {
      status:
        200,

      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="venuvella-newsletter-${dateStamp}.csv"`,

        "Cache-Control":
          "private, no-store, max-age=0",
      },
    }
  );
}
