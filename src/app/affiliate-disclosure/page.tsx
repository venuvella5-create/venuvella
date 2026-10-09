import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Affiliate Disclosure",

  description:
    "Learn how Venuvella uses affiliate links and how qualifying purchases may generate commissions without changing the price paid by readers.",

  alternates: {
    canonical:
      "/affiliate-disclosure",
  },
};


export default function AffiliateDisclosurePage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              Commerce transparency
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Affiliate Disclosure
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              Venuvella may earn commissions
              from qualifying purchases made
              through certain retailer links.
            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">

          <aside>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              What this means
            </p>


            <h2 className="display-serif mt-4 text-4xl leading-tight">
              Some shopping links may
              support Venuvella.
            </h2>

          </aside>


          <div className="space-y-6 text-lg leading-8 text-[var(--muted)]">

            <p>
              Some links on Venuvella may be
              affiliate links. If you click
              one of those links and make a
              qualifying purchase, Venuvella
              may receive a commission from
              the retailer or affiliate
              network.
            </p>


            <p>
              This commission generally does
              not increase the price you pay.
              The retailer or affiliate
              partner is responsible for
              tracking and determining
              whether a purchase qualifies
              for commission.
            </p>


            <p>
              Venuvella is a participant in
              the Amazon Services LLC
              Associates Program, an
              affiliate advertising program
              designed to provide a means for
              sites to earn advertising fees
              by advertising and linking to
              Amazon.com. As an Amazon
              Associate I earn from
              qualifying purchases.
            </p>


            <p>
              Affiliate relationships help
              support the operation of
              Venuvella, including editorial
              content, product discovery,
              infrastructure and ongoing
              development.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="grid gap-6 md:grid-cols-3">

            <article className="rounded-2xl border border-[var(--line)] bg-white p-7">

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                01
              </p>


              <h2 className="display-serif mt-4 text-3xl">
                Reader price
              </h2>


              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                Using an affiliate link
                generally does not change the
                retail price presented to you.
              </p>

            </article>


            <article className="rounded-2xl border border-[var(--line)] bg-white p-7">

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                02
              </p>


              <h2 className="display-serif mt-4 text-3xl">
                Retailer control
              </h2>


              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                Pricing, availability,
                shipping, returns and final
                purchase terms are controlled
                by the third-party retailer.
              </p>

            </article>


            <article className="rounded-2xl border border-[var(--line)] bg-white p-7">

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                03
              </p>


              <h2 className="display-serif mt-4 text-3xl">
                Editorial judgment
              </h2>


              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                Commercial relationships
                should not replace editorial
                judgment or determine whether
                a product is presented
                positively.
              </p>

            </article>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="max-w-4xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Third-party retailers
          </p>


          <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
            Purchases happen outside Venuvella.
          </h2>


          <div className="mt-7 space-y-5 text-base leading-8 text-[var(--muted)]">

            <p>
              Venuvella does not process
              retailer transactions through
              its editorial pages. When you
              follow a shopping link, you may
              be redirected to a third-party
              retailer or commerce platform.
            </p>


            <p>
              That third party is responsible
              for its own products, prices,
              availability, payment
              processing, shipping, returns,
              warranties and customer
              service.
            </p>


            <p>
              Product information and prices
              may change after publication.
              Readers should review the
              retailer&apos;s current information
              before purchasing.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-16 sm:py-20">

          <div className="grid gap-8 lg:grid-cols-2">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Editorial standards
              </p>


              <h2 className="display-serif mt-4 text-4xl">
                How commerce fits into our
                editorial approach.
              </h2>


              <Link
                href="/editorial-policy"
                className="mt-7 inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
              >
                Editorial policy
              </Link>

            </div>


            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Questions
              </p>


              <h2 className="display-serif mt-4 text-4xl">
                Need more information?
              </h2>


              <Link
                href="/contact"
                className="mt-7 inline-flex min-h-[48px] items-center rounded-full border border-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em]"
              >
                Contact Venuvella
              </Link>

            </div>

          </div>

        </div>

      </section>


      <section className="container-shell py-10">

        <p className="text-xs leading-6 text-[var(--muted)]">
          Last updated: October 2026.
        </p>

      </section>

    </main>
  );
}