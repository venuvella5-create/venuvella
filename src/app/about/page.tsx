import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "About Venuvella",

  description:
    "Learn how Venuvella approaches editorial discovery, product recommendations and thoughtful shopping across beauty, home, fitness and style.",

  alternates: {
    canonical:
      "/about",
  },
};


const principles = [
  {
    number:
      "01",

    title:
      "Editorial first",

    description:
      "Venuvella begins with usefulness, context and point of view. Products support the story rather than replacing it.",
  },

  {
    number:
      "02",

    title:
      "Thoughtful discovery",

    description:
      "We aim to make finding worthwhile products feel considered and enjoyable instead of overwhelming.",
  },

  {
    number:
      "03",

    title:
      "Clear commerce",

    description:
      "Some links may be affiliate links. When applicable, Venuvella may earn a commission without changing the price paid by the reader.",
  },

  {
    number:
      "04",

    title:
      "Useful context",

    description:
      "Our goal is to explain why something may be worth considering, who it may suit and how it fits into everyday life.",
  },
];


export default function AboutPage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              About Venuvella
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Discovery with a point of view.
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              Venuvella is an editorial
              discovery platform for people
              who want thoughtful inspiration
              without endless scrolling.
            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              What we do
            </p>


            <h2 className="display-serif mt-4 text-4xl leading-tight sm:text-5xl">
              A more considered way to
              discover what&apos;s worth
              your attention.
            </h2>

          </div>


          <div className="space-y-6 text-lg leading-8 text-[var(--muted)]">

            <p>
              Venuvella brings together
              editorial stories, buying
              guides, product discovery and
              timely recommendations across
              beauty, home, fitness and
              style.
            </p>


            <p>
              Instead of presenting an
              endless product catalog, we
              organize discovery around
              context. That can mean a guide
              to making a better decision,
              an article exploring a category,
              a seasonal edit or a product
              selected because it fits a
              specific need.
            </p>


            <p>
              Commerce is part of the
              experience, but it is not the
              entire experience. Venuvella
              is designed to help readers
              understand what they are
              looking at before deciding
              whether to shop.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="max-w-2xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Our approach
            </p>


            <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
              How Venuvella thinks about
              discovery.
            </h2>

          </div>


          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">

            {principles.map(
              (
                principle
              ) => (
                <article
                  key={
                    principle.number
                  }
                  className="bg-white p-7 sm:p-8"
                >

                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    {
                      principle.number
                    }
                  </p>


                  <h3 className="display-serif mt-4 text-3xl">
                    {
                      principle.title
                    }
                  </h3>


                  <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                    {
                      principle.description
                    }
                  </p>

                </article>
              )
            )}

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-10 lg:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-7 sm:p-9">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Editorial standards
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              How recommendations are
              presented.
            </h2>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              We believe readers should be
              able to understand the
              relationship between editorial
              content and commerce. Our
              editorial and affiliate
              policies explain that approach
              in more detail.
            </p>


            <div className="mt-7 flex flex-wrap gap-3">

              <Link
                href="/editorial-policy"
                className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
              >
                Editorial policy
              </Link>


              <Link
                href="/affiliate-disclosure"
                className="inline-flex min-h-[48px] items-center rounded-full border border-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em]"
              >
                Affiliate disclosure
              </Link>

            </div>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-[#efeee9] p-7 sm:p-9">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Get in touch
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              Questions, feedback or
              partnerships?
            </h2>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              Visit our contact page for
              editorial feedback, general
              inquiries or questions about
              Venuvella.
            </p>


            <Link
              href="/contact"
              className="mt-7 inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
            >
              Contact Venuvella
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
