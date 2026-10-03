import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export const metadata: Metadata = {
  title:
    "Search",

  description:
    "Search Venuvella articles and product recommendations.",

  robots: {
    index:
      false,

    follow:
      true,
  },
};


type SearchPageProps = {
  searchParams:
    Promise<{
      q?:
        string;
    }>;
};


export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const {
    q,
  } = await searchParams;


  const query =
    typeof q ===
    "string"
      ? q.trim()
      : "";


  const hasQuery =
    query.length >
    0;


  const shouldSearch =
    query.length >=
    2;


  const [
    articles,
    products,
  ] =
    shouldSearch
      ? await Promise.all([
          prisma.article.findMany({
            where: {
              status:
                "PUBLISHED",

              OR: [
                {
                  title: {
                    contains:
                      query,

                    mode:
                      "insensitive",
                  },
                },

                {
                  subtitle: {
                    contains:
                      query,

                    mode:
                      "insensitive",
                  },
                },

                {
                  excerpt: {
                    contains:
                      query,

                    mode:
                      "insensitive",
                  },
                },

                {
                  category: {
                    name: {
                      contains:
                        query,

                      mode:
                        "insensitive",
                    },
                  },
                },
              ],
            },

            orderBy: {
              publishedAt:
                "desc",
            },

            take:
              12,

            select: {
              id:
                true,

              slug:
                true,

              title:
                true,

              subtitle:
                true,

              excerpt:
                true,

              featuredImage:
                true,

              publishedAt:
                true,

              category: {
                select: {
                  name:
                    true,

                  slug:
                    true,
                },
              },

              author: {
                select: {
                  name:
                    true,
                },
              },
            },
          }),

          prisma.product.findMany({
            where: {
              status:
                "PUBLISHED",

              OR: [
                {
                  name: {
                    contains:
                      query,

                    mode:
                      "insensitive",
                  },
                },

                {
                  editorialSummary: {
                    contains:
                      query,

                    mode:
                      "insensitive",
                  },
                },

                {
                  description: {
                    contains:
                      query,

                    mode:
                      "insensitive",
                  },
                },

                {
                  brand: {
                    name: {
                      contains:
                        query,

                      mode:
                        "insensitive",
                    },
                  },
                },

                {
                  category: {
                    name: {
                      contains:
                        query,

                      mode:
                        "insensitive",
                    },
                  },
                },
              ],
            },

            orderBy: {
              updatedAt:
                "desc",
            },

            take:
              12,

            select: {
              id:
                true,

              slug:
                true,

              name:
                true,

              editorialSummary:
                true,

              description:
                true,

              brand: {
                select: {
                  name:
                    true,
                },
              },

              category: {
                select: {
                  name:
                    true,

                  slug:
                    true,
                },
              },

              images: {
                orderBy: {
                  position:
                    "asc",
                },

                take:
                  1,

                select: {
                  url:
                    true,

                  altText:
                    true,
                },
              },
            },
          }),
        ])
      : [
          [],
          [],
        ];


  const totalResults =
    articles.length +
    products.length;


  return (
    <main className="pb-20 sm:pb-28">

      <section className="border-b border-[var(--line)]">

        <div className="container-shell py-14 sm:py-18 lg:py-22">

          <div className="max-w-4xl">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">

              <Search
                aria-hidden="true"
                size={
                  15
                }
              />

              <span>
                Search Venuvella
              </span>

            </div>


            <h1 className="display-serif mt-5 max-w-4xl text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">

              Find something
              worth having.

            </h1>


            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">

              Search thoughtful
              articles, product
              recommendations and
              ideas from across
              Venuvella.

            </p>


            <form
              action="/search"
              method="get"
              className="mt-9"
            >

              <div className="flex max-w-3xl flex-col gap-3 sm:flex-row">

                <label
                  htmlFor="site-search"
                  className="sr-only"
                >
                  Search Venuvella
                </label>


                <div className="relative min-w-0 flex-1">

                  <Search
                    aria-hidden="true"
                    size={
                      18
                    }
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />


                  <input
                    id="site-search"
                    name="q"
                    type="search"
                    defaultValue={
                      query
                    }
                    placeholder="Search articles and products"
                    autoComplete="off"
                    className="min-h-[56px] w-full rounded-full border border-[var(--line)] bg-white py-4 pl-13 pr-5 text-base outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--ink)] sm:text-lg"
                  />

                </div>


                <button
                  type="submit"
                  className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-90"
                >

                  <span className="text-white">
                    Search
                  </span>

                  <ArrowRight
                    aria-hidden="true"
                    size={
                      14
                    }
                    className="text-white"
                  />

                </button>

              </div>

            </form>

          </div>

        </div>

      </section>


      {!hasQuery && (

        <section className="container-shell py-16 sm:py-20">

          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                Start exploring
              </p>


              <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">
                Not sure what to
                search for?
              </h2>


              <p className="mt-5 max-w-md text-base leading-8 text-[var(--muted)] sm:text-lg">

                Browse one of our
                core edits and
                discover useful
                ideas without
                starting with a
                specific product.

              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <DiscoveryLink
                href="/beauty"
                label="Beauty"
                description="Tools, routines and considered beauty finds."
              />

              <DiscoveryLink
                href="/home"
                label="Home"
                description="Useful objects and ideas for better everyday spaces."
              />

              <DiscoveryLink
                href="/fitness"
                label="Fitness"
                description="Equipment and ideas for movement at home and beyond."
              />

              <DiscoveryLink
                href="/style"
                label="Style"
                description="Wearable ideas and pieces worth noticing."
              />

            </div>

          </div>

        </section>

      )}


      {hasQuery &&
        !shouldSearch && (

          <section className="container-shell py-16 sm:py-20">

            <div className="max-w-2xl rounded-2xl border border-[var(--line)] bg-[#f4f1ea] p-7 sm:p-9">

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Keep typing
              </p>


              <h2 className="display-serif mt-3 text-3xl sm:text-4xl">
                Search with at
                least two
                characters.
              </h2>


              <p className="mt-4 text-base leading-8 text-[var(--muted)]">

                A slightly more
                specific search
                will give you
                better editorial
                results.

              </p>

            </div>

          </section>

        )}


      {shouldSearch && (

        <>

          <section className="container-shell py-10 sm:py-12">

            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-7">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                  Search results
                </p>


                <h2 className="display-serif mt-2 text-3xl leading-tight sm:text-4xl">

                  Results for
                  {" "}
                  “{query}”

                </h2>

              </div>


              <p className="text-sm text-[var(--muted)] sm:text-base">

                {totalResults}
                {" "}
                {totalResults ===
                1
                  ? "result"
                  : "results"}

              </p>

            </div>

          </section>


          {totalResults ===
            0 ? (

            <section className="container-shell pb-20">

              <div className="mx-auto max-w-2xl py-14 text-center sm:py-20">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1eee7]">

                  <Sparkles
                    aria-hidden="true"
                    size={
                      20
                    }
                  />

                </div>


                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                  No matches yet
                </p>


                <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">

                  We couldn’t find
                  anything for
                  “{query}”.

                </h2>


                <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">

                  Try a broader
                  term, a category
                  such as beauty or
                  home, or the name
                  of a product or
                  brand.

                </p>


                <Link
                  href="/"
                  className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
                >

                  <span className="text-white">
                    Explore Venuvella
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

          ) : (

            <>

              {articles.length >
                0 && (

                <section className="container-shell pb-16 sm:pb-20">

                  <div className="mb-8 flex items-end justify-between gap-4">

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                        Editorial
                      </p>


                      <h2 className="display-serif mt-2 text-4xl leading-tight sm:text-5xl">
                        Articles
                      </h2>

                    </div>


                    <p className="text-sm text-[var(--muted)]">

                      {articles.length}
                      {" "}
                      found

                    </p>

                  </div>


                  <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">

                    {articles.map(
                      (
                        article
                      ) => (

                        <article
                          key={
                            article.id
                          }
                          className="group"
                        >

                          <Link
                            href={`/articles/${article.slug}`}
                            className="block"
                          >

                            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">

                              {article.featuredImage ? (

                                <Image
                                  src={
                                    article.featuredImage
                                  }
                                  alt={
                                    article.title
                                  }
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                                />

                              ) : (

                                <div className="flex h-full items-center justify-center px-5 text-center text-sm text-[var(--muted)]">
                                  Venuvella editorial
                                </div>

                              )}

                            </div>


                            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">

                              {article.category.name}

                            </p>


                            <h3 className="display-serif mt-2 text-3xl leading-[1.08] tracking-[-0.025em]">

                              {article.title}

                            </h3>


                            {(article.excerpt ||
                              article.subtitle) && (

                              <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--muted)] sm:text-base">

                                {article.excerpt ??
                                  article.subtitle}

                              </p>

                            )}


                            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">

                              <span className="text-xs text-[var(--muted)]">

                                By
                                {" "}
                                {article.author.name}

                              </span>


                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em]">

                                Read

                                <ArrowRight
                                  aria-hidden="true"
                                  size={
                                    12
                                  }
                                />

                              </span>

                            </div>

                          </Link>

                        </article>

                      )
                    )}

                  </div>

                </section>

              )}


              {products.length >
                0 && (

                <section className="border-t border-[var(--line)] bg-[#f6f4ef] py-16 sm:py-20">

                  <div className="container-shell">

                    <div className="mb-8 flex items-end justify-between gap-4">

                      <div>

                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                          The edit
                        </p>


                        <h2 className="display-serif mt-2 text-4xl leading-tight sm:text-5xl">
                          Products
                        </h2>

                      </div>


                      <p className="text-sm text-[var(--muted)]">

                        {products.length}
                        {" "}
                        found

                      </p>

                    </div>


                    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">

                      {products.map(
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

                                <div className="relative aspect-square overflow-hidden bg-white">

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


                                <h3 className="display-serif mt-2 text-2xl leading-tight sm:text-3xl">

                                  {product.name}

                                </h3>


                                {(product.editorialSummary ||
                                  product.description) && (

                                  <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--muted)]">

                                    {product.editorialSummary ??
                                      product.description}

                                  </p>

                                )}


                                <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">

                                  View product

                                  <ArrowRight
                                    aria-hidden="true"
                                    size={
                                      12
                                    }
                                  />

                                </div>

                              </Link>

                            </article>

                          );

                        }
                      )}

                    </div>

                  </div>

                </section>

              )}

            </>

          )}

        </>

      )}

    </main>
  );
}


function DiscoveryLink({
  href,
  label,
  description,
}: {
  href:
    string;

  label:
    string;

  description:
    string;
}) {
  return (
    <Link
      href={
        href
      }
      className="group rounded-2xl border border-[var(--line)] bg-[#f6f4ef] p-6 transition hover:bg-[#efede7] sm:p-7"
    >

      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
        Explore
      </p>


      <div className="mt-3 flex items-start justify-between gap-5">

        <div>

          <h3 className="display-serif text-3xl">
            {label}
          </h3>


          <p className="mt-3 text-[15px] leading-7 text-[var(--muted)] sm:text-base">
            {description}
          </p>

        </div>


        <ArrowRight
          aria-hidden="true"
          size={
            17
          }
          className="mt-2 shrink-0 transition-transform group-hover:translate-x-1"
        />

      </div>

    </Link>
  );
}