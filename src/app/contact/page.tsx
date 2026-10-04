import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Contact Venuvella",

  description:
    "Contact Venuvella for editorial feedback, general inquiries, partnerships and questions about our content or affiliate relationships.",

  alternates: {
    canonical:
      "/contact",
  },
};


const contactReasons = [
  {
    title:
      "Editorial feedback",

    description:
      "Questions, corrections or feedback about an article, guide or recommendation.",
  },

  {
    title:
      "Partnerships",

    description:
      "Brand, publisher or commercial partnership inquiries related to Venuvella.",
  },

  {
    title:
      "Affiliate questions",

    description:
      "Questions about affiliate links, retailer relationships or our disclosure practices.",
  },

  {
    title:
      "General inquiries",

    description:
      "Anything else about Venuvella, the site or our editorial experience.",
  },
];


export default function ContactPage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              Contact
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              We&apos;d like to hear from you.
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              Reach out with editorial feedback,
              partnership inquiries or questions
              about Venuvella.
            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Get in touch
            </p>


            <h2 className="display-serif mt-4 text-4xl leading-tight sm:text-5xl">
              Choose the reason that best
              matches your message.
            </h2>


            <p className="mt-5 max-w-md text-base leading-8 text-[var(--muted)]">
              Venuvella is still growing,
              so keeping inquiries organized
              helps us respond more effectively.
            </p>

          </div>


          <div className="grid gap-4 sm:grid-cols-2">

            {contactReasons.map(
              (
                item
              ) => (
                <article
                  key={
                    item.title
                  }
                  className="rounded-2xl border border-[var(--line)] bg-white p-6"
                >

                  <h3 className="display-serif text-3xl">
                    {
                      item.title
                    }
                  </h3>


                  <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                    {
                      item.description
                    }
                  </p>

                </article>
              )
            )}

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-7 sm:p-10">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Contact channel
            </p>


            <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
              Contact details coming soon.
            </h2>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              We&apos;re preparing a dedicated
              contact channel for Venuvella.
              Until that is connected, this page
              serves as the central reference
              point for inquiries.
            </p>


            <p className="mt-5 text-base leading-8 text-[var(--muted)]">
              Once a business email or contact
              service is configured, it can be
              added here without changing the
              rest of the page structure.
            </p>


            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="/about"
                className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
              >
                About Venuvella
              </Link>


              <Link
                href="/editorial-policy"
                className="inline-flex min-h-[48px] items-center rounded-full border border-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.13em]"
              >
                Editorial policy
              </Link>

            </div>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-8 md:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-[#efeee9] p-7">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Commerce transparency
            </p>


            <h2 className="display-serif mt-4 text-3xl">
              Questions about affiliate links?
            </h2>


            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Our affiliate disclosure explains
              how Venuvella may earn commissions
              from qualifying purchases.
            </p>


            <Link
              href="/affiliate-disclosure"
              className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4"
            >
              Read affiliate disclosure
            </Link>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-7">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Privacy
            </p>


            <h2 className="display-serif mt-4 text-3xl">
              Questions about your data?
            </h2>


            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Our privacy policy explains how
              Venuvella handles information
              collected through the site.
            </p>


            <Link
              href="/privacy"
              className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4"
            >
              Read privacy policy
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
