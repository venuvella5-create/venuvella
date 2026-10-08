import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  ShoppingBag,
} from "lucide-react";

import {
  ProductCard,
} from "@/components/editorial/ProductCard";

import {
  ArticleViewTracker,
} from "@/components/analytics/ArticleViewTracker";

import {
  getArticleBySlug,
  getPublishedArticleSlugs,
} from "@/lib/content/articles";

const getCachedArticleBySlug =
  cache(
    getArticleBySlug
  );


import {
  prisma,
} from "@/lib/db/prisma";


export const revalidate =
  300;


export async function generateStaticParams() {
  const slugs =
    await getPublishedArticleSlugs();


  return slugs.map(
    (slug) => ({
      slug,
    })
  );
}


function getBlockText(
  data: unknown
) {
  if (
    typeof data ===
      "object" &&
    data !==
      null &&
    !Array.isArray(
      data
    ) &&
    "text" in
      data
  ) {
    const value =
      (
        data as Record<
          string,
          unknown
        >
      ).text;


    if (
      typeof value ===
      "string"
    ) {
      return value;
    }


    if (
      value !==
        null &&
      value !==
        undefined
    ) {
      return String(
        value
      );
    }
  }


  return "";
}


function getProductId(
  data: unknown
) {
  if (
    typeof data ===
      "object" &&
    data !==
      null &&
    !Array.isArray(
      data
    ) &&
    "productId" in
      data
  ) {
    const value =
      (
        data as Record<
          string,
          unknown
        >
      ).productId;


    if (
      typeof value ===
      "string"
    ) {
      return value;
    }
  }


  return null;
}


function getProductIds(
  data: unknown
) {
  if (
    typeof data ===
      "object" &&
    data !==
      null &&
    !Array.isArray(
      data
    ) &&
    "productIds" in
      data
  ) {
    const value =
      (
        data as Record<
          string,
          unknown
        >
      ).productIds;


    if (
      Array.isArray(
        value
      )
    ) {
      return value.filter(
        (
          productId
        ): productId is string =>
          typeof productId ===
            "string" &&
          productId.length >
            0
      );
    }
  }


  return [];
}


function createHeadingId(
  text: string,
  index: number
) {
  const slug =
    text
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );


  return slug
    ? `${slug}-${index + 1}`
    : `section-${index + 1}`;
}


function estimateReadingTime(
  blocks: Array<{
    type: string;
    data: unknown;
  }>,
  title: string,
  subtitle:
    | string
    | null
) {
  const text =
    [
      title,
      subtitle ??
        "",
      ...blocks.map(
        (block) =>
          getBlockText(
            block.data
          )
      ),
    ]
      .join(
        " "
      )
      .trim();


  const words =
    text
      ? text.split(
          /\s+/
        ).length
      : 0;


  return Math.max(
    1,
    Math.ceil(
      words /
        220
    )
  );
}


function formatPublishedDate(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "long",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    value
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


  const article =
    await getCachedArticleBySlug(
      slug
    );


  if (
    !article
  ) {
    return {};
  }


  const title =
    article.seo?.title ??
    article.title;


  const description =
    article.seo?.description ??
    article.excerpt ??
    article.subtitle ??
    undefined;


  const canonical =
    `/articles/${article.slug}`;


  const socialImage =
    article.featuredImage ??
    "/og-default.jpg";


  return {
    title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "article",

      url:
        canonical,

      title,

      description,

      siteName:
        "Venuvella",

      publishedTime:
        article.publishedAt?.toISOString(),

      modifiedTime:
        article.updatedAt.toISOString(),

      authors: [
        article.author.name,
      ],

      section:
        article.category.name,

      images: [
        {
          url:
            socialImage,

          alt:
            article.title,
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


export default async function ArticlePage({
  params,
}: {
  params:
    Promise<{
      slug: string;
    }>;
}) {
  const {
    slug,
  } = await params;


  const article =
    await getCachedArticleBySlug(
      slug
    );


  if (
    !article
  ) {
    notFound();
  }


  const productIdSet =
    new Set<string>();


  article.blocks.forEach(
    (block) => {
      if (
        block.type ===
        "PRODUCT"
      ) {
        const productId =
          getProductId(
            block.data
          );


        if (
          productId
        ) {
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
          (
            productId
          ) => {
            productIdSet.add(
              productId
            );
          }
        );
      }
    }
  );


  const productIds =
    Array.from(
      productIdSet
    );


  const products =
    productIds.length >
    0
      ? await prisma.product.findMany({
          where: {
            id: {
              in: productIds,
            },

            status:
              "PUBLISHED",
          },

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
          },
        })
      : [];


  const relatedArticles =
    await prisma.article.findMany({
      where: {
        id: {
          not:
            article.id,
        },

        categoryId:
          article.categoryId,

        status:
          "PUBLISHED",

        publishedAt: {
          lte:
            new Date(),
        },
      },

      orderBy: [
        {
          publishedAt:
            "desc",
        },
        {
          updatedAt:
            "desc",
        },
      ],

      take:
        3,

      select: {
        id:
          true,

        title:
          true,

        slug:
          true,

        excerpt:
          true,
      },
    });


  const productMap =
    new Map(
      products.map(
        (
          product
        ) => [
          product.id,
          product,
        ]
      )
    );


  const readingMinutes =
    estimateReadingTime(
      article.blocks,
      article.title,
      article.subtitle
    );


  const headingItems =
    article.blocks
      .map(
        (
          block,
          index
        ) => ({
          id:
            block.id,

          index,

          type:
            block.type,

          text:
            getBlockText(
              block.data
            ),
        })
      )
      .filter(
        (
          block
        ) =>
          block.type ===
            "HEADING" &&
          block.text.trim()
            .length >
            0
      )
      .map(
        (
          block
        ) => ({
          ...block,

          anchor:
            createHeadingId(
              block.text,
              block.index
            ),
        })
      );


  const headingAnchorMap =
    new Map(
      headingItems.map(
        (
          item
        ) => [
          item.id,
          item.anchor,
        ]
      )
    );


  const hasProducts =
    productIds.length >
    0;


  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://venuvella.vercel.app";


  const articleUrl =
    new URL(
      `/articles/${article.slug}`,
      siteUrl
    ).toString();


  const articleStructuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      article.title,

    description:
      article.seo?.description ??
      article.excerpt ??
      article.subtitle ??
      undefined,

    image:
      article.featuredImage
        ? [
            article.featuredImage,
          ]
        : undefined,

    datePublished:
      article.publishedAt?.toISOString(),

    dateModified:
      article.updatedAt.toISOString(),

    inLanguage:
      "en-US",

    author: {
      "@type":
        "Person",

      name:
        article.author.name,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "Venuvella",

      url:
        siteUrl,
    },

    articleSection:
      article.category.name,

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        articleUrl,
    },

    url:
      articleUrl,
  };


  const breadcrumbStructuredData = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement: [
      {
        "@type":
          "ListItem",

        position:
          1,

        name:
          "Home",

        item:
          siteUrl,
      },
      {
        "@type":
          "ListItem",

        position:
          2,

        name:
          article.category.name,

        item:
          new URL(
            `/${article.category.slug}`,
            siteUrl
          ).toString(),
      },
      {
        "@type":
          "ListItem",

        position:
          3,

        name:
          article.title,

        item:
          articleUrl,
      },
    ],
  };


  const structuredData = [
    articleStructuredData,
    breadcrumbStructuredData,
  ];


  return (
    <main className="pb-20 sm:pb-28">

      <ArticleViewTracker slug={article.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />


      <article>

        {/* Article masthead */}

        <header className="border-b border-[var(--line)]">

          <div className="container-shell py-10 sm:py-14 lg:py-16">

            <Link
              href={`/${article.category.slug}`}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              <ArrowLeft
                size={
                  14
                }
              />

              {article.category.name}
            </Link>


            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">

              <div className="max-w-5xl">

                <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)] sm:text-xs">
                  {article.category.name}
                </p>


                <h1 className="display-serif mt-4 text-5xl leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-[76px] xl:text-[88px]">
                  {article.title}
                </h1>


                {article.subtitle && (
                  <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
                    {article.subtitle}
                  </p>
                )}


                {!article.subtitle &&
                  article.excerpt && (
                    <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
                      {article.excerpt}
                    </p>
                  )}

              </div>


              <div className="border-t border-[var(--line)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">

                <p className="text-xs leading-6 text-[var(--muted)]">
                  By{" "}
                  <span className="font-semibold text-[var(--ink)]">
                    {article.author.name}
                  </span>
                </p>


                {article.publishedAt && (
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                    Published{" "}
                    {formatPublishedDate(
                      article.publishedAt
                    )}
                  </p>
                )}


                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">

                  <Clock3
                    size={
                      14
                    }
                  />

                  <span>
                    {readingMinutes} min read
                  </span>

                </div>


                {hasProducts && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">

                    <ShoppingBag
                      size={
                        14
                      }
                    />

                    <span>
                      Product recommendations included
                    </span>

                  </div>
                )}

              </div>

            </div>

          </div>

        </header>


        {/* Featured image */}

        {article.featuredImage && (
          <div className="container-shell pt-8 sm:pt-10">

            <div className="relative aspect-[16/9] overflow-hidden bg-[var(--warm)]">

              <Image
                src={
                  article.featuredImage
                }
                alt={
                  article.title
                }
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1180px"
                className="object-cover"
              />

            </div>

          </div>
        )}


        {/* Reading layout */}

        <div className="container-shell mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[220px_minmax(0,760px)_1fr] lg:items-start">

          {/* Reading rail */}

          <aside className="hidden lg:block">

            <div className="sticky top-28">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                In this story
              </p>


              {headingItems.length >
              0 ? (
                <nav
                  aria-label="Article sections"
                  className="mt-5 space-y-3 border-l border-[var(--line)] pl-4"
                >

                  {headingItems.map(
                    (
                      item
                    ) => (

                      <a
                        key={
                          item.id
                        }
                        href={`#${item.anchor}`}
                        className="block text-xs leading-5 text-[var(--muted)] transition hover:text-[var(--ink)]"
                      >
                        {item.text}
                      </a>

                    )
                  )}

                </nav>
              ) : (
                <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                  A concise Venuvella edit.
                </p>
              )}


              <div className="mt-8 border-t border-[var(--line)] pt-5">

                <p className="text-xs leading-6 text-[var(--muted)]">
                  Thoughtful editorial guidance,
                  selected for usefulness and context.
                </p>

              </div>

            </div>

          </aside>


          {/* Article body */}

          <div className="min-w-0">

            {article.excerpt &&
              article.subtitle && (
                <p className="mb-10 border-l-2 border-[var(--accent)] pl-5 text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
                  {article.excerpt}
                </p>
              )}


            <div>

              {article.blocks.map(
                (
                  block,
                  blockIndex
                ) => {

                  if (
                    block.type ===
                    "PRODUCT"
                  ) {
                    const productId =
                      getProductId(
                        block.data
                      );


                    if (
                      !productId
                    ) {
                      return null;
                    }


                    const product =
                      productMap.get(
                        productId
                      );


                    if (
                      !product
                    ) {
                      return (
                        <aside
                          key={
                            block.id
                          }
                          className="my-10 rounded-2xl border border-[var(--line)] bg-[#efeee9] p-5"
                        >

                          <p className="text-sm leading-6 text-[var(--muted)]">
                            This product is currently unavailable.
                          </p>

                        </aside>
                      );
                    }


                    return (
                      <section
                        key={
                          block.id
                        }
                        className="my-14 border-y border-[var(--line)] py-8"
                      >

                        <div className="mb-6">

                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                            Venuvella pick
                          </p>


                          <h2 className="display-serif mt-2 text-3xl leading-tight">
                            From this story
                          </h2>

                        </div>


                        <div className="max-w-sm">

                          <ProductCard
                            brand={
                              product.brand
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
                              product.images[0]
                                ?.url ??
                              "/placeholder.png"
                            }
                            slug={`${product.slug}?article=${encodeURIComponent(
                              article.slug
                            )}`}
                          />

                        </div>

                      </section>
                    );
                  }


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
                          className="my-10 rounded-2xl border border-[var(--line)] bg-[#efeee9] p-5"
                        >

                          <p className="text-sm leading-6 text-[var(--muted)]">
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
                        className="my-16 border-y border-[var(--line)] py-9"
                      >

                        <div className="mb-8">

                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                            Venuvella picks
                          </p>


                          <h2 className="display-serif mt-2 text-3xl leading-tight sm:text-4xl">
                            Products from this story
                          </h2>


                          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                            A short list of products connected to the ideas in this article.
                          </p>

                        </div>


                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">

                          {gridProducts.map(
                            (
                              product
                            ) => (

                              <ProductCard
                                key={
                                  product.id
                                }
                                brand={
                                  product.brand
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
                                  product.images[0]
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


                  const text =
                    getBlockText(
                      block.data
                    );


                  if (
                    block.type ===
                    "HEADING"
                  ) {
                    return (
                      <h2
                        key={
                          block.id
                        }
                        id={
                          headingAnchorMap.get(
                            block.id
                          ) ??
                          createHeadingId(
                            text,
                            blockIndex
                          )
                        }
                        className="display-serif scroll-mt-28 pb-1 pt-8 text-3xl leading-[1.08] tracking-[-0.02em] sm:text-4xl"
                      >
                        {text}
                      </h2>
                    );
                  }


                  if (
                    block.type ===
                    "QUOTE"
                  ) {
                    return (
                      <blockquote
                        key={
                          block.id
                        }
                        className="display-serif my-10 border-l-2 border-[var(--accent)] pl-6 text-2xl leading-[1.25] tracking-[-0.015em] text-[var(--ink)] sm:text-3xl"
                      >
                        {text}
                      </blockquote>
                    );
                  }


                  if (
                    block.type ===
                    "BULLET_LIST"
                  ) {
                    const items =
                      text
                        .split(
                          "\n"
                        )
                        .map(
                          (
                            item
                          ) =>
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
                        className="my-7 list-disc space-y-3 pl-6 text-[17px] leading-8 text-[var(--ink)] sm:text-lg"
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


                  if (
                    block.type ===
                    "NUMBERED_LIST"
                  ) {
                    const items =
                      text
                        .split(
                          "\n"
                        )
                        .map(
                          (
                            item
                          ) =>
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
                        className="my-7 list-decimal space-y-3 pl-6 text-[17px] leading-8 text-[var(--ink)] sm:text-lg"
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


                  if (
                    block.type ===
                    "AFFILIATE_DISCLOSURE"
                  ) {
                    return (
                      <aside
                        key={
                          block.id
                        }
                        className="my-9 rounded-2xl border border-[var(--line)] bg-[#efeee9] p-5 text-sm leading-6 text-[var(--muted)]"
                      >
                        {text}
                      </aside>
                    );
                  }


                  if (
                    !text
                  ) {
                    return null;
                  }


                  return (
                    <p
                      key={
                        block.id
                      }
                      className="my-6 text-[17px] leading-8 text-[var(--ink)] sm:text-[19px] sm:leading-9"
                    >
                      {text}
                    </p>
                  );
                }
              )}

            </div>


            {relatedArticles.length >
              0 && (
              <section className="mt-16 border-t border-[var(--line)] pt-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                  Related reading
                </p>

                <h2 className="display-serif mt-3 text-3xl leading-tight sm:text-4xl">
                  More from {article.category.name}
                </h2>

                <div className="mt-7 grid gap-4">
                  {relatedArticles.map(
                    (
                      relatedArticle
                    ) => (
                      <Link
                        key={
                          relatedArticle.id
                        }
                        href={`/articles/${relatedArticle.slug}`}
                        className="group rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <p className="text-lg font-semibold leading-7 group-hover:underline">
                          {relatedArticle.title}
                        </p>

                        {relatedArticle.excerpt && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                            {relatedArticle.excerpt}
                          </p>
                        )}

                        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]">
                          Read article

                          <ArrowRight
                            size={
                              13
                            }
                          />
                        </span>
                      </Link>
                    )
                  )}
                </div>
              </section>
            )}


            {/* End matter */}

            <footer className="mt-16 border-t border-[var(--line)] pt-8">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Continue exploring
              </p>


              <div className="mt-5 flex flex-wrap gap-3">

                <Link
                  href={`/${article.category.slug}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--ink)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] transition hover:bg-[var(--ink)] hover:text-white"
                >
                  More in {article.category.name}

                  <ArrowRight
                    size={
                      13
                    }
                  />
                </Link>


                <Link
                  href="/articles"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white"
                >
                  All articles

                  <ArrowRight
                    size={
                      13
                    }
                  />
                </Link>

              </div>

            </footer>

          </div>


          <div className="hidden lg:block" />

        </div>

      </article>

    </main>
  );
}
