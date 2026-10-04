import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Cookie Policy",

  description:
    "Read the Venuvella Cookie Policy to understand how cookies and similar technologies may be used for site functionality, administration and analytics.",

  alternates: {
    canonical:
      "/cookies",
  },
};


const cookieTypes = [
  {
    title:
      "Essential functionality",

    body:
      "Some cookies or similar technologies may be required for core site functionality, security or authenticated administrative access.",
  },

  {
    title:
      "Administrative sessions",

    body:
      "Restricted Venuvella administration areas may use session-related cookies to maintain authorized access and help protect administrative features.",
  },

  {
    title:
      "Analytics and attribution",

    body:
      "Venuvella may use technical information and attribution data to understand how readers interact with the site, including traffic sources and affiliate activity.",
  },

  {
    title:
      "Third-party services",

    body:
      "When you follow links to third-party retailers or other external services, those third parties may use their own cookies or tracking technologies according to their own policies.",
  },
];


export default function CookiePolicyPage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              Privacy & technology
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Cookie Policy
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              This policy explains how cookies
              and similar technologies may be
              used when you visit Venuvella.
            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-16 sm:py-20">

        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">

          <aside>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Overview
            </p>


            <h2 className="display-serif mt-4 text-4xl leading-tight">
              Small technologies that help
              websites function.
            </h2>

          </aside>


          <div className="space-y-6 text-lg leading-8 text-[var(--muted)]">

            <p>
              Cookies are small pieces of data
              that websites may store in a
              browser or device to support
              functionality, remember session
              information or help understand
              how a service is used.
            </p>


            <p>
              Similar technologies may also
              be used for related purposes,
              such as maintaining sessions,
              measuring traffic or supporting
              attribution.
            </p>


            <p>
              The technologies used by
              Venuvella may change as the
              platform develops. This policy
              is intended to explain the
              general categories that may be
              relevant to the service.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="max-w-2xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Types of technology
            </p>


            <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
              How cookies may be used.
            </h2>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-2">

            {cookieTypes.map(
              (
                item
              ) => (
                <article
                  key={
                    item.title
                  }
                  className="rounded-2xl border border-[var(--line)] bg-white p-7"
                >

                  <h3 className="display-serif text-3xl">
                    {
                      item.title
                    }
                  </h3>


                  <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                    {
                      item.body
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
              Browser controls
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              You can manage cookies through
              your browser.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              Most browsers provide controls
              that allow users to view,
              restrict, block or delete
              cookies. The available settings
              depend on the browser and
              device you use.
            </p>


            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Blocking certain technologies
              may affect functionality that
              depends on them, particularly
              authenticated or session-based
              features.
            </p>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Affiliate links
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              External retailers may use
              their own technologies.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              When you leave Venuvella and
              visit a third-party retailer,
              affiliate network or external
              service, that third party may
              place or use cookies according
              to its own privacy and cookie
              practices.
            </p>


            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Venuvella does not control the
              cookies or tracking technologies
              used by third-party websites.
            </p>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Policy updates
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              This policy may evolve.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              We may update this Cookie Policy
              when site functionality,
              analytics practices or legal
              requirements change. The latest
              version will remain available
              on this page.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-14">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Related policies
              </p>


              <p className="mt-2 text-sm text-[var(--muted)]">
                Learn more about privacy and
                affiliate activity on Venuvella.
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