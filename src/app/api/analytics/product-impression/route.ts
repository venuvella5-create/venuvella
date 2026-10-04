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


  const articleSlug =
    cleanOptionalString(
      data.articleSlug,
      180
    );

  const productId =
    cleanOptionalString(
      data.productId,
      180
    );

  const placementKey =
    cleanOptionalString(
      data.placementKey,
      300
    );

  const placementType =
    cleanOptionalString(
      data.placementType,
      40
    );

  const position =
    typeof data.position ===
      "number" &&
    Number.isInteger(
      data.position
    ) &&
    data.position >=
      0
      ? data.position
      : null;


  if (
    !articleSlug ||
    !productId ||
    !placementKey ||
    !placementType ||
    position ===
      null
  ) {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "INVALID_IMPRESSION",
      },
      {
        status:
          400,
      }
    );
  }


  if (
    placementType !==
      "single" &&
    placementType !==
      "grid"
  ) {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "INVALID_PLACEMENT_TYPE",
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


  const [
    article,
    product,
  ] =
    await Promise.all([
      prisma.article.findFirst({
        where: {
          slug:
            articleSlug,

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
      }),

      prisma.product.findFirst({
        where: {
          id:
            productId,

          status:
            "PUBLISHED",
        },

        select: {
          id:
            true,
        },
      }),
    ]);


  if (
    !article ||
    !product
  ) {
    return NextResponse.json(
      {
        ok:
          false,
        error:
          "CONTENT_NOT_FOUND",
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


  const existingImpression =
    await prisma.productImpression.findFirst({
      where: {
        articleId:
          article.id,

        productId:
          product.id,

        placementKey,

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
          existingImpression
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
    existingImpression
  ) {
    return response;
  }


  await prisma.productImpression.create({
    data: {
      articleId:
        article.id,

      productId:
        product.id,

      placementKey,

      placementType,

      position,

      sessionHash,
    },
  });


  return response;
}
