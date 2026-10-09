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


const links = [
  "Beauty",
  "Home",
  "Fitness",
  "Style",
  "Seasonal",
  "Products",
  "Guides",
  "Deals",
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
          className="hidden items-center gap-6 xl:flex"
          aria-label="Primary navigation"
        >

          {links.map(
            (
              link
            ) => (

              <Link
                key={
                  link
                }
                href={`/${link.toLowerCase()}`}
                className="text-xs font-medium uppercase tracking-[0.11em] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                {link}
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

              {links.map(
                (
                  link
                ) => (

                  <Link
                    key={
                      link
                    }
                    href={`/${link.toLowerCase()}`}
                    onClick={
                      closeMenu
                    }
                    className="border-b border-[var(--line)] py-4 text-sm font-medium uppercase tracking-[0.1em] transition hover:text-[var(--accent)]"
                  >
                    {link}
                  </Link>

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