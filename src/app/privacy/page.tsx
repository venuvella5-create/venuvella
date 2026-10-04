import type {
  Metadata,
} from "next";

import Link from "next/link";


export const metadata: Metadata = {
  title:
    "Privacy Policy",

  description:
    "Read the Venuvella Privacy Policy to understand how we collect, use and protect information related to newsletter subscriptions, analytics and site activity.",

  alternates: {
    canonical:
      "/privacy",
  },
};


const sections = [
  {
    title:
      "Information you provide",

    body:
      "Venuvella may collect information you voluntarily provide, such as an email address submitted through the newsletter signup form or information you send through future contact features.",
  },

  {
    title:
      "Newsletter subscriptions",

    body:
      "When you subscribe to the Venuvella newsletter, we store your email address and subscription-related timestamps so we can manage the subscriber list and deliver newsletter communications when that service is active.",
  },

  {
    title:
      "Affiliate click analytics",

    body:
      "When you follow certain shopping links, Venuvella may record information such as the product, retailer or affiliate provider, article attribution, category, campaign parameters, referring page, device type and timestamp. This information is used to understand site performance and affiliate activity.",
  },

  {
    title:
      "Technical information",

    body:
      "Like most websites, Venuvella may receive technical request information such as browser or device information, referral information and similar data necessary to operate, secure and understand the site.",
  },

  {
    title:
      "Third-party websites",

    body:
      "Venuvella links to third-party retailers and other external websites. Their privacy practices are controlled by those third parties, and readers should review the privacy policies of any external service they use.",
  },

  {
    title:
      "Security",

    body:
      "We take reasonable steps to protect information handled by the site, but no internet service or storage system can guarantee absolute security.",
  },
];


export default function PrivacyPage() {
  return (
    <main>

      <section className="border-b border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.19em] text-[var(--accent)]">
              Privacy & data
            </p>


            <h1 className="display-serif mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Privacy Policy
            </h1>


            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              This policy explains how
              Venuvella handles information
              associated with use of the site,
              newsletter subscriptions and
              affiliate activity.
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
              We collect only what supports
              the operation of Venuvella.
            </h2>

          </aside>


          <div className="space-y-6 text-lg leading-8 text-[var(--muted)]">

            <p>
              Venuvella is an editorial
              discovery platform that may
              collect limited information
              when readers interact with the
              site.
            </p>


            <p>
              This includes information you
              choose to provide, such as a
              newsletter email address, and
              technical or attribution data
              generated when using certain
              features.
            </p>


            <p>
              We use this information to
              operate the site, understand
              performance, manage
              subscriptions and improve the
              reader experience.
            </p>

          </div>

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[var(--paper)]">

        <div className="container-shell py-16 sm:py-20">

          <div className="max-w-2xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Information handling
            </p>


            <h2 className="display-serif mt-4 text-4xl sm:text-5xl">
              What information may be collected.
            </h2>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-2">

            {sections.map(
              (
                section
              ) => (
                <article
                  key={
                    section.title
                  }
                  className="rounded-2xl border border-[var(--line)] bg-white p-7"
                >

                  <h3 className="display-serif text-3xl">
                    {
                      section.title
                    }
                  </h3>


                  <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                    {
                      section.body
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
              How information is used
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              Why Venuvella processes information.
            </h2>


            <div className="mt-6 space-y-4 text-base leading-8 text-[var(--muted)]">

              <p>
                Information may be used to
                operate and maintain the site,
                manage newsletter
                subscriptions, measure
                affiliate click activity,
                understand traffic and
                attribution, prevent abuse and
                improve site functionality.
              </p>


              <p>
                Venuvella does not need your
                payment card information for
                normal editorial browsing
                because purchases take place
                with third-party retailers.
              </p>

            </div>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Data retention
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              How long information may be kept.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              Information may be retained for
              as long as reasonably necessary
              for the purposes described in
              this policy, including site
              administration, analytics,
              legal compliance, security and
              subscriber management.
            </p>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Your choices
            </p>


            <h2 className="display-serif mt-4 text-4xl">
              Questions or privacy requests.
            </h2>


            <p className="mt-6 text-base leading-8 text-[var(--muted)]">
              If you have a question about
              information associated with
              Venuvella, use our contact page.
              Specific privacy rights may vary
              depending on where you live.
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


      <section className="border-y border-[var(--line)] bg-[#efeee9]">

        <div className="container-shell py-14">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Related policies
              </p>


              <p className="mt-2 text-sm text-[var(--muted)]">
                Review our cookie and commerce
                transparency information.
              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                href="/cookies"
                className="admin-secondary"
              >
                Cookie Policy
              </Link>


              <Link
                href="/affiliate-disclosure"
                className="admin-secondary"
              >
                Affiliate Disclosure
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