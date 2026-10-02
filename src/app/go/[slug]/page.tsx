import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

import {
  resolveProductDestination,
} from "@/lib/affiliate/resolveProductDestination";


export const dynamic =
  "force-dynamic";


function detectDeviceType(
  userAgent: string | null
) {
  if (!userAgent) {
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


function normalizeTrackingValue(
  value: string | undefined
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const normalized =
    value.trim();


  if (!normalized) {
    return null;
  }


  return normalized.slice(
    0,
    120
  );
}


export default async function ProductRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    article?: string;
    campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }>;
}) {
  const { slug } =
    await params;


  const query =
    await searchParams;


  /*
   * Read incoming attribution.
   */

  const requestedArticleSlug =
    normalizeTrackingValue(
      query.article
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
   * Resolve product/provider destination.
   */

  const result =
    await resolveProductDestination(
      slug
    );


  /*
   * Product does not exist.
   */

  if (
    !result.ok &&
    result.reason ===
      "PRODUCT_NOT_FOUND"
  ) {
    return (
      <main className="container-shell py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Product unavailable
          </p>


          <h1 className="display-serif mt-3 text-5xl">
            We couldn&apos;t find this product.
          </h1>


          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            This product may have been removed,
            archived or is no longer available
            through Venuvella.
          </p>


          <Link
            href="/products"
            className="mt-8 inline-flex border border-[var(--ink)] bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          >
            Explore products
          </Link>

        </div>

      </main>
    );
  }


  /*
   * Product exists, but there is currently
   * no provider mapping.
   */

  if (
    !result.ok &&
    result.reason ===
      "NO_PROVIDER"
  ) {
    return (
      <main className="container-shell py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Provider unavailable
          </p>


          <h1 className="display-serif mt-3 text-5xl">
            We&apos;re still connecting this product.
          </h1>


          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            This product is part of the Venuvella
            edit, but there is not currently an
            active shopping destination available.
          </p>


          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              href={`/products/${slug}`}
              className="inline-flex border border-[var(--ink)] bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              Back to product
            </Link>


            <Link
              href="/products"
              className="inline-flex border border-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Explore products
            </Link>

          </div>

        </div>

      </main>
    );
  }


  /*
   * Provider exists, but no safe destination
   * has been configured.
   */

  if (
    !result.ok &&
    result.reason ===
      "NO_VALID_DESTINATION"
  ) {
    return (
      <main className="container-shell py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Link unavailable
          </p>


          <h1 className="display-serif mt-3 text-5xl">
            This shopping link isn&apos;t ready yet.
          </h1>


          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
            A provider is connected to this product,
            but there is currently no valid external
            destination configured.
          </p>


          <Link
            href={`/products/${slug}`}
            className="mt-8 inline-flex border border-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Back to product
          </Link>

        </div>

      </main>
    );
  }


  /*
   * TypeScript guard.
   */

  if (!result.ok) {
    return null;
  }


  /*
   * Resolve optional article attribution.
   *
   * We do not trust the URL value as a DB ID.
   * We resolve the public article slug against
   * the Venuvella database.
   */

  let articleId:
    string | null = null;


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
            id: true,
          },
        });


      articleId =
        sourceArticle?.id ??
        null;

    } catch (error) {

      console.error(
        "Failed to resolve article attribution:",
        error
      );

    }
  }


  /*
   * Read request context for click analytics.
   */

  const requestHeaders =
    await headers();


  const referrer =
    requestHeaders.get(
      "referer"
    );


  const userAgent =
    requestHeaders.get(
      "user-agent"
    );


  const deviceType =
    detectDeviceType(
      userAgent
    );


  /*
   * Attribution defaults.
   *
   * Incoming campaign values win.
   * Otherwise Venuvella uses internal
   * defaults depending on click source.
   */

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
   * Record outbound affiliate click.
   *
   * Redirect should still work if analytics
   * logging fails, so analytics is protected
   * by try/catch.
   */

  try {

    await prisma.affiliateClick.create({
      data: {

        productId:
          result.product.id,


        providerId:
          result.provider.id,


        articleId:
          articleId,


        campaign:
          campaign,


        referrer:
          referrer ??
          null,


        deviceType:
          deviceType ??
          null,


        utmSource:
          finalUtmSource,


        utmMedium:
          finalUtmMedium,


        utmCampaign:
          finalUtmCampaign,

      },
    });

  } catch (error) {

    console.error(
      "Failed to record affiliate click:",
      error
    );

  }


  /*
   * Redirect to provider.
   */

  redirect(
    result.destination
  );
}