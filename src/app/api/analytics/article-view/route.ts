import {
  createHash,
  randomUUID,
} from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/db/prisma";


const VISITOR_COOKIE =
  "venuvella_visitor";

const THIRTY_MINUTES =
  30 * 60 * 1000;


function cleanOptionalString(
  value: unknown,
  maxLength: number
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(
    0,
    maxLength
  );
}


function getDeviceType(
  userAgent: string
) {
  const value =
    userAgent.toLowerCase();

  if (
    /ipad|tablet|kindle|silk/.test(
      value
    )
  ) {
    return "tablet";
  }

  if (
    /mobile|iphone|ipod|android/.test(
      value
    )
  ) {
    return "mobile";
  }

  return "desktop";
}


function isLikelyBot(
  userAgent: string
) {
  return /bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp|discordbot|telegrambot|linkedinbot/i.test(
    userAgent
  );
}


function hashVisitor(
  visitorId: string
) {
  return createHash(
    "sha256"
  )
    .update(
      visitorId
    )
    .digest(
      "hex"
    );
}


export async function POST(
  request: NextRequest
) {
  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "INVALID_JSON",
      },
      {
        status:
          400,
      }
    );
  }


  if (
    typeof body !==
      "object" ||
    body ===
      null ||
    Array.isArray(
      body
    )
  ) {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "INVALID_BODY",
      },
      {
        status:
          400,
      }
    );
  }


  const data =
    body as Record<
      string,
      unknown
    >;

  const slug =
    cleanOptionalString(
      data.slug,
      180
    );

  if (!slug) {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "MISSING_SLUG",
      },
      {
        status:
          400,
      }
    );
  }


  const userAgent =
    request.headers.get(
      "user-agent"
    ) ??
    "";

  if (
    isLikelyBot(
      userAgent
    )
  ) {
    return NextResponse.json({
      ok:
        true,
      skipped:
        true,
    });
  }


  const article =
    await prisma.article.findFirst({
      where: {
        slug,

        status:
          "PUBLISHED",

        OR: [
          {
            publishedAt:
              null,
          },

          {
            publishedAt: {
              lte:
                new Date(),
            },
          },
        ],
      },

      select: {
        id:
          true,
      },
    });


  if (!article) {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "ARTICLE_NOT_FOUND",
      },
      {
        status:
          404,
      }
    );
  }


  const existingVisitorId =
    request.cookies.get(
      VISITOR_COOKIE
    )?.value;

  const visitorId =
    existingVisitorId ??
    randomUUID();

  const sessionHash =
    hashVisitor(
      visitorId
    );

  const dedupeSince =
    new Date(
      Date.now() -
        THIRTY_MINUTES
    );


  const existingView =
    await prisma.articlePageView.findFirst({
      where: {
        articleId:
          article.id,

        sessionHash,

        createdAt: {
          gte:
            dedupeSince,
        },
      },

      select: {
        id:
          true,
      },
    });


  const response =
    NextResponse.json({
      ok:
        true,
      deduped:
        Boolean(
          existingView
        ),
    });


  if (
    !existingVisitorId
  ) {
    response.cookies.set(
      VISITOR_COOKIE,
      visitorId,
      {
        httpOnly:
          true,

        sameSite:
          "lax",

        secure:
          process.env.NODE_ENV ===
          "production",

        path:
          "/",

        maxAge:
          60 *
          60 *
          24 *
          365,
      }
    );
  }


  if (
    existingView
  ) {
    return response;
  }


  await prisma.articlePageView.create({
    data: {
      articleId:
        article.id,

      sessionHash,

      referrer:
        cleanOptionalString(
          data.referrer,
          1200
        ),

      deviceType:
        getDeviceType(
          userAgent
        ),

      utmSource:
        cleanOptionalString(
          data.utmSource,
          200
        ),

      utmMedium:
        cleanOptionalString(
          data.utmMedium,
          200
        ),

      utmCampaign:
        cleanOptionalString(
          data.utmCampaign,
          300
        ),
    },
  });


  return response;
}
