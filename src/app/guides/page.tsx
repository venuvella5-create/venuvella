import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export const metadata: Metadata = {
  title:
    "Buying Guides",

  description:
    "Practical buying guides, comparisons and product context from Venuvella.",
};


export default async function GuidesPage() {
  const guides =
    await prisma.buyingGuide.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      orderBy: {
        publishedAt:
          "desc",
      },

      include: {
        category:
          true,
      },
    });


  const featuredGuide =
    guides[0] ??
    null;


  const remainingGuides =
    guides.slice(
      1
    );


  return (
    <main className="pb-20 sm:pb-28">

      <section className="border-b border-[var(--line)]">

        <div className="container-shell py-14 sm:py-18 lg:py-22">

          <div className="max-w-4xl">

            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">

              <BookOpen
                aria-hidden="true"
                size={
                  15
                }
              />

              <span>
                Buying Guides
              </span>

            </div>


            <h1 className="display-serif mt-5 max-w-4xl text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">

              Helpful before
              you buy.

            </h1>


            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">

              Practical criteria,
              comparisons and
              product context
              designed to make
              decisions clearer.

            </p>

          </div>

        </div>

      </section>


      {featuredGuide && (

        <section className="container-shell py-14 sm:py-18">

          <Link
            href={`/guides/${featuredGuide.slug}`}
            className="group block"
          >

            <div className="grid gap-8 border-b border-[var(--line)] pb-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:pb-16">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                  Featured guide
                </p>


                <h2 className="display-serif mt-4 text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">

                  {featuredGuide.title}

                </h2>


                {featuredGuide.excerpt && (

                  <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg sm:leading-9">

                    {featuredGuide.excerpt}

                  </p>

                )}


                <div className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em]">

                  Read guide

                  <ArrowRight
                    aria-hidden="true"
                    size={
                      14
                    }
                    className="transition-transform group-hover:translate-x-1"
                  />

                </div>

              </div>


              <div className="flex items-end">

                <div className="w-full rounded-2xl border border-[var(--line)] bg-[#f4f1ea] p-7 sm:p-9">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">
                    Category
                  </p>


                  <p className="display-serif mt-3 text-3xl">

                    {featuredGuide.category.name}

                  </p>


                  <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">

                    A practical Venuvella
                    guide built to help
                    you understand what
                    matters before making
                    a decision.

                  </p>

                </div>

              </div>

            </div>

          </Link>

        </section>

      )}


      {remainingGuides.length >
        0 && (

        <section className="container-shell pb-16 sm:pb-20">

          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
                Explore more
              </p>


              <h2 className="display-serif mt-2 text-4xl leading-tight sm:text-5xl">
                More buying guides
              </h2>

            </div>


            <p className="text-sm text-[var(--muted)]">
              {remainingGuides.length}
              {" "}
              {remainingGuides.length ===
              1
                ? "guide"
                : "guides"}
            </p>

          </div>


          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">

            {remainingGuides.map(
              (
                guide,
                index
              ) => (

                <Link
                  key={
                    guide.id
                  }
                  href={`/guides/${guide.slug}`}
                  className="group border-t border-[var(--line)] pt-5"
                >

                  <div className="flex items-start justify-between gap-5">

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">

                        {guide.category.name}

                      </p>


                      <h3 className="display-serif mt-3 text-3xl leading-[1.08] tracking-[-0.025em] sm:text-4xl">

                        {guide.title}

                      </h3>

                    </div>


                    <span className="text-xs text-[var(--muted)]">

                      {String(
                        index +
                        2
                      ).padStart(
                        2,
                        "0"
                      )}

                    </span>

                  </div>


                  {guide.excerpt && (

                    <p className="mt-4 text-[15px] leading-7 text-[var(--muted)] sm:text-base sm:leading-8">

                      {guide.excerpt}

                    </p>

                  )}


                  <div className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em]">

                    Open guide

                    <ArrowRight
                      aria-hidden="true"
                      size={
                        12
                      }
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </div>

                </Link>

              )
            )}

          </div>

        </section>

      )}


      {guides.length ===
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
              Coming soon
            </p>


            <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">
              Buying guides are
              being prepared.
            </h2>


            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">

              Venuvella guides are
              designed to make
              product decisions
              simpler, more useful
              and easier to compare.

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

    </main>
  );
}