import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  headers,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  resolveProductDestination,
} from "@/lib/affiliate/resolveProductDestination";


export const dynamic =
  "force-dynamic";


export const metadata: Metadata = {
  title:
    "Continue to retailer",

  robots: {
    index:
      false,

    follow:
      false,

    nocache:
      true,
  },
};


function detectDeviceType(
  userAgent:
    string |
    null,

  mobileHint:
    string |
    null
) {
  if (
    mobileHint ===
    "?1"
  ) {
    return "mobile";
  }


  if (
    !userAgent
  ) {
    return null;
  }


  const normalized =
    userAgent.toLowerCase();


  if (
    normalized.includes(
      "ipad"
    ) ||
    normalized.includes(
      "tablet"
    )
  ) {
    return "tablet";
  }


  if (
    normalized.includes(
      "mobile"
    ) ||
    normalized.includes(
      "iphone"
    ) ||
    normalized.includes(
      "android"
    )
  ) {
    return "mobile";
  }


  return "desktop";
}


function isLikelyBot(
  userAgent:
    string |
    null
) {
  if (
    !userAgent
  ) {
    return false;
  }


  const normalized =
    userAgent.toLowerCase();


  const botSignals = [
    "bot",
    "crawler",
    "spider",
    "slurp",
    "bingpreview",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "whatsapp",
    "telegrambot",
    "discordbot",
    "preview",
  ];


  return botSignals.some(
    (
      signal
    ) =>
      normalized.includes(
        signal
      )
  );
}


function normalizeTrackingValue(
  value:
    string |
    undefined
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const normalized =
    value.trim();


  if (
    !normalized
  ) {
    return null;
  }


  return normalized.slice(
    0,
    120
  );
}


function normalizeReferrer(
  value:
    string |
    null
) {
  if (
    !value
  ) {
    return null;
  }


  const normalized =
    value.trim();


  if (
    !normalized
  ) {
    return null;
  }


  return normalized.slice(
    0,
    1000
  );
}


export default async function ProductRedirectPage({
  params,
  searchParams,
}: {
  params:
    Promise<{
      slug:
        string;
    }>;

  searchParams:
    Promise<{
      article?:
        string;

      provider?:
        string;

      campaign?:
        string;

      utm_source?:
        string;

      utm_medium?:
        string;

      utm_campaign?:
        string;
    }>;
}) {
  const {
    slug,
  } =
    await params;


  const query =
    await searchParams;


  const requestedArticleSlug =
    normalizeTrackingValue(
      query.article
    );


  const requestedProviderSlug =
    normalizeTrackingValue(
      query.provider
    );


  const campaign =
    normalizeTrackingValue(
      query.campaign
    );


  const incomingUtmSource =
    normalizeTrackingValue(
      query.utm_source
    );


  const incomingUtmMedium =
    normalizeTrackingValue(
      query.utm_medium
    );


  const incomingUtmCampaign =
    normalizeTrackingValue(
      query.utm_campaign
    );


  /*
   * Resolve the product and requested retailer.
   */

  const result =
    await resolveProductDestination(
      slug,
      requestedProviderSlug
    );


  if (
    !result.ok &&
    result.reason ===
      "PRODUCT_NOT_FOUND"
  ) {
    return (
      <main className="container-shell py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Product unavailable
          </p>


          <h1 className="display-serif mt-4 text-5xl leading-tight sm:text-6xl">
            We couldn&apos;t find this product.
          </h1>


          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            This product may have been removed,
            archived or is no longer available
            through Venuvella.
          </p>


          <Link
            href="/products"
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
          >
            Explore products
          </Link>

        </div>

      </main>
    );
  }


  if (
    !result.ok &&
    result.reason ===
      "NO_PROVIDER"
  ) {
    return (
      <main className="container-shell py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Retailer unavailable
          </p>


          <h1 className="display-serif mt-4 text-5xl leading-tight sm:text-6xl">
            We&apos;re still connecting this product.
          </h1>


          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            The requested retailer destination is
            not currently available for this
            Venuvella product.
          </p>


          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              href={`/products/${slug}`}
              className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
            >
              Back to product
            </Link>


            <Link
              href="/products"
              className="inline-flex min-h-[48px] items-center rounded-full border border-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em]"
            >
              Explore products
            </Link>

          </div>

        </div>

      </main>
    );
  }


  if (
    !result.ok &&
    result.reason ===
      "NO_VALID_DESTINATION"
  ) {
    return (
      <main className="container-shell py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Link unavailable
          </p>


          <h1 className="display-serif mt-4 text-5xl leading-tight sm:text-6xl">
            This shopping link isn&apos;t ready yet.
          </h1>


          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            The retailer is connected to this
            product, but there is currently no
            valid external shopping destination.
          </p>


          <Link
            href={`/products/${slug}`}
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full border border-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em]"
          >
            Back to product
          </Link>

        </div>

      </main>
    );
  }


  if (
    !result.ok
  ) {
    return null;
  }


  /*
   * Resolve article attribution from its public slug.
   */

  let articleId:
    string |
    null =
      null;


  if (
    requestedArticleSlug
  ) {
    try {
      const sourceArticle =
        await prisma.article.findFirst({
          where: {
            slug:
              requestedArticleSlug,

            status:
              "PUBLISHED",
          },

          select: {
            id:
              true,
          },
        });


      articleId =
        sourceArticle?.id ??
        null;
    } catch (
      error
    ) {
      console.error(
        "Failed to resolve article attribution:",
        error
      );
    }
  }


  const requestHeaders =
    await headers();


  const referrer =
    normalizeReferrer(
      requestHeaders.get(
        "referer"
      )
    );


  const userAgent =
    requestHeaders.get(
      "user-agent"
    );


  const mobileHint =
    requestHeaders.get(
      "sec-ch-ua-mobile"
    );


  const deviceType =
    detectDeviceType(
      userAgent,
      mobileHint
    );


  const finalUtmSource =
    incomingUtmSource ??
    "venuvella";


  const finalUtmMedium =
    incomingUtmMedium ??
    (
      articleId
        ? "editorial_affiliate"
        : "affiliate"
    );


  const finalUtmCampaign =
    incomingUtmCampaign ??
    (
      articleId
        ? "article_product_click"
        : "product_redirect"
    );


  /*
   * Do not count obvious crawler/social-preview requests.
   *
   * Analytics failure must never block the retailer redirect.
   */

  if (
    !isLikelyBot(
      userAgent
    )
  ) {
    try {
      await prisma.affiliateClick.create({
        data: {
          productId:
            result.product.id,

          providerId:
            result.provider.id,

          articleId,

          category:
            result.product.category.slug,

          campaign,

          referrer,

          deviceType,

          utmSource:
            finalUtmSource,

          utmMedium:
            finalUtmMedium,

          utmCampaign:
            finalUtmCampaign,
        },
      });
    } catch (
      error
    ) {
      console.error(
        "Failed to record affiliate click:",
        error
      );
    }
  }


  redirect(
    result.destination
  );
}