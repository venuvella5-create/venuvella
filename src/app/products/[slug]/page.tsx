import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products/queries";

import { ProductCard } from "@/components/editorial/ProductCard";


export default async function ProductDetailPage({
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
   * Attribution values carried into
   * the affiliate redirect.
   */

  const articleSlug =
    typeof query.article === "string"
      ? query.article
      : null;


  const campaign =
    typeof query.campaign === "string"
      ? query.campaign
      : null;


  const utmSource =
    typeof query.utm_source === "string"
      ? query.utm_source
      : null;


  const utmMedium =
    typeof query.utm_medium === "string"
      ? query.utm_medium
      : null;


  const utmCampaign =
    typeof query.utm_campaign === "string"
      ? query.utm_campaign
      : null;


  /*
   * Load product.
   */

  const product =
    await getProductBySlug(
      slug
    );


  if (!product) {
    notFound();
  }


  /*
   * Related products.
   */

  const relatedProducts =
    await getRelatedProducts(
      product.id,
      product.categoryId
    );


  const primaryImage =
    product.images[0];


  /*
   * Build affiliate redirect URL while
   * preserving article + campaign context.
   */

  const goParams =
    new URLSearchParams();


  if (articleSlug) {
    goParams.set(
      "article",
      articleSlug
    );
  }


  if (campaign) {
    goParams.set(
      "campaign",
      campaign
    );
  }


  if (utmSource) {
    goParams.set(
      "utm_source",
      utmSource
    );
  }


  if (utmMedium) {
    goParams.set(
      "utm_medium",
      utmMedium
    );
  }


  if (utmCampaign) {
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


  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">

      {/* Breadcrumb */}

      <nav
        aria-label="Breadcrumb"
        className="mb-10 text-xs uppercase tracking-[0.14em] text-[var(--muted)]"
      >

        <Link
          href="/products"
          className="transition hover:text-[var(--ink)]"
        >
          Products
        </Link>


        <span className="mx-2">
          /
        </span>


        <Link
          href={`/products?category=${product.category.slug}`}
          className="transition hover:text-[var(--ink)]"
        >
          {product.category.name}
        </Link>

      </nav>


      {/* Product hero */}

      <section className="grid gap-12 lg:grid-cols-2 lg:gap-16">

        {/* Product image */}

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
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />

          ) : (

            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              Product image unavailable
            </div>

          )}

        </div>


        {/* Product information */}

        <div className="flex flex-col justify-center">

          {/* Brand */}

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {product.brand?.name ??
              "Venuvella"}
          </p>


          {/* Product name */}

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {product.name}
          </h1>


          {/* Editorial summary */}

          {product.editorialSummary && (

            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)]">
              {
                product.editorialSummary
              }
            </p>

          )}


          {/* Description */}

          {product.description && (

            <div className="mt-8 border-t border-[var(--border)] pt-8">

              <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                Why it stands out
              </h2>


              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {
                  product.description
                }
              </p>

            </div>

          )}


          {/* Product features */}

          {product.features.length >
            0 && (

            <div className="mt-8 border-t border-[var(--border)] pt-8">

              <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                Key features
              </h2>


              <dl className="mt-5 divide-y divide-[var(--border)]">

                {product.features.map(
                  (feature) => (

                    <div
                      key={feature.id}
                      className="
                        grid
                        grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]
                        gap-6
                        py-4
                      "
                    >

                      <dt className="text-sm font-medium">
                        {
                          feature.label
                        }
                      </dt>


                      <dd className="text-sm leading-6 text-[var(--muted)]">
                        {
                          feature.value
                        }
                      </dd>

                    </div>

                  )
                )}

              </dl>

            </div>

          )}


          {/* Product variants */}

          {product.variants.length >
            0 && (

            <div className="mt-8 border-t border-[var(--border)] pt-8">

              <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                Available options
              </h2>


              <div className="mt-5 flex flex-wrap gap-3">

                {product.variants.map(
                  (variant) => (

                    <span
                      key={
                        variant.id
                      }
                      className="
                        inline-flex
                        border
                        border-[var(--border)]
                        px-4
                        py-2
                        text-sm
                      "
                    >
                      {
                        variant.name
                      }
                    </span>

                  )
                )}

              </div>

            </div>

          )}


          {/* Provider availability */}

          {product.providerProducts
            .length > 0 && (

            <div className="mt-8 border-t border-[var(--border)] pt-8">

              <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                Where to find it
              </h2>


              <div className="mt-5 space-y-4">

                {product.providerProducts.map(
                  (offer) => (

                    <div
                      key={offer.id}
                      className="
                        flex
                        flex-col
                        gap-3
                        border-b
                        border-[var(--border)]
                        pb-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >

                      <div>

                        <p className="text-sm font-medium">
                          {
                            offer.provider
                              .name
                          }
                        </p>


                        {offer.availability && (

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {
                              offer.availability
                            }
                          </p>

                        )}

                      </div>


                      {offer.price !==
                        null && (

                        <p className="text-sm font-medium">

                          {
                            offer.currency ??
                            ""
                          }

                          {" "}

                          {
                            offer.price.toString()
                          }

                        </p>

                      )}

                    </div>

                  )
                )}

              </div>

            </div>

          )}


          {/* Affiliate CTA */}

          <div className="mt-10">

            <Link
              href={goHref}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                bg-black
                px-7
                py-4
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.15em]
                !text-white
                no-underline
                transition
                hover:opacity-80
              "
              style={{
                color:
                  "#ffffff",
              }}
            >
              <span className="text-white">
                See product
              </span>
            </Link>

          </div>


          {/* Affiliate disclosure */}

          <p className="mt-6 max-w-xl text-xs leading-5 text-[var(--muted)]">
            Disclosure: Venuvella may earn a commission when you purchase
            through links on our site, at no additional cost to you.
          </p>

        </div>

      </section>


      {/* Related products */}

      {relatedProducts.length >
        0 && (

        <section className="mt-24 border-t border-[var(--border)] pt-14">

          <div className="mb-10">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Keep exploring
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Related products
            </h2>

          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-14
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            {relatedProducts.map(
              (item) => (

                <ProductCard
                  key={item.id}
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

    </main>
  );
}