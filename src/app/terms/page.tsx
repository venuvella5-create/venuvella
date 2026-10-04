import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Terms of Use",

  description:
    "Read the Venuvella Terms of Use covering site access, editorial content, affiliate links, third-party retailers and acceptable use.",

  alternates: {
    canonical:
      "/terms",
  },
};


const terms = [
  {
    title:
      "Use of the site",

    body:
      "Venuvella is provided for informational, editorial and product-discovery purposes. You may use the site for lawful personal use in accordance with these terms.",
  },

  {
    title:
      "Editorial information",

    body:
      "Content is provided for general informational purposes. While we aim to keep information useful and current, we do not guarantee that every article, recommendation, price, specification or availability detail will always be complete or up to date.",
  },

  {
    title:
      "Product recommendations",

    body:
      "Product references and recommendations do not constitute a guarantee that a product will be suitable for every reader. You are responsible for evaluating whether a product is appropriate for your own needs.",
  },

  {
    title:
      "Affiliate links",

    body:
      "Some links may be affiliate links. Venuvella may receive a commission from qualifying purchases made through those links. Additional information is available in our Affiliate Disclosure.",
  },

  {
    title:
      "Third-party retailers",

    body:
      "Purchases are completed with third-party retailers. Venuvella is not responsible for their pricing, inventory, payment processing, delivery, returns, warranties, customer service or other terms.",
  },

  {
    title:
      "Acceptable use",

    body:
      "You may not misuse the site, attempt unauthorized access, interfere with site operation, introduce malicious code, scrape the site in a manner that disrupts service or use Venuvella for unlawful purposes.",
  },

  {
    title:
      "Intellectual property",

    body:
      "Unless otherwise stated, Venuvella branding, editorial content, site design and original materials are protected by applicable intellectual property laws and may not be reproduced or distributed without permission.",
  },

  {
    title:
      "Changes to the service",

    body:
      "Venuvella may update, modify, suspend or discontinue features, content or portions of the site as the platform evolves.",
  },
];


export default function TermsPage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              Legal
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Terms of Use
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              These terms govern use of
              Venuvella and explain the
              relationship between our
              editorial platform, readers and
              third-party services.
            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">

          <aside>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Agreement
            </p>


            <h2 className="display-serif mt-4 text-4xl leading-tight">
              Using Venuvella means accepting
              these terms.
            </h2>

          </aside>


          <div className="space-y-6 text-lg leading-8 text-[var(--muted)]">

            <p>
              By accessing or using Venuvella,
              you agree to these Terms of Use
              and any policies referenced
              within them.
            </p>


            <p>
              If you do not agree with these
              terms, you should not use the
              site.
            </p>


            <p>
              Venuvella may update these terms
              from time to time as the
              platform, services and legal
              requirements evolve.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="max-w-2xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Terms
            </p>


            <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
              Conditions for using Venuvella.
            </h2>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-2">

            {terms.map(
              (
                term
              ) => (
                <article
                  key={
                    term.title
                  }
                  className="rounded-2xl border border-[var(--line)] bg-white p-7"
                >

                  <h3 className="display-serif text-3xl">
                    {
                      term.title
                    }
                  </h3>


                  <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                    {
                      term.body
                    }
                  </p>

                </article>
              )
            )}

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="max-w-4xl space-y-12">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              No professional advice
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              Editorial content is general
              information.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              Venuvella content is not intended
              to replace professional medical,
              legal, financial or other
              specialized advice. Where a
              decision requires professional
              expertise, readers should consult
              an appropriately qualified
              professional.
            </p>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Availability
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              The site is provided as available.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              We aim to keep Venuvella available
              and reliable, but uninterrupted
              access cannot be guaranteed.
              Maintenance, technical issues or
              third-party dependencies may
              occasionally affect availability.
            </p>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Limitation of responsibility
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              External transactions remain
              between you and the retailer.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              To the extent permitted by
              applicable law, Venuvella is not
              responsible for losses arising
              from third-party retailer
              transactions, external websites,
              product performance or reliance
              on information that has become
              outdated.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-14">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Related information
              </p>


              <p className="mt-2 text-sm text-[var(--muted)]">
                Review our privacy and
                affiliate policies.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                href="/privacy"
                className="admin-secondary"
              >
                Privacy Policy
              </Link>


              <Link
                href="/affiliate-disclosure"
                className="admin-secondary"
              >
                Affiliate Disclosure
              </Link>


              <Link
                href="/contact"
                className="admin-secondary"
              >
                Contact
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