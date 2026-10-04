import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Editorial Policy",

  description:
    "Learn how Venuvella approaches editorial independence, product recommendations, corrections, affiliate relationships and content standards.",

  alternates: {
    canonical:
      "/editorial-policy",
  },
};


const standards = [
  {
    title:
      "Editorial independence",

    body:
      "Venuvella aims to make editorial decisions based on usefulness, relevance and reader value. Commercial relationships should not determine whether a product, topic or recommendation is presented positively.",
  },

  {
    title:
      "Product recommendations",

    body:
      "Products may be included because they are relevant to the topic, audience or editorial context. Inclusion does not mean that every product has been personally tested unless the content clearly states otherwise.",
  },

  {
    title:
      "Affiliate relationships",

    body:
      "Some outbound shopping links may be affiliate links. Venuvella may receive a commission when a reader makes a qualifying purchase through one of those links.",
  },

  {
    title:
      "Accuracy and updates",

    body:
      "We aim to keep editorial information useful and current, but product availability, pricing, retailer information and specifications can change over time.",
  },

  {
    title:
      "Corrections",

    body:
      "When a material factual error is identified, Venuvella may update or correct the affected content. Readers are encouraged to contact us when they notice information that may require review.",
  },

  {
    title:
      "Sponsored content",

    body:
      "If Venuvella publishes sponsored or paid content in the future, that commercial relationship should be clearly disclosed so readers can distinguish sponsored material from independent editorial content.",
  },
];


export default function EditorialPolicyPage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              Trust & transparency
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Editorial Policy
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              How Venuvella approaches
              recommendations, editorial
              independence and commercial
              relationships.
            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">

          <aside>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Our commitment
            </p>


            <h2 className="display-serif mt-4 text-4xl leading-tight">
              Useful editorial should earn
              reader trust.
            </h2>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              Venuvella combines editorial
              discovery with product and
              retailer links. That makes
              transparency especially
              important.
            </p>

          </aside>


          <div className="space-y-6 text-lg leading-8 text-[var(--muted)]">

            <p>
              Venuvella is designed as an
              editorial discovery platform,
              not a retailer. Our articles,
              guides and recommendations are
              intended to help readers
              discover ideas and make more
              informed decisions.
            </p>


            <p>
              Some content may include links
              to third-party retailers.
              Certain links may generate
              affiliate compensation for
              Venuvella when a qualifying
              purchase occurs.
            </p>


            <p>
              Affiliate compensation does not
              change the price paid by the
              reader and should not replace
              editorial judgment.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="max-w-2xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Editorial standards
            </p>


            <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
              Principles behind our content.
            </h2>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-2">

            {standards.map(
              (
                standard
              ) => (
                <article
                  key={
                    standard.title
                  }
                  className="rounded-2xl border border-[var(--line)] bg-white p-7"
                >

                  <h3 className="display-serif text-3xl">
                    {
                      standard.title
                    }
                  </h3>


                  <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                    {
                      standard.body
                    }
                  </p>

                </article>
              )
            )}

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-8 lg:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-7 sm:p-9">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Commerce
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              Affiliate links
            </h2>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              For more information about how
              affiliate relationships work,
              review our dedicated affiliate
              disclosure.
            </p>


            <Link
              href="/affiliate-disclosure"
              className="mt-7 inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
            >
              Affiliate disclosure
            </Link>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-[#efeee9] p-7 sm:p-9">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Corrections & feedback
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              See something we should review?
            </h2>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              Readers can use our contact
              page to flag potential errors,
              outdated information or other
              editorial concerns.
            </p>


            <Link
              href="/contact"
              className="mt-7 inline-flex min-h-[48px] items-center rounded-full border border-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em]"
            >
              Contact Venuvella
            </Link>

          </div>

        </div>

      </section>


      <section className="container-shell pb-10">

        <p className="text-xs leading-6 text-[var(--muted)]">
          Last updated: October 2026.
        </p>

      </section>

    </main>
  );
}