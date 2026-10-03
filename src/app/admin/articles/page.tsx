import Link from "next/link";

import {
  ContentStatus,
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
  25;


type AdminArticlesPageProps = {
  searchParams:
    Promise<{
      q?: string;
      status?: string;
      category?: string;
      page?: string;
    }>;
};


function normalizeSearchValue(
  value:
    | string
    | undefined
) {
  return value
    ?.trim() ??
    "";
}


function parsePage(
  value:
    | string
    | undefined
) {
  const parsed =
    Number.parseInt(
      value ?? "1",
      10
    );


  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed < 1
  ) {
    return 1;
  }


  return parsed;
}


function parseStatus(
  value:
    | string
    | undefined
):
  | ContentStatus
  | null {
  if (
    !value
  ) {
    return null;
  }


  if (
    Object.values(
      ContentStatus
    ).includes(
      value as ContentStatus
    )
  ) {
    return value as ContentStatus;
  }


  return null;
}


function getStatusClasses(
  status: ContentStatus
) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case ContentStatus.SCHEDULED:
      return "border-blue-300 bg-blue-50 text-blue-800";

    case ContentStatus.ARCHIVED:
      return "border-slate-300 bg-slate-100 text-slate-700";

    case ContentStatus.DRAFT:
    default:
      return "border-amber-300 bg-amber-50 text-amber-800";
  }
}


function getStatusLabel(
  status: ContentStatus
) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return "Published";

    case ContentStatus.SCHEDULED:
      return "Scheduled";

    case ContentStatus.ARCHIVED:
      return "Archived";

    case ContentStatus.DRAFT:
    default:
      return "Draft";
  }
}


function formatDate(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle:
        "medium",
    }
  ).format(
    value
  );
}


function buildPageHref({
  q,
  status,
  category,
  page,
}: {
  q: string;
  status: string;
  category: string;
  page: number;
}) {
  const params =
    new URLSearchParams();


  if (q) {
    params.set(
      "q",
      q
    );
  }


  if (status) {
    params.set(
      "status",
      status
    );
  }


  if (category) {
    params.set(
      "category",
      category
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
    ? `/admin/articles?${query}`
    : "/admin/articles";
}


export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  const session =
    await requirePageRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
    ]);


  const params =
    await searchParams;


  const isAuthor =
    session.role ===
    "AUTHOR";


  const query =
    normalizeSearchValue(
      params.q
    );


  const selectedStatus =
    parseStatus(
      params.status
    );


  const selectedCategory =
    normalizeSearchValue(
      params.category
    );


  const currentPage =
    parsePage(
      params.page
    );


  const ownAuthor =
    isAuthor
      ? await prisma.author.findUnique({
          where: {
            userId:
              session.userId,
          },

          select: {
            id: true,
            name: true,
          },
        })
      : null;


  const ownershipWhere:
    Prisma.ArticleWhereInput =
    isAuthor
      ? ownAuthor
        ? {
            authorId:
              ownAuthor.id,
          }
        : {
            id: {
              equals:
                "__no_article__",
            },
          }
      : {};


  const filters:
    Prisma.ArticleWhereInput[] = [
      ownershipWhere,
    ];


  if (query) {
    filters.push({
      OR: [
        {
          title: {
            contains:
              query,

            mode:
              "insensitive",
          },
        },

        {
          subtitle: {
            contains:
              query,

            mode:
              "insensitive",
          },
        },

        {
          excerpt: {
            contains:
              query,

            mode:
              "insensitive",
          },
        },

        {
          author: {
            name: {
              contains:
                query,

              mode:
                "insensitive",
            },
          },
        },
      ],
    });
  }


  if (selectedStatus) {
    filters.push({
      status:
        selectedStatus,
    });
  }


  if (selectedCategory) {
    filters.push({
      categoryId:
        selectedCategory,
    });
  }


  const where:
    Prisma.ArticleWhereInput = {
      AND:
        filters,
    };


  const [
    articles,
    totalCount,
    categories,
    statusCounts,
  ] = await Promise.all([
    prisma.article.findMany({
      where,

      orderBy: [
        {
          updatedAt:
            "desc",
        },

        {
          title:
            "asc",
        },
      ],

      skip:
        (
          currentPage -
          1
        ) *
        PAGE_SIZE,

      take:
        PAGE_SIZE,

      select: {
        id: true,
        title: true,
        subtitle: true,
        status: true,
        updatedAt: true,
        publishedAt: true,

        author: {
          select: {
            name: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.article.count({
      where,
    }),

    prisma.category.findMany({
      orderBy: {
        name:
          "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),

    Promise.all([
      prisma.article.count({
        where: {
          AND: [
            ownershipWhere,

            {
              status:
                ContentStatus.DRAFT,
            },
          ],
        },
      }),

      prisma.article.count({
        where: {
          AND: [
            ownershipWhere,

            {
              status:
                ContentStatus.SCHEDULED,
            },
          ],
        },
      }),

      prisma.article.count({
        where: {
          AND: [
            ownershipWhere,

            {
              status:
                ContentStatus.PUBLISHED,
            },
          ],
        },
      }),

      prisma.article.count({
        where: {
          AND: [
            ownershipWhere,

            {
              status:
                ContentStatus.ARCHIVED,
            },
          ],
        },
      }),
    ]),
  ]);


  const [
    draftCount,
    scheduledCount,
    publishedCount,
    archivedCount,
  ] = statusCounts;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCount /
          PAGE_SIZE
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const firstItem =
    totalCount ===
      0
      ? 0
      : (
          safeCurrentPage -
          1
        ) *
          PAGE_SIZE +
        1;


  const lastItem =
    Math.min(
      safeCurrentPage *
        PAGE_SIZE,
      totalCount
    );


  const hasFilters =
    Boolean(
      query ||
        selectedStatus ||
        selectedCategory
    );


  const canCreate =
    !isAuthor ||
    Boolean(
      ownAuthor
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <header className="flex flex-wrap items-end justify-between gap-5">

          <div>

            <p className="admin-eyebrow">
              Content / Editorial
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              {isAuthor
                ? "Your articles"
                : "Articles"}
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {isAuthor
                ? "Create and manage editorial content assigned to your author profile."
                : "Search, filter, create, and manage Venuvella editorial content."}
            </p>


            {isAuthor &&
              ownAuthor && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Author profile:{" "}
                <span className="font-medium text-[var(--ink)]">
                  {ownAuthor.name}
                </span>
              </p>
            )}

          </div>


          <div className="flex flex-wrap gap-2">

            {canCreate && (
              <Link
                href="/admin/articles/new"
                className="admin-primary"
              >
                + New article
              </Link>
            )}

          </div>

        </header>


        {isAuthor &&
          !ownAuthor && (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <p className="font-semibold">
              Author profile required
            </p>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Your account is not linked
              to an author profile yet.
              An administrator must link
              your staff account before
              you can create or edit
              articles.
            </p>

          </div>
        )}


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Total
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {draftCount +
                scheduledCount +
                publishedCount +
                archivedCount}
            </p>

          </div>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ContentStatus.DRAFT,

              category:
                selectedCategory,

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Draft
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {draftCount}
            </p>

          </Link>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ContentStatus.SCHEDULED,

              category:
                selectedCategory,

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Scheduled
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {scheduledCount}
            </p>

          </Link>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ContentStatus.PUBLISHED,

              category:
                selectedCategory,

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Published
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {publishedCount}
            </p>

          </Link>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ContentStatus.ARCHIVED,

              category:
                selectedCategory,

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Archived
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {archivedCount}
            </p>

          </Link>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">

          <form
            method="GET"
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_240px_auto]"
          >

            <div>

              <label
                htmlFor="q"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
              >
                Search
              </label>


              <input
                id="q"
                name="q"
                type="search"
                defaultValue={
                  query
                }
                className="admin-input w-full"
                placeholder="Title, subtitle, excerpt, or author"
              />

            </div>


            <div>

              <label
                htmlFor="status"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
              >
                Status
              </label>


              <select
                id="status"
                name="status"
                defaultValue={
                  selectedStatus ??
                  ""
                }
                className="admin-input w-full"
              >

                <option value="">
                  All statuses
                </option>


                {Object.values(
                  ContentStatus
                ).map(
                  (status) => (

                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {getStatusLabel(
                        status
                      )}
                    </option>

                  )
                )}

              </select>

            </div>


            <div>

              <label
                htmlFor="category"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
              >
                Category
              </label>


              <select
                id="category"
                name="category"
                defaultValue={
                  selectedCategory
                }
                className="admin-input w-full"
              >

                <option value="">
                  All categories
                </option>


                {categories.map(
                  (category) => (

                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

            </div>


            <div className="flex items-end gap-2">

              <button
                type="submit"
                className="admin-primary"
              >
                Apply
              </button>


              {hasFilters && (
                <Link
                  href="/admin/articles"
                  className="admin-secondary"
                >
                  Clear
                </Link>
              )}

            </div>

          </form>

        </section>


        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">

          <p className="text-sm text-[var(--muted)]">
            {totalCount ===
              0
              ? "No matching articles"
              : `Showing ${firstItem}–${lastItem} of ${totalCount} articles`}
          </p>


          {hasFilters && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Filters active
            </p>
          )}

        </div>


        <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

          {articles.length >
          0 ? (
            <>
              <div className="hidden grid-cols-[minmax(0,1fr)_140px_170px_150px] border-b border-[var(--line)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)] lg:grid">

                <span>
                  Article
                </span>

                <span>
                  Status
                </span>

                <span>
                  Category
                </span>

                <span>
                  Updated
                </span>

              </div>


              <div className="divide-y divide-[var(--line)]">

                {articles.map(
                  (article) => (

                    <Link
                      key={
                        article.id
                      }
                      href={`/admin/articles/${article.id}`}
                      className="grid gap-4 p-5 transition hover:bg-[var(--paper)] lg:grid-cols-[minmax(0,1fr)_140px_170px_150px] lg:items-center"
                    >

                      <div className="min-w-0">

                        <p className="truncate font-medium">
                          {article.title}
                        </p>


                        {article.subtitle && (
                          <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
                            {article.subtitle}
                          </p>
                        )}


                        <p className="mt-2 text-xs text-[var(--muted)]">
                          {article.author.name}
                        </p>

                      </div>


                      <div>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                            article.status
                          )}`}
                        >
                          {getStatusLabel(
                            article.status
                          )}
                        </span>

                      </div>


                      <p className="text-sm">
                        {article.category.name}
                      </p>


                      <p className="text-sm text-[var(--muted)]">
                        {formatDate(
                          article.updatedAt
                        )}
                      </p>

                    </Link>

                  )
                )}

              </div>
            </>
          ) : (
            <div className="p-10 text-center">

              <p className="font-medium">
                {hasFilters
                  ? "No articles match these filters."
                  : isAuthor
                    ? "No articles are available for your author account yet."
                    : "No articles have been created yet."}
              </p>


              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                {hasFilters
                  ? "Try changing the search term, status, or category."
                  : "Create the first article to begin building the Venuvella editorial library."}
              </p>


              <div className="mt-6 flex flex-wrap justify-center gap-3">

                {hasFilters && (
                  <Link
                    href="/admin/articles"
                    className="admin-secondary"
                  >
                    Clear filters
                  </Link>
                )}


                {canCreate && (
                  <Link
                    href="/admin/articles/new"
                    className="admin-primary"
                  >
                    Create article
                  </Link>
                )}

              </div>

            </div>
          )}

        </section>


        {totalPages >
          1 && (
          <nav className="mt-6 flex flex-wrap items-center justify-between gap-4">

            <p className="text-sm text-[var(--muted)]">
              Page{" "}
              {safeCurrentPage}{" "}
              of{" "}
              {totalPages}
            </p>


            <div className="flex gap-2">

              {safeCurrentPage >
                1 && (
                <Link
                  href={buildPageHref({
                    q:
                      query,

                    status:
                      selectedStatus ??
                      "",

                    category:
                      selectedCategory,

                    page:
                      safeCurrentPage -
                      1,
                  })}
                  className="admin-secondary"
                >
                  ← Previous
                </Link>
              )}


              {safeCurrentPage <
                totalPages && (
                <Link
                  href={buildPageHref({
                    q:
                      query,

                    status:
                      selectedStatus ??
                      "",

                    category:
                      selectedCategory,

                    page:
                      safeCurrentPage +
                      1,
                  })}
                  className="admin-secondary"
                >
                  Next →
                </Link>
              )}

            </div>

          </nav>
        )}

      </div>

    </main>
  );
}