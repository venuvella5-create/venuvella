import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  Newspaper,
  Sparkles,
} from "lucide-react";

import {
  ArticleCard,
} from "@/components/editorial/ArticleCard";

import {
  getArticlesByCategory,
  getPublishedArticles,
} from "@/lib/content/articles";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export const metadata: Metadata = {
  title:
    "Articles",

  description:
    "Explore Venuvella editorial stories across beauty, home, fitness, style and seasonal discovery.",
};


type SortOption =
  | "newest"
  | "az"
  | "za";


type ArticleSearchParams = {
  category?:
    string;

  sort?:
    string;
};


function buildArticlesUrl({
  category,
  sort,
}: ArticleSearchParams) {
  const params =
    new URLSearchParams();


  if (
    category
  ) {
    params.set(
      "category",
      category
    );
  }


  if (
    sort &&
    sort !==
      "newest"
  ) {
    params.set(
      "sort",
      sort
    );
  }


  const query =
    params.toString();


  return query
    ? `/articles?${query}`
    : "/articles";
}


export default async function ArticlesPage({
  searchParams,
}: {
  searchParams:
    Promise<ArticleSearchParams>;
}) {
  const params =
    await searchParams;


  const sort: SortOption =
    params.sort ===
      "az" ||
    params.sort ===
      "za"
      ? params.sort
      : "newest";


  const categories =
    await prisma.category.findMany({
      orderBy: {
        name:
          "asc",
      },

      select: {
        id:
          true,

        name:
          true,

        slug:
          true,
      },
    });


  const activeCategory =
    categories.find(
      (
        category
      ) =>
        category.slug ===
        params.category
    );


  const articles =
    activeCategory
      ? await getArticlesByCategory(
          activeCategory.slug
        )
      : await getPublishedArticles(
          48
        );


  const sortedArticles =
    [
      ...articles,
    ];


  if (
    sort ===
    "az"
  ) {
    sortedArticles.sort(
      (
        left,
        right
      ) =>
        left.title.localeCompare(
          right.title
        )
    );
  }


  if (
    sort ===
    "za"
  ) {
    sortedArticles.sort(
      (
        left,
        right
      ) =>
        right.title.localeCompare(
          left.title
        )
    );
  }


  const articleCount =
    sortedArticles.length;


  const sortOptions: Array<{
    value:
      SortOption;

    label:
      string;
  }> = [
    {
      value:
        "newest",

      label:
        "Newest",
    },

    {
      value:
        "az",

      label:
        "A–Z",
    },

    {
      value:
        "za",

      label:
        "Z–A",
    },
  ];


  return (
    <main className="pb-20 sm:pb-28">

      <section className="border-b border-[var(--line)]">

        <div className="container-shell py-14 sm:py-20 lg:py-24">

          <div className="max-w-4xl">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">

              <Newspaper
                aria-hidden="true"
                size={
                  15
                }
              />

              <span>
                The Venuvella Edit
              </span>

            </div>


            <h1 className="display-serif mt-5 max-w-4xl text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">

              Ideas worth making
              room for.

            </h1>


            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">

              Original editorial
              stories, practical
              inspiration and
              considered product
              discovery across
              beauty, home, fitness
              and style.

            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-10 sm:py-12">

        <div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Browse by category
          </p>


          <div className="mt-4 flex flex-wrap gap-2">

            <Link
              href={
                buildArticlesUrl({
                  sort,
                })
              }
              aria-current={
                !activeCategory
                  ? "page"
                  : undefined
              }
              className={
                !activeCategory
                  ? "inline-flex min-h-[42px] items-center rounded-full bg-[var(--ink)] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                  : "inline-flex min-h-[42px] items-center rounded-full border border-[var(--line)] bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--ink)]"
              }
            >

              <span
                className={
                  !activeCategory
                    ? "text-white"
                    : undefined
                }
              >
                All stories
              </span>

            </Link>


            {categories.map(
              (
                category
              ) => {

                const active =
                  activeCategory?.id ===
                  category.id;


                return (

                  <Link
                    key={
                      category.id
                    }
                    href={
                      buildArticlesUrl({
                        category:
                          category.slug,

                        sort,
                      })
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={
                      active
                        ? "inline-flex min-h-[42px] items-center rounded-full bg-[var(--ink)] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                        : "inline-flex min-h-[42px] items-center rounded-full border border-[var(--line)] bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--ink)]"
                    }
                  >

                    <span
                      className={
                        active
                          ? "text-white"
                          : undefined
                      }
                    >
                      {category.name}
                    </span>

                  </Link>

                );

              }
            )}

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[#f6f4ef]">

        <div className="container-shell py-6 sm:py-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Editorial results
              </p>


              <p className="mt-2 text-base text-[var(--muted)]">

                Showing
                {" "}
                <span className="font-semibold text-[var(--ink)]">
                  {articleCount}
                </span>
                {" "}
                {articleCount ===
                1
                  ? "story"
                  : "stories"}

                {activeCategory && (
                  <>
                    {" "}
                    in
                    {" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {activeCategory.name}
                    </span>
                  </>
                )}

              </p>

            </div>


            <div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)] md:text-right">
                Sort by
              </p>


              <div className="flex flex-wrap gap-2">

                {sortOptions.map(
                  (
                    option
                  ) => {

                    const active =
                      sort ===
                      option.value;


                    return (

                      <Link
                        key={
                          option.value
                        }
                        href={
                          buildArticlesUrl({
                            category:
                              params.category,

                            sort:
                              option.value,
                          })
                        }
                        aria-current={
                          active
                            ? "page"
                            : undefined
                        }
                        className={
                          active
                            ? "inline-flex min-h-[40px] items-center rounded-full bg-[var(--ink)] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                            : "inline-flex min-h-[40px] items-center rounded-full border border-[var(--line)] bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--ink)]"
                        }
                      >

                        <span
                          className={
                            active
                              ? "text-white"
                              : undefined
                          }
                        >
                          {option.label}
                        </span>

                      </Link>

                    );

                  }
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {sortedArticles.length >
        0 ? (

        <section className="container-shell py-14 sm:py-18">

          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">

            {sortedArticles.map(
              (
                article,
                index
              ) => (

                <ArticleCard
                  key={
                    article.id
                  }
                  article={{
                    category:
                      article.category.name,

                    title:
                      article.title,

                    excerpt:
                      article.excerpt ??
                      "",

                    image:
                      article.featuredImage ??
                      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",

                    slug:
                      article.slug,

                    readingTime:
                      "6 min",
                  }}
                  featured={
                    index ===
                    0
                  }
                />

              )
            )}

          </div>

        </section>

      ) : (

        <section className="container-shell py-20 sm:py-24">

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
              Nothing here yet
            </p>


            <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">

              No published stories
              match this view.

            </h2>


            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">

              Try another category
              or return to the full
              Venuvella editorial
              collection.

            </p>


            <Link
              href="/articles"
              className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
            >

              <span className="text-white">
                View all stories
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

    </main>
  );
}