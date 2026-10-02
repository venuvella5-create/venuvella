import { notFound } from "next/navigation";
import Image from "next/image";

import { getArticleBySlug } from "@/lib/content/articles";
import { prisma } from "@/lib/db/prisma";
import { ProductCard } from "@/components/editorial/ProductCard";


export const dynamic = "force-dynamic";


function getBlockText(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "text" in data
  ) {
    const value =
      (data as Record<string, unknown>).text;

    if (typeof value === "string") {
      return value;
    }

    if (
      value !== null &&
      value !== undefined
    ) {
      return String(value);
    }
  }

  return "";
}


function getProductId(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "productId" in data
  ) {
    const value =
      (data as Record<string, unknown>)
        .productId;

    if (typeof value === "string") {
      return value;
    }
  }

  return null;
}


function getProductIds(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "productIds" in data
  ) {
    const value =
      (data as Record<string, unknown>)
        .productIds;

    if (Array.isArray(value)) {
      return value.filter(
        (
          productId
        ): productId is string =>
          typeof productId ===
            "string" &&
          productId.length > 0
      );
    }
  }

  return [];
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const article =
    await getArticleBySlug(slug);


  if (!article) {
    return {};
  }


  return {
    title:
      article.seo?.title ??
      article.title,

    description:
      article.seo?.description ??
      article.excerpt ??
      undefined,
  };
}


export default async function ArticlePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const article =
    await getArticleBySlug(slug);


  if (!article) {
    notFound();
  }


  /*
   * Collect all product IDs used by
   * PRODUCT and PRODUCT_GRID blocks.
   */

  const productIdSet =
    new Set<string>();


  article.blocks.forEach(
    (block) => {

      if (
        block.type === "PRODUCT"
      ) {
        const productId =
          getProductId(block.data);

        if (productId) {
          productIdSet.add(
            productId
          );
        }
      }


      if (
        block.type ===
        "PRODUCT_GRID"
      ) {
        const productIds =
          getProductIds(
            block.data
          );

        productIds.forEach(
          (productId) => {
            productIdSet.add(
              productId
            );
          }
        );
      }

    }
  );


  const productIds =
    Array.from(productIdSet);


  /*
   * Fetch current product information
   * from the central product database.
   */

  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: {
            id: {
              in: productIds,
            },

            status:
              "PUBLISHED",
          },

          include: {
            brand: true,

            category: true,

            images: {
              orderBy: {
                position:
                  "asc",
              },
            },
          },
        })
      : [];


  /*
   * Fast lookup by product ID.
   */

  const productMap =
    new Map(
      products.map(
        (product) => [
          product.id,
          product,
        ]
      )
    );


  return (
    <main className="container-shell py-12 sm:py-20">

      <article className="mx-auto max-w-4xl">

        {/* Article header */}

        <div className="max-w-3xl">

          <p className="admin-eyebrow">
            {article.category.name}
          </p>


          <h1 className="display-serif mt-3 text-5xl leading-[.98] tracking-[-.035em] sm:text-7xl">
            {article.title}
          </h1>


          {article.subtitle && (
            <p className="mt-6 text-lg leading-7 text-[var(--muted)]">
              {article.subtitle}
            </p>
          )}


          <div className="mt-6 text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--muted)]">

            By {article.author.name}

            {article.publishedAt && (
              <>
                {" · "}
                {article.publishedAt.toLocaleDateString()}
              </>
            )}

          </div>

        </div>


        {/* Featured image */}

        {article.featuredImage && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden">

            <Image
              src={
                article.featuredImage
              }
              alt={
                article.title
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 960px"
              className="object-cover"
            />

          </div>
        )}


        {/* Article body */}

        <div className="prose-venuvella mx-auto mt-10 max-w-3xl">

          {article.blocks.map(
            (block) => {

              /*
               * SINGLE PRODUCT
               */

              if (
                block.type ===
                "PRODUCT"
              ) {
                const productId =
                  getProductId(
                    block.data
                  );


                if (!productId) {
                  return null;
                }


                const product =
                  productMap.get(
                    productId
                  );


                if (!product) {
                  return (
                    <aside
                      key={
                        block.id
                      }
                      className="not-prose my-10 border border-[var(--line)] bg-[#efeee9] p-5"
                    >
                      <p className="text-sm text-[var(--muted)]">
                        This product is currently unavailable.
                      </p>
                    </aside>
                  );
                }


                return (
                  <div
                    key={
                      block.id
                    }
                    className="not-prose my-12"
                  >
                    <ProductCard
                      brand={
                        product
                          .brand
                          ?.name ??
                        "Venuvella"
                      }
                      name={
                        product.name
                      }
                      summary={
                        product.editorialSummary ??
                        ""
                      }
                      image={
                        product
                          .images[0]
                          ?.url ??
                        "/placeholder.png"
                      }
                      slug={`${product.slug}?article=${encodeURIComponent(
  article.slug
)}`}
                    />
                  </div>
                );
              }


              /*
               * PRODUCT GRID
               */

              if (
                block.type ===
                "PRODUCT_GRID"
              ) {
                const gridIds =
                  getProductIds(
                    block.data
                  );


                const gridProducts =
                  gridIds
                    .map(
                      (
                        productId
                      ) =>
                        productMap.get(
                          productId
                        )
                    )
                    .filter(
                      (
                        product
                      ): product is NonNullable<
                        typeof product
                      > =>
                        Boolean(
                          product
                        )
                    );


                if (
                  gridProducts.length ===
                  0
                ) {
                  return (
                    <aside
                      key={
                        block.id
                      }
                      className="not-prose my-10 border border-[var(--line)] bg-[#efeee9] p-5"
                    >
                      <p className="text-sm text-[var(--muted)]">
                        These products are currently unavailable.
                      </p>
                    </aside>
                  );
                }


                return (
                  <section
                    key={
                      block.id
                    }
                    className="not-prose my-14"
                  >

                    <div className="mb-7 border-b border-[var(--line)] pb-4">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                        Venuvella picks
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Products from this story
                      </h2>

                    </div>


                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-x-6
                        gap-y-10
                        sm:grid-cols-2
                        lg:grid-cols-3
                      "
                    >

                      {gridProducts.map(
                        (product) => (
                          <ProductCard
                            key={
                              product.id
                            }
                            brand={
                              product
                                .brand
                                ?.name ??
                              "Venuvella"
                            }
                            name={
                              product.name
                            }
                            summary={
                              product.editorialSummary ??
                              ""
                            }
                            image={
                              product
                                .images[0]
                                ?.url ??
                              "/placeholder.png"
                            }
                            slug={`${product.slug}?article=${encodeURIComponent(
  article.slug
)}`}
                          />
                        )
                      )}

                    </div>

                  </section>
                );
              }


              /*
               * STANDARD TEXT BLOCKS
               */

              const text =
                getBlockText(
                  block.data
                );


              /*
               * HEADING
               */

              if (
                block.type ===
                "HEADING"
              ) {
                return (
                  <h2
                    key={
                      block.id
                    }
                  >
                    {text}
                  </h2>
                );
              }


              /*
               * QUOTE
               */

              if (
                block.type ===
                "QUOTE"
              ) {
                return (
                  <blockquote
                    key={
                      block.id
                    }
                  >
                    {text}
                  </blockquote>
                );
              }


              /*
               * BULLET LIST
               */

              if (
                block.type ===
                "BULLET_LIST"
              ) {
                const items =
                  text
                    .split("\n")
                    .map(
                      (item) =>
                        item.trim()
                    )
                    .filter(
                      Boolean
                    );


                return (
                  <ul
                    key={
                      block.id
                    }
                  >
                    {items.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                );
              }


              /*
               * NUMBERED LIST
               */

              if (
                block.type ===
                "NUMBERED_LIST"
              ) {
                const items =
                  text
                    .split("\n")
                    .map(
                      (item) =>
                        item.trim()
                    )
                    .filter(
                      Boolean
                    );


                return (
                  <ol
                    key={
                      block.id
                    }
                  >
                    {items.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {item}
                        </li>
                      )
                    )}
                  </ol>
                );
              }


              /*
               * AFFILIATE DISCLOSURE
               */

              if (
                block.type ===
                "AFFILIATE_DISCLOSURE"
              ) {
                return (
                  <aside
                    key={
                      block.id
                    }
                    className="not-prose my-8 border border-[var(--line)] bg-[#efeee9] p-4 text-xs leading-5 text-[var(--muted)]"
                  >
                    {text}
                  </aside>
                );
              }


              /*
               * SAFE FALLBACK
               */

              if (!text) {
                return null;
              }


              return (
                <p
                  key={
                    block.id
                  }
                >
                  {text}
                </p>
              );
            }
          )}

        </div>

      </article>

    </main>
  );
}