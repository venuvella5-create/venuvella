import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ExternalLink,
  Sparkles,
  Tag,
} from "lucide-react";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export const metadata: Metadata = {
  title:
    "Deals",

  description:
    "Explore current retailer pricing and product opportunities selected by Venuvella.",
};


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


export default async function DealsPage() {
  const products =
    await prisma.product.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      orderBy: {
        updatedAt:
          "desc",
      },

      take:
        16,

      include: {
        brand:
          true,

        category:
          true,

        images: {
          orderBy: {
            position:
              "asc",
          },
        },

        providerProducts: {
          include: {
            provider:
              true,
          },
        },
      },
    });


  const pricedProducts =
    products
      .map(
        (
          product
        ) => {
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


          return {
            ...product,

            bestOffer:
              pricedOffers[0] ??
              null,

            pricedOfferCount:
              pricedOffers.length,
          };
        }
      )
      .filter(
        (
          product
        ) =>
          product.bestOffer !==
          null
      );


  const featuredProduct =
    pricedProducts[0] ??
    null;


  const remainingProducts =
    pricedProducts.slice(
      1
    );


  return (
    <main className="pb-20 sm:pb-28">

      <section className="border-b border-[var(--line)]">

        <div className="container-shell py-14 sm:py-18 lg:py-22">

          <div className="max-w-4xl">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">

              <Tag
                aria-hidden="true"
                size={
                  15
                }
              />

              <span>
                The Deals Edit
              </span>

            </div>


            <h1 className="display-serif mt-5 max-w-4xl text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">

              Worth exploring
              right now.

            </h1>


            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">

              A price-aware edit
              of products currently
              carrying retailer
              pricing across the
              Venuvella catalog.

            </p>


            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">

              Prices can change
              after you leave
              Venuvella, so always
              confirm the latest
              amount and
              availability with the
              retailer.

            </p>

          </div>

        </div>

      </section>


      {featuredProduct && (

        <section className="container-shell py-14 sm:py-18">

          <Link
            href={`/products/${featuredProduct.slug}`}
            className="group block"
          >

            <div className="grid gap-9 border-b border-[var(--line)] pb-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pb-18">

              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">

                {featuredProduct.images[0] ? (

                  <Image
                    src={
                      featuredProduct.images[0].url
                    }
                    alt={
                      featuredProduct.images[0].altText ??
                      featuredProduct.name
                    }
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.015]"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
                    Product image unavailable
                  </div>

                )}

              </div>


              <div className="flex flex-col justify-center">

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">

                  Featured price
                  opportunity

                </p>


                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                  {featuredProduct.brand?.name ??
                    featuredProduct.category.name}

                </p>


                <h2 className="display-serif mt-3 text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">

                  {featuredProduct.name}

                </h2>


                {featuredProduct.editorialSummary && (

                  <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg sm:leading-9">

                    {featuredProduct.editorialSummary}

                  </p>

                )}


                <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[#f4f1ea] p-5 sm:p-6">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Current price reference
                  </p>


                  <div className="mt-2 flex flex-wrap items-end justify-between gap-4">

                    <div>

                      <p className="text-3xl font-semibold">

                        {formatPrice(
                          featuredProduct.bestOffer!.price!,
                          featuredProduct.bestOffer!.currency
                        )}

                      </p>


                      <p className="mt-1 text-xs text-[var(--muted)]">

                        Listed by
                        {" "}
                        {featuredProduct.bestOffer!.provider.name}

                      </p>

                    </div>


                    {featuredProduct.pricedOfferCount >
                      1 && (

                      <p className="text-xs leading-6 text-[var(--muted)]">

                        {featuredProduct.pricedOfferCount}
                        {" "}
                        priced retailer
                        options available

                      </p>

                    )}

                  </div>

                </div>


                <div className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em]">

                  View product

                  <ArrowRight
                    aria-hidden="true"
                    size={
                      14
                    }
                    className="transition-transform group-hover:translate-x-1"
                  />

                </div>

              </div>

            </div>

          </Link>

        </section>

      )}


      {remainingProducts.length >
        0 && (

        <section className="container-shell pb-16 sm:pb-20">

          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                Current pricing
              </p>


              <h2 className="display-serif mt-2 text-4xl leading-tight sm:text-5xl">
                More worth checking
              </h2>

            </div>


            <p className="text-sm text-[var(--muted)]">

              {remainingProducts.length}
              {" "}
              priced
              {" "}
              {remainingProducts.length ===
              1
                ? "product"
                : "products"}

            </p>

          </div>


          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">

            {remainingProducts.map(
              (
                product
              ) => {

                const image =
                  product.images[0];


                return (

                  <article
                    key={
                      product.id
                    }
                    className="group"
                  >

                    <Link
                      href={`/products/${product.slug}`}
                      className="block"
                    >

                      <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">

                        {image ? (

                          <Image
                            src={
                              image.url
                            }
                            alt={
                              image.altText ??
                              product.name
                            }
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition duration-500 group-hover:scale-[1.02]"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center px-5 text-center text-sm text-[var(--muted)]">
                            Product image unavailable
                          </div>

                        )}

                      </div>


                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">

                        {product.brand?.name ??
                          product.category.name}

                      </p>


                      <h3 className="display-serif mt-2 text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">

                        {product.name}

                      </h3>


                      {product.editorialSummary && (

                        <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[var(--muted)]">

                          {product.editorialSummary}

                        </p>

                      )}


                      <div className="mt-5 border-t border-[var(--line)] pt-4">

                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          Price reference
                        </p>


                        <p className="mt-1 text-lg font-semibold">

                          {formatPrice(
                            product.bestOffer!.price!,
                            product.bestOffer!.currency
                          )}

                        </p>


                        <div className="mt-4 flex items-center justify-between gap-3">

                          <span className="text-xs text-[var(--muted)]">

                            {product.bestOffer!.provider.name}

                          </span>


                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.11em]">

                            Explore

                            <ArrowRight
                              aria-hidden="true"
                              size={
                                11
                              }
                            />

                          </span>

                        </div>

                      </div>

                    </Link>

                  </article>

                );

              }
            )}

          </div>

        </section>

      )}


      {pricedProducts.length ===
        0 && (

        <section className="container-shell py-16 sm:py-20">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1eee7]">

              <Sparkles
                aria-hidden="true"
                size={
                  20
                }
              />

            </div>


            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Pricing update
            </p>


            <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">

              No current price
              opportunities yet.

            </h2>


            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">

              We’ll surface
              products here as
              retailer pricing
              becomes available.

            </p>


            <Link
              href="/products"
              className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
            >

              <span className="text-white">
                Explore products
              </span>

              <ArrowRight
                aria-hidden="true"
                size={
                  13
                }
                className="text-white"
              />

            </Link>

          </div>

        </section>

      )}


      <section className="border-t border-[var(--line)]">

        <div className="container-shell py-12 sm:py-14">

          <div className="grid gap-6 rounded-2xl bg-[#f4f1ea] p-6 sm:p-8 md:grid-cols-[auto_1fr]">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">

              <ExternalLink
                aria-hidden="true"
                size={
                  18
                }
              />

            </div>


            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                A note on pricing
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Retailers set the final price.
              </h2>


              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">

                Venuvella curates
                product discovery
                and may earn a
                commission from
                qualifying
                affiliate
                purchases. Prices,
                stock and final
                checkout terms are
                controlled by the
                retailer and may
                change without
                notice.

              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}