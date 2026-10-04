import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  ProductCard,
} from "@/components/editorial/ProductCard";

import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/queries";


const getCachedProductBySlug =
  cache(
    getProductBySlug
  );


export const dynamic =
  "force-dynamic";


function formatPrice(
  price: {
    toString():
      string;
  } | number,
  currency:
    | string
    | null
) {
  const numeric =
    Number(
      price.toString()
    );


  if (
    Number.isFinite(
      numeric
    )
  ) {
    try {
      return new Intl.NumberFormat(
        "en-US",
        {
          style:
            "currency",

          currency:
            currency ??
            "USD",

          maximumFractionDigits:
            2,
        }
      ).format(
        numeric
      );
    } catch {
      return `${currency ?? ""} ${numeric.toFixed(2)}`.trim();
    }
  }


  return `${currency ?? ""} ${price.toString()}`.trim();
}


function normalizeAvailability(
  value:
    | string
    | null
) {
  if (
    !value
  ) {
    return "Check retailer";
  }


  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /^./,
      (
        character
      ) =>
        character.toUpperCase()
    );
}


export async function generateMetadata({
  params,
}: {
  params:
    Promise<{
      slug: string;
    }>;
}): Promise<Metadata> {
  const {
    slug,
  } = await params;


  const product =
    await getCachedProductBySlug(
      slug
    );


  if (
    !product
  ) {
    return {};
  }


  const title =
    product.brand?.name
      ? `${product.name} by ${product.brand.name}`
      : product.name;


  const description =
    product.editorialSummary ??
    product.description ??
    `Discover ${product.name}, a Venuvella product pick.`;


  const canonical =
    `/products/${product.slug}`;


  const socialImage =
    product.images[0]?.url ??
    "/og-default.jpg";


  return {
    title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "website",

      url:
        canonical,

      title,

      description,

      siteName:
        "Venuvella",

      images: [
        {
          url:
            socialImage,

          alt:
            product.images[0]?.altText ??
            product.name,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images: [
        socialImage,
      ],
    },
  };
}


export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params:
    Promise<{
      slug: string;
    }>;

  searchParams:
    Promise<{
      article?:
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


  const articleSlug =
    typeof query.article ===
    "string"
      ? query.article
      : null;


  const campaign =
    typeof query.campaign ===
    "string"
      ? query.campaign
      : null;


  const utmSource =
    typeof query.utm_source ===
    "string"
      ? query.utm_source
      : null;


  const utmMedium =
    typeof query.utm_medium ===
    "string"
      ? query.utm_medium
      : null;


  const utmCampaign =
    typeof query.utm_campaign ===
    "string"
      ? query.utm_campaign
      : null;


  const product =
    await getCachedProductBySlug(
      slug
    );


  if (
    !product
  ) {
    notFound();
  }

  const productSlug =
  product.slug;


  const relatedProducts =
    await getRelatedProducts(
      product.id,
      product.categoryId
    );


  const primaryImage =
    product.images[0];


  const goParams =
    new URLSearchParams();


  if (
    articleSlug
  ) {
    goParams.set(
      "article",
      articleSlug
    );
  }


  if (
    campaign
  ) {
    goParams.set(
      "campaign",
      campaign
    );
  }


  if (
    utmSource
  ) {
    goParams.set(
      "utm_source",
      utmSource
    );
  }


  if (
    utmMedium
  ) {
    goParams.set(
      "utm_medium",
      utmMedium
    );
  }


  if (
    utmCampaign
  ) {
    goParams.set(
      "utm_campaign",
      utmCampaign
    );
  }


  const goQuery =
    goParams.toString();


  const goHref =
    goQuery
      ? `/go/${product.slug}?${goQuery}`
      : `/go/${product.slug}`;


  function buildProviderGoHref(
    providerSlug: string
  ) {
    const providerParams =
      new URLSearchParams(
        goParams
      );


    providerParams.set(
      "provider",
      providerSlug
    );


    return `/go/${productSlug}?${providerParams.toString()}`;
  }


  const pricedOffers =
    product.providerProducts
      .filter(
        (
          offer
        ) =>
          offer.price !==
          null
      )
      .sort(
        (
          left,
          right
        ) =>
          Number(
            left.price?.toString() ??
            Number.POSITIVE_INFINITY
          ) -
          Number(
            right.price?.toString() ??
            Number.POSITIVE_INFINITY
          )
      );


  const bestPrice =
    pricedOffers[0] ??
    null;


  const hasMultipleOffers =
    product.providerProducts.length >
    1;


  const hasDecisionSupport =
    Boolean(
      product.editorialSummary ||
      product.description ||
      product.features.length >
        0
    );


  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://venuvella.vercel.app";


  const productUrl =
    new URL(
      `/products/${product.slug}`,
      siteUrl
    ).toString();


  const structuredOffers =
    product.providerProducts
      .filter(
        (
          offer
        ) =>
          offer.price !==
          null
      )
      .map(
        (
          offer
        ) => ({
          "@type":
            "Offer",

          url:
            productUrl,

          price:
            offer.price!.toString(),

          priceCurrency:
            offer.currency ??
            "USD",

          seller: {
            "@type":
              "Organization",

            name:
              offer.provider.name,
          },
        })
      );


  const productStructuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "Product",

    name:
      product.name,

    description:
      product.editorialSummary ??
      product.description ??
      undefined,

    image:
      product.images.length >
      0
        ? product.images.map(
            (
              image
            ) =>
              image.url
          )
        : undefined,

    brand:
      product.brand?.name
        ? {
            "@type":
              "Brand",

            name:
              product.brand.name,
          }
        : undefined,

    category:
      product.category.name,

    url:
      productUrl,

    offers:
      structuredOffers.length >
      0
        ? structuredOffers
        : undefined,
  };


  return (
    <main className="pb-32 sm:pb-28">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              productStructuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />


      <div className="container-shell pt-8 sm:pt-10">

        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
        >

          <Link
            href="/products"
            className="inline-flex items-center gap-2 transition hover:text-[var(--ink)]"
          >
            <ArrowLeft
              size={
                13
              }
            />

            Products
          </Link>


          <span
            aria-hidden="true"
          >
            /
          </span>


          <Link
            href={`/products?category=${product.category.slug}`}
            className="transition hover:text-[var(--ink)]"
          >
            {product.category.name}
          </Link>

        </nav>

      </div>


      {/* Product hero */}

      <section className="container-shell grid gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-14">

        <div>

          <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">

            {primaryImage ? (
              <Image
                src={
                  primaryImage.url
                }
                alt={
                  primaryImage.altText ??
                  product.name
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
                Product image unavailable
              </div>
            )}

          </div>


          {product.images.length >
            1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">

              {product.images
                .slice(
                  1,
                  5
                )
                .map(
                  (
                    image
                  ) => (

                    <div
                      key={
                        image.id
                      }
                      className="relative aspect-square overflow-hidden bg-[var(--surface)]"
                    >

                      <Image
                        src={
                          image.url
                        }
                        alt={
                          image.altText ??
                          product.name
                        }
                        fill
                        sizes="160px"
                        className="object-cover"
                      />

                    </div>

                  )
                )}

            </div>
          )}

        </div>


        <div className="flex flex-col justify-center lg:py-4">

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
            {product.brand?.name ??
              "Venuvella"}
          </p>


          <h1 className="display-serif mt-4 text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">
            {product.name}
          </h1>


          {product.editorialSummary && (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              {product.editorialSummary}
            </p>
          )}


          <div className="mt-8 grid gap-3 sm:grid-cols-3">

            <TrustPoint
              icon="edit"
              title="Editorially selected"
              body="Chosen as part of the Venuvella edit."
            />

            <TrustPoint
              icon="shop"
              title={
                hasMultipleOffers
                  ? `${product.providerProducts.length} retailer options`
                  : "Retailer destination"
              }
              body="Compare available merchant information before leaving Venuvella."
            />

            <TrustPoint
              icon="shield"
              title="Tracked transparently"
              body="Outbound affiliate clicks are routed through Venuvella."
            />

          </div>


          {bestPrice && (
            <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[#f5f3ee] p-5">

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Price reference
              </p>


              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">

                <div>

                  <p className="text-2xl font-semibold">
                    {formatPrice(
                      bestPrice.price!,
                      bestPrice.currency
                    )}
                  </p>


                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Listed by {bestPrice.provider.name}
                  </p>

                </div>


                <span className="text-xs text-[var(--muted)]">
                  Prices and availability may change at the retailer.
                </span>

              </div>

            </div>
          )}


          <div className="mt-8">

            <Link
              href={
                goHref
              }
              prefetch={
                false
              }
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] !text-white transition hover:opacity-90 sm:w-auto"
            >
              <span className="text-white">
                Check price at retailer
              </span>

              <ExternalLink
                size={
                  14
                }
                className="text-white"
              />
            </Link>


            <p className="mt-4 max-w-xl text-xs leading-6 text-[var(--muted)]">
              Disclosure: Venuvella may earn a commission when you purchase
              through links on our site, at no additional cost to you.{" "}
              <Link
                href="/affiliate-disclosure"
                className="font-semibold text-[var(--ink)] underline underline-offset-4"
              >
                Learn more
              </Link>.
            </p>

          </div>

        </div>

      </section>


      {/* Decision support */}

      {hasDecisionSupport && (
        <section className="border-y border-[var(--line)] bg-[#f4f1ea] py-14 sm:py-16">

          <div className="container-shell grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                The Venuvella take
              </p>


              <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">
                Why it made the edit.
              </h2>


              <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
                A quick editorial read on what stands out
                before you decide whether to visit a retailer.
              </p>

            </div>


            <div className="grid gap-8">

              {product.description && (
                <div>

                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                    What stands out
                  </h3>


                  <p className="mt-4 max-w-3xl text-[17px] leading-8 text-[var(--muted)] sm:text-lg">
                    {product.description}
                  </p>

                </div>
              )}


              {product.features.length >
                0 && (
                <div className="border-t border-[var(--line)] pt-7">

                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                    Key features
                  </h3>


                  <dl className="mt-5 divide-y divide-[var(--line)]">

                    {product.features.map(
                      (
                        feature
                      ) => (

                        <div
                          key={
                            feature.id
                          }
                          className="grid gap-2 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] sm:gap-8"
                        >

                          <dt className="text-sm font-semibold">
                            {feature.label}
                          </dt>


                          <dd className="text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
                            {feature.value}
                          </dd>

                        </div>

                      )
                    )}

                  </dl>

                </div>
              )}

            </div>

          </div>

        </section>
      )}


      {/* Variants and retailer offers */}

      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Before you go
            </p>


            <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">
              Options and availability.
            </h2>


            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
              Review available variants and merchant
              information before continuing to the retailer.
            </p>


            {product.variants.length >
              0 && (
              <div className="mt-8">

                <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                  Available options
                </p>


                <div className="mt-4 flex flex-wrap gap-2">

                  {product.variants.map(
                    (
                      variant
                    ) => (

                      <span
                        key={
                          variant.id
                        }
                        className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
                      >
                        {variant.name}
                      </span>

                    )
                  )}

                </div>

              </div>
            )}

          </div>


          <div>

            <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                  Retailer information
                </p>


                <p className="mt-2 text-sm text-[var(--muted)]">
                  {product.providerProducts.length >
                  0
                    ? `${product.providerProducts.length} available retailer ${
                        product.providerProducts.length ===
                        1
                          ? "record"
                          : "records"
                      }`
                    : "No retailer data currently available"}
                </p>

              </div>


              <ShoppingBag
                aria-hidden="true"
                size={
                  20
                }
                className="text-[var(--muted)]"
              />

            </div>


            {product.providerProducts.length >
            0 ? (
              <div className="divide-y divide-[var(--line)]">

                {product.providerProducts.map(
                  (
                    offer
                  ) => (

                    <div
                      key={
                        offer.id
                      }
                      className="grid gap-4 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8"
                    >

                      <div>

                        <p className="text-base font-semibold">
                          {offer.provider.name}
                        </p>


                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {normalizeAvailability(
                            offer.availability
                          )}
                        </p>

                      </div>


                      <div className="sm:text-right">

                        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                          Listed price
                        </p>


                        <p className="mt-1 text-base font-semibold">
                          {offer.price !==
                          null
                            ? formatPrice(
                                offer.price,
                                offer.currency
                              )
                            : "Check retailer"}
                        </p>

                      </div>


                      <Link
                        href={
                          buildProviderGoHref(
                            offer.provider.slug
                          )
                        }
                        prefetch={
                          false
                        }
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-[var(--ink)] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:bg-[var(--ink)] hover:text-white"
                      >
                        Check retailer

                        <ArrowRight
                          size={
                            12
                          }
                        />
                      </Link>

                    </div>

                  )
                )}

              </div>
            ) : (
              <div className="py-8">

                <p className="text-sm leading-6 text-[var(--muted)]">
                  Retailer availability is currently unavailable.
                  You can check back later for an updated destination.
                </p>

              </div>
            )}

          </div>

        </div>

      </section>


      {/* Affiliate context */}

      <section className="container-shell">

        <div className="rounded-2xl border border-[var(--line)] bg-[#efeee9] p-6 sm:p-8">

          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">

            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white">

              <ShieldCheck
                size={
                  20
                }
              />

            </div>


            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                How Venuvella links work
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Editorial discovery first.
              </h2>


              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                Venuvella is an editorial discovery platform,
                not the retailer. Product prices, stock and
                fulfillment are controlled by the merchant.
                When an affiliate link is used, Venuvella may
                earn a commission without increasing your price.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* Related products */}

      {relatedProducts.length >
        0 && (
        <section className="container-shell mt-20 border-t border-[var(--line)] pt-14 sm:mt-24">

          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Keep exploring
              </p>


              <h2 className="display-serif mt-3 text-4xl tracking-[-0.025em] sm:text-5xl">
                Related products
              </h2>

            </div>


            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
            >
              More in {product.category.name}

              <ArrowRight
                size={
                  13
                }
              />
            </Link>

          </div>


          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">

            {relatedProducts.map(
              (
                item
              ) => (

                <ProductCard
                  key={
                    item.id
                  }
                  brand={
                    item.brand?.name ??
                    "Venuvella"
                  }
                  name={
                    item.name
                  }
                  summary={
                    item.editorialSummary ??
                    ""
                  }
                  image={
                    item.images[0]
                      ?.url ??
                    "/placeholder.png"
                  }
                  slug={
                    item.slug
                  }
                />

              )
            )}

          </div>

        </section>
      )}



      {/* Mobile conversion bar */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--paper)]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(32,33,31,0.08)] backdrop-blur sm:hidden">

        <div className="mx-auto flex max-w-[1180px] items-center gap-3">

          <div className="min-w-0 flex-1">

            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {bestPrice
                ? `From ${formatPrice(bestPrice.price!, bestPrice.currency)}`
                : "Current retailer"}
            </p>

            <p className="mt-0.5 truncate text-xs font-semibold">
              {bestPrice?.provider.name ?? product.name}
            </p>

          </div>

          <Link
            href={goHref}
            prefetch={false}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] !text-white"
          >
            <span className="text-white">
              Check retailer
            </span>

            <ExternalLink
              aria-hidden="true"
              size={12}
              className="text-white"
            />
          </Link>

        </div>

        <p className="mx-auto mt-1.5 max-w-[1180px] text-right text-[9px] leading-4 text-[var(--muted)]">
          Affiliate link · retailer price and availability may change
        </p>

      </div>
    </main>
  );
}


function TrustPoint({
  icon,
  title,
  body,
}: {
  icon:
    "edit" |
    "shop" |
    "shield";

  title:
    string;

  body:
    string;
}) {
  const Icon =
    icon ===
    "shop"
      ? ShoppingBag
      : icon ===
          "shield"
        ? ShieldCheck
        : Sparkles;


  return (
    <div className="border-t border-[var(--line)] pt-4">

      <Icon
        aria-hidden="true"
        size={
          16
        }
        className="text-[var(--accent)]"
      />


      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>


      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        {body}
      </p>

    </div>
  );
}

