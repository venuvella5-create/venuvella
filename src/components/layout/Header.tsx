"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Menu,
  Search,
  X,
} from "lucide-react";

import {
  Logo,
} from "./Logo";


type NavItem = {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
  }[];
};


const navItems: NavItem[] = [
  { label: "Beauty", href: "/beauty" },
  { label: "Home", href: "/home" },
  { label: "Fitness", href: "/fitness" },
  { label: "Style", href: "/style" },
  {
    label: "Celebrity Fashion",
    href: "/celebrity-fashion",
    children: [
      { label: "Women", href: "/celebrity-fashion/women" },
      { label: "Men", href: "/celebrity-fashion/men" },
    ],
  },
  { label: "Seasonal", href: "/seasonal" },
  { label: "Products", href: "/products" },
  { label: "Guides", href: "/guides" },
  { label: "Deals", href: "/deals" },
];


export function Header() {
  const [
    open,
    setOpen,
  ] = useState(
    false
  );


  function closeMenu() {
    setOpen(
      false
    );
  }


  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">

      <div className="container-shell flex h-[76px] items-center justify-between gap-5">

        <Link
          href="/"
          aria-label="Venuvella home"
          onClick={
            closeMenu
          }
          className="shrink-0"
        >
          <Logo />
        </Link>


        <nav
          className="hidden items-center gap-5 xl:flex"
          aria-label="Primary navigation"
        >

          {navItems.map(
            (item) =>
              item.children ? (
                <div
                  key={item.href}
                  className="group relative"
                >
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.11em] text-[var(--muted)] transition hover:text-[var(--ink)]"
                  >
                    {item.label}
                  </Link>

                  <div className="invisible absolute left-1/2 top-full z-50 w-44 -translate-x-1/2 pt-4 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-xl border border-[var(--line)] bg-white p-2 shadow-lg">
                      {item.children.map(
                        (child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-4 py-3 text-xs font-medium uppercase tracking-[0.11em] text-[var(--muted)] transition hover:bg-[var(--warm)] hover:text-[var(--ink)]"
                          >
                            {child.label}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.11em] text-[var(--muted)] transition hover:text-[var(--ink)]"
                >
                  {item.label}
                </Link>
              )
          )}

        </nav>


        <div className="flex items-center gap-2">

          <Link
            href="/search"
            aria-label="Search Venuvella"
            className="hidden min-h-[42px] items-center gap-2 rounded-full border border-[var(--line)] px-4 text-xs font-semibold uppercase tracking-[0.11em] transition hover:border-[var(--ink)] hover:bg-[var(--warm)] md:inline-flex"
          >

            <Search
              aria-hidden="true"
              size={
                16
              }
              strokeWidth={
                1.7
              }
            />

            <span>
              Search
            </span>

          </Link>


          <Link
            href="/search"
            aria-label="Search Venuvella"
            className="grid size-11 place-items-center rounded-full transition hover:bg-[var(--warm)] md:hidden"
          >

            <Search
              aria-hidden="true"
              size={
                19
              }
              strokeWidth={
                1.7
              }
            />

          </Link>


          <Link
            href="/#newsletter"
            className="hidden min-h-[42px] items-center rounded-full border border-[var(--ink)] px-5 text-xs font-semibold uppercase tracking-[0.11em] transition hover:bg-[var(--ink)] hover:text-white sm:inline-flex"
          >
            Newsletter
          </Link>


          <button
            type="button"
            aria-label={
              open
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={
              open
            }
            aria-controls="mobile-navigation"
            onClick={() =>
              setOpen(
                (
                  current
                ) =>
                  !current
              )
            }
            className="grid size-11 place-items-center rounded-full transition hover:bg-[var(--warm)] xl:hidden"
          >

            {open ? (

              <X
                aria-hidden="true"
                size={
                  21
                }
              />

            ) : (

              <Menu
                aria-hidden="true"
                size={
                  21
                }
              />

            )}

          </button>

        </div>

      </div>


      {open && (

        <div
          id="mobile-navigation"
          className="border-t border-[var(--line)] bg-[var(--paper)] xl:hidden"
        >

          <nav
            className="container-shell py-5"
            aria-label="Mobile navigation"
          >

            <Link
              href="/search"
              onClick={
                closeMenu
              }
              className="mb-4 flex min-h-[52px] items-center justify-between rounded-full border border-[var(--line)] bg-white px-5 transition hover:border-[var(--ink)]"
            >

              <span className="flex items-center gap-3 text-sm font-semibold">

                <Search
                  aria-hidden="true"
                  size={
                    17
                  }
                  strokeWidth={
                    1.7
                  }
                />

                Search Venuvella

              </span>


              <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Search
              </span>

            </Link>


            <div className="grid sm:grid-cols-2 sm:gap-x-8">

              {navItems.map(
                (item) => (
                  <div
                    key={item.href}
                    className="border-b border-[var(--line)]"
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="block py-4 text-sm font-medium uppercase tracking-[0.1em] transition hover:text-[var(--accent)]"
                    >
                      {item.label}
                    </Link>

                    {item.children && (
                      <div className="mb-3 ml-4 flex flex-col border-l border-[var(--line)] pl-4">
                        {item.children.map(
                          (child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMenu}
                              className="py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted)] transition hover:text-[var(--accent)]"
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

            </div>


            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                href="/#newsletter"
                onClick={
                  closeMenu
                }
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--ink)] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Get the Edit
              </Link>


              <Link
                href="/articles"
                onClick={
                  closeMenu
                }
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--ink)] px-6 text-xs font-semibold uppercase tracking-[0.1em]"
              >
                All Articles
              </Link>

            </div>

          </nav>

        </div>

      )}

    </header>
  );
}