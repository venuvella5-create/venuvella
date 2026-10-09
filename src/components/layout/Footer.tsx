import Link from "next/link";

import {
  Logo,
} from "./Logo";

import {
  NewsletterForm,
} from "@/components/newsletter/NewsletterForm";


const discoveryLinks = [
  {
    label:
      "Beauty",

    href:
      "/beauty",
  },

  {
    label:
      "Home",

    href:
      "/home",
  },

  {
    label:
      "Fitness",

    href:
      "/fitness",
  },

  {
    label:
      "Style",

    href:
      "/style",
  },

  {
    label:
      "Seasonal",

    href:
      "/seasonal",
  },
];


const editorialLinks = [
  {
    label:
      "Articles",

    href:
      "/articles",
  },

  {
    label:
      "Products",

    href:
      "/products",
  },

  {
    label:
      "Guides",

    href:
      "/guides",
  },

  {
    label:
      "Deals",

    href:
      "/deals",
  },

  {
    label:
      "Search",

    href:
      "/search",
  },
];


const trustLinks = [
  {
    label:
      "About",

    href:
      "/about",
  },

  {
    label:
      "Contact",

    href:
      "/contact",
  },

  {
    label:
      "Editorial Policy",

    href:
      "/editorial-policy",
  },

  {
    label:
      "Affiliate Disclosure",

    href:
      "/affiliate-disclosure",
  },

  {
    label:
      "Privacy",

    href:
      "/privacy",
  },

  {
    label:
      "Terms",

    href:
      "/terms",
  },

  {
    label:
      "Cookie Policy",

    href:
      "/cookies",
  },
];


export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[#efeee9]">

      <div className="container-shell grid gap-12 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">

        <div>

          <Link
            href="/"
            aria-label="Venuvella home"
            className="inline-block"
          >
            <Logo />
          </Link>


          <p className="mt-5 max-w-sm text-base leading-7 text-[var(--muted)]">
            Thoughtful editorial discovery
            across beauty, home, fitness
            and style.
          </p>


          <div className="mt-8 max-w-md">

            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">
              The Venuvella Edit
            </p>


            <h2 className="display-serif mt-2 text-3xl leading-tight">
              A little inspiration,
              delivered.
            </h2>


            <div className="mt-5">

              <NewsletterForm />

            </div>

          </div>

        </div>


        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">
              Discover
            </p>


            <nav
              aria-label="Footer discovery navigation"
              className="mt-5 grid gap-3"
            >

              {discoveryLinks.map(
                (
                  link
                ) => (
                  <Link
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    className="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
                  >
                    {link.label}
                  </Link>
                )
              )}

            </nav>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">
              Explore
            </p>


            <nav
              aria-label="Footer editorial navigation"
              className="mt-5 grid gap-3"
            >

              {editorialLinks.map(
                (
                  link
                ) => (
                  <Link
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    className="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
                  >
                    {link.label}
                  </Link>
                )
              )}

            </nav>

          </div>


          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[var(--accent)]">
              Venuvella
            </p>


            <nav
              aria-label="Footer company and legal navigation"
              className="mt-5 grid gap-3"
            >

              {trustLinks.map(
                (
                  link
                ) => (
                  <Link
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    className="w-fit text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
                  >
                    {link.label}
                  </Link>
                )
              )}

            </nav>

          </div>

        </div>

      </div>


      <div className="border-t border-[var(--line)]">

        <div className="container-shell py-5">

          <p className="max-w-4xl text-[11px] leading-5 text-[var(--muted)]">
            As an Amazon Associate I earn from
            qualifying purchases. Venuvella may
            also earn commissions from other
            retailers when you buy through links
            on our site, at no extra cost to you.{" "}
            <Link
              href="/affiliate-disclosure"
              className="underline transition hover:text-[var(--ink)]"
            >
              Learn more
            </Link>
            .
          </p>

        </div>

      </div>


      <div className="border-t border-[var(--line)]">

        <div className="container-shell flex flex-col gap-4 py-5 text-[11px] text-[var(--muted)] md:flex-row md:items-center md:justify-between">

          <span>
            © 2026 Venuvella. All rights
            reserved.
          </span>


          <div className="flex flex-wrap gap-x-5 gap-y-2">

            <Link
              href="/privacy"
              className="transition hover:text-[var(--ink)]"
            >
              Privacy
            </Link>


            <Link
              href="/terms"
              className="transition hover:text-[var(--ink)]"
            >
              Terms
            </Link>


            <Link
              href="/affiliate-disclosure"
              className="transition hover:text-[var(--ink)]"
            >
              Affiliate Disclosure
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}