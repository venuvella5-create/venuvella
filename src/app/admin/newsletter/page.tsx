import Link from "next/link";

import {
  Prisma,
} from "@prisma/client";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


const PAGE_SIZE =
  50;


function normalizeSearch(
  value:
    string |
    undefined
) {
  return (
    value
      ?.trim()
      .slice(
        0,
        160
      ) ?? ""
  );
}


function normalizeStatus(
  value:
    string |
    undefined
) {
  if (
    value === "confirmed" ||
    value === "unconfirmed"
  ) {
    return value;
  }

  return "all";
}


function normalizePage(
  value:
    string |
    undefined
) {
  const parsed =
    Number.parseInt(
      value ?? "1",
      10
    );

  if (
    Number.isNaN(
      parsed
    ) ||
    parsed < 1
  ) {
    return 1;
  }

  return parsed;
}


function formatDate(
  value:
    Date |
    null
) {
  if (
    !value
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    value
  );
}


function buildPageHref({
  q,
  status,
  page,
}: {
  q:
    string;

  status:
    string;

  page:
    number;
}) {
  const params =
    new URLSearchParams();

  if (
    q
  ) {
    params.set(
      "q",
      q
    );
  }

  if (
    status !==
    "all"
  ) {
    params.set(
      "status",
      status
    );
  }

  if (
    page > 1
  ) {
    params.set(
      "page",
      String(
        page
      )
    );
  }

  const query =
    params.toString();

  return query
    ? `/admin/newsletter?${query}`
    : "/admin/newsletter";
}


export default async function NewsletterAdminPage({
  searchParams,
}: {
  searchParams:
    Promise<{
      q?:
        string;

      status?:
        string;

      page?:
        string;
    }>;
}) {
  await requirePageRole([
    "ADMIN",
  ]);


  const query =
    await searchParams;


  const q =
    normalizeSearch(
      query.q
    );


  const status =
    normalizeStatus(
      query.status
    );


  const requestedPage =
    normalizePage(
      query.page
    );


  const where:
    Prisma.NewsletterSubscriberWhereInput =
      {};


  if (
    q
  ) {
    where.email = {
      contains:
        q,

      mode:
        "insensitive",
    };
  }


  if (
    status ===
    "confirmed"
  ) {
    where.confirmedAt = {
      not:
        null,
    };
  }


  if (
    status ===
    "unconfirmed"
  ) {
    where.confirmedAt =
      null;
  }


  const [
    totalSubscribers,
    confirmedSubscribers,
    unconfirmedSubscribers,
    filteredCount,
  ] =
    await Promise.all([
      prisma.newsletterSubscriber.count(),

      prisma.newsletterSubscriber.count({
        where: {
          confirmedAt: {
            not:
              null,
          },
        },
      }),

      prisma.newsletterSubscriber.count({
        where: {
          confirmedAt:
            null,
        },
      }),

      prisma.newsletterSubscriber.count({
        where,
      }),
    ]);


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredCount /
          PAGE_SIZE
      )
    );


  const currentPage =
    Math.min(
      requestedPage,
      totalPages
    );


  const subscribers =
    await prisma.newsletterSubscriber.findMany({
      where,

      orderBy: {
        createdAt:
          "desc",
      },

      skip:
        (
          currentPage -
          1
        ) *
        PAGE_SIZE,

      take:
        PAGE_SIZE,

      select: {
        id:
          true,

        email:
          true,

        confirmedAt:
          true,

        createdAt:
          true,

        updatedAt:
          true,
      },
    });


  const exportParams =
    new URLSearchParams();


  if (
    q
  ) {
    exportParams.set(
      "q",
      q
    );
  }


  if (
    status !==
    "all"
  ) {
    exportParams.set(
      "status",
      status
    );
  }


  const exportQuery =
    exportParams.toString();


  const exportHref =
    exportQuery
      ? `/admin/newsletter/export?${exportQuery}`
      : "/admin/newsletter/export";


  const firstVisible =
    filteredCount ===
    0
      ? 0
      : (
          (
            currentPage -
            1
          ) *
            PAGE_SIZE
        ) +
        1;


  const lastVisible =
    Math.min(
      currentPage *
        PAGE_SIZE,
      filteredCount
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Administration / Newsletter
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Newsletter subscribers
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Review newsletter signups,
              confirmation status and audience
              growth from one place.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin"
              className="admin-secondary"
            >
              Back to admin
            </Link>


            <Link
              href="/admin/newsletter/campaigns"
              className="admin-secondary"
            >
              Campaigns
            </Link>


            <Link
              href={
                exportHref
              }
              className="admin-primary"
            >
              Export CSV
            </Link>

          </div>

        </div>


        <section className="mt-10 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Total audience
            </p>


            <p className="display-serif mt-3 text-4xl">
              {
                totalSubscribers
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Confirmed
            </p>


            <p className="display-serif mt-3 text-4xl">
              {
                confirmedSubscribers
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Unconfirmed
            </p>


            <p className="display-serif mt-3 text-4xl">
              {
                unconfirmedSubscribers
              }
            </p>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Audience filters
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Search subscribers
          </h2>


          <form
            method="get"
            className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
          >

            <div>

              <label
                htmlFor="q"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>


              <input
                id="q"
                name="q"
                type="search"
                defaultValue={
                  q
                }
                placeholder="Search email"
                className="admin-input w-full"
              />

            </div>


            <div>

              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>


              <select
                id="status"
                name="status"
                defaultValue={
                  status
                }
                className="admin-input w-full"
              >
                <option value="all">
                  All subscribers
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="unconfirmed">
                  Unconfirmed
                </option>
              </select>

            </div>


            <div className="flex items-end gap-2">

              <button
                type="submit"
                className="admin-primary"
              >
                Apply filters
              </button>


              {(q ||
                status !==
                  "all") && (
                <Link
                  href="/admin/newsletter"
                  className="admin-secondary"
                >
                  Clear
                </Link>
              )}

            </div>

          </form>

        </section>


        <section className="mt-10">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Directory
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Subscriber records
              </h2>

            </div>


            <p className="text-sm text-[var(--muted)]">
              {filteredCount ===
              0
                ? "No matching subscribers"
                : `Showing ${firstVisible}–${lastVisible} of ${filteredCount}`}
            </p>

          </div>


          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

            {subscribers.length >
            0 ? (

              <div className="divide-y divide-[var(--line)]">

                {subscribers.map(
                  (
                    subscriber
                  ) => (

                    <div
                      key={
                        subscriber.id
                      }
                      className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)] lg:items-center"
                    >

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="break-all text-base font-semibold">
                            {
                              subscriber.email
                            }
                          </h3>


                          <span
                            className={
                              subscriber.confirmedAt
                                ? "rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800"
                                : "rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800"
                            }
                          >
                            {subscriber.confirmedAt
                              ? "Confirmed"
                              : "Unconfirmed"}
                          </span>

                        </div>


                        <p className="mt-2 text-xs text-[var(--muted)]">
                          ID:{" "}
                          {
                            subscriber.id
                          }
                        </p>

                      </div>


                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          Subscribed
                        </p>


                        <p className="mt-2 text-sm">
                          {
                            formatDate(
                              subscriber.createdAt
                            )
                          }
                        </p>

                      </div>


                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          Confirmed
                        </p>


                        <p className="mt-2 text-sm">
                          {
                            formatDate(
                              subscriber.confirmedAt
                            )
                          }
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="p-10">

                <p className="text-sm font-medium">
                  No newsletter subscribers found.
                </p>


                <p className="mt-2 text-sm text-[var(--muted)]">
                  Try changing the current filters.
                </p>

              </div>

            )}

          </div>


          {totalPages >
            1 && (

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

              <p className="text-sm text-[var(--muted)]">
                Page{" "}
                {
                  currentPage
                }{" "}
                of{" "}
                {
                  totalPages
                }
              </p>


              <div className="flex gap-2">

                {currentPage >
                  1 && (
                  <Link
                    href={
                      buildPageHref({
                        q,
                        status,
                        page:
                          currentPage -
                          1,
                      })
                    }
                    className="admin-secondary"
                  >
                    Previous
                  </Link>
                )}


                {currentPage <
                  totalPages && (
                  <Link
                    href={
                      buildPageHref({
                        q,
                        status,
                        page:
                          currentPage +
                          1,
                      })
                    }
                    className="admin-secondary"
                  >
                    Next
                  </Link>
                )}

              </div>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}