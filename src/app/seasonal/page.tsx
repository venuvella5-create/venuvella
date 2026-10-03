import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  getArticlesByCategory,
} from "@/lib/content/articles";


export const dynamic =
  "force-dynamic";


export const metadata: Metadata = {
  title:
    "Seasonal",

  description:
    "Seasonal stories, timely recommendations and product discoveries from Venuvella.",
};


export default async function SeasonalPage() {
  const category =
    await prisma.category.findUnique({
      where: {
        slug:
          "seasonal",
      },
    });


  const articles =
    category
      ? await getArticlesByCategory(
          "seasonal"
        )
      : [];


  const products =
    category
      ? await prisma.product.findMany({
          where: {
            status:
              "PUBLISHED",

            category: {
              slug:
                "seasonal",
            },
          },

          orderBy: {
            updatedAt:
              "desc",
          },

          take:
            8,

          include: {
            brand:
              true,

            images: {
              orderBy: {
                position:
                  "asc",
              },

              take:
                1,
            },
          },
        })
      : [];


  const featuredArticle =
    articles[0] ??
    null;


  const remainingArticles =
    articles.slice(
      1
    );


  return (
    <main className="pb-20 sm:pb-28">

      <section className="border-b border-[var(--line)]">

        <div className="container-shell py-14 sm:py-20 lg:py-24">

          <div className="max-w-4xl">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">

              <CalendarDays
                aria-hidden="true"
                size={15}
              />

              <span>
                Seasonal Edit
              </span>

            </div>


            <h1 className="display-serif mt-5 max-w-4xl text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">

              Timely ideas for
              right now.

            </h1>


            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">

              Seasonal stories,
              useful discoveries
              and thoughtful
              recommendations
              chosen for the moment.

            </p>


            {category?.description && (

              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">

                {category.description}

              </p>

            )}

          </div>

        </div>

      </section>


      {featuredArticle && (

        <section className="container-shell py-14 sm:py-20">

          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="group block"
          >

            <div className="grid gap-9 border-b border-[var(--line)] pb-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">

              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">

                {featuredArticle.featuredImage ? (

                  <Image
                    src={
                      featuredArticle.featuredImage
                    }
                    alt={
                      featuredArticle.title
                    }
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.015]"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
                    Venuvella seasonal editorial
                  </div>

                )}

              </div>


              <div className="flex flex-col justify-center">

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                  Featured seasonal story
                </p>


                <h2 className="display-serif mt-4 text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">

                  {featuredArticle.title}

                </h2>


                {featuredArticle.excerpt && (

                  <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg sm:leading-9">

                    {featuredArticle.excerpt}

                  </p>

                )}


                <div className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em]">

                  Read story

                  <ArrowRight
                    aria-hidden="true"
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </div>

              </div>

            </div>

          </Link>

        </section>

      )}


      {remainingArticles.length > 0 && (

        <section className="container-shell pb-16 sm:pb-20">

          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                Seasonal stories
              </p>


              <h2 className="display-serif mt-2 text-4xl leading-tight sm:text-5xl">
                More for the moment
              </h2>

            </div>


            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
            >

              All articles

              <ArrowRight
                aria-hidden="true"
                size={12}
              />

            </Link>

          </div>


          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">

            {remainingArticles.map(
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
                          Seasonal editorial
                        </div>

                      )}

                    </div>


                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">
                      Seasonal
                    </p>


                    <h3 className="display-serif mt-2 text-3xl leading-[1.08] tracking-[-0.025em]">

                      {article.title}

                    </h3>


                    {article.excerpt && (

                      <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--muted)] sm:text-base">

                        {article.excerpt}

                      </p>

                    )}


                    <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">

                      Read story

                      <ArrowRight
                        aria-hidden="true"
                        size={12}
                      />

                    </div>

                  </Link>

                </article>

              )
            )}

          </div>

        </section>

      )}


      {products.length > 0 && (

        <section className="border-y border-[var(--line)] bg-[#f5f2eb] py-16 sm:py-20">

          <div className="container-shell">

            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                  Seasonal picks
                </p>


                <h2 className="display-serif mt-2 text-4xl leading-tight sm:text-5xl">
                  Products for now
                </h2>

              </div>


              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]"
              >

                All products

                <ArrowRight
                  aria-hidden="true"
                  size={12}
                />

              </Link>

            </div>


            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">

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
                            "Venuvella"}

                        </p>


                        <h3 className="display-serif mt-2 text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">

                          {product.name}

                        </h3>


                        {product.editorialSummary && (

                          <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--muted)]">

                            {product.editorialSummary}

                          </p>

                        )}


                        <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">

                          View product

                          <ArrowRight
                            aria-hidden="true"
                            size={12}
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


      {articles.length === 0 &&
        products.length === 0 && (

        <section className="container-shell py-16 sm:py-20">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1eee7]">

              <Sparkles
                aria-hidden="true"
                size={20}
              />

            </div>


            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Seasonal edit
            </p>


            <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">

              The next seasonal
              edit is taking shape.

            </h2>


            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">

              New seasonal stories
              and product discoveries
              will appear here as they
              are published.

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
                size={13}
                className="text-white"
              />

            </Link>

          </div>

        </section>

      )}

    </main>
  );
}
