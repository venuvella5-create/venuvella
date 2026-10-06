import Link from "next/link";

import {
  Prisma,
  ProductStatus,
  SyncStatus,
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


type AdminProductsPageProps = {
  searchParams:
    Promise<{
      q?: string;
      status?: string;
      category?: string;
      provider?: string;
      sync?: string;
      page?: string;
    }>;
};


function normalizeValue(
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


function parseProductStatus(
  value:
    | string
    | undefined
):
  | ProductStatus
  | null {
  if (!value) {
    return null;
  }


  if (
    Object.values(
      ProductStatus
    ).includes(
      value as ProductStatus
    )
  ) {
    return value as ProductStatus;
  }


  return null;
}


function parseSyncStatus(
  value:
    | string
    | undefined
):
  | SyncStatus
  | null {
  if (!value) {
    return null;
  }


  if (
    Object.values(
      SyncStatus
    ).includes(
      value as SyncStatus
    )
  ) {
    return value as SyncStatus;
  }


  return null;
}


function formatLabel(
  value: string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    );
}


function getProductStatusClasses(
  status: ProductStatus
) {
  switch (status) {
    case ProductStatus.PUBLISHED:
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case ProductStatus.SYNCED:
      return "border-blue-300 bg-blue-50 text-blue-800";

    case ProductStatus.PENDING_REVIEW:
      return "border-amber-300 bg-amber-50 text-amber-800";

    case ProductStatus.STALE:
      return "border-orange-300 bg-orange-50 text-orange-800";

    case ProductStatus.UNAVAILABLE:
      return "border-rose-300 bg-rose-50 text-rose-800";

    case ProductStatus.ARCHIVED:
      return "border-slate-300 bg-slate-100 text-slate-700";

    case ProductStatus.DISCOVERED:
    case ProductStatus.IMPORTED:
    default:
      return "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]";
  }
}


function getSyncStatusClasses(
  status: SyncStatus
) {
  switch (status) {
    case SyncStatus.SUCCESS:
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case SyncStatus.FAILED:
      return "border-rose-300 bg-rose-50 text-rose-800";

    case SyncStatus.STALE:
      return "border-orange-300 bg-orange-50 text-orange-800";

    case SyncStatus.PENDING:
    default:
      return "border-amber-300 bg-amber-50 text-amber-800";
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
  provider,
  sync,
  page,
}: {
  q: string;
  status: string;
  category: string;
  provider: string;
  sync: string;
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


  if (provider) {
    params.set(
      "provider",
      provider
    );
  }


  if (sync) {
    params.set(
      "sync",
      sync
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
    ? `/admin/products?${query}`
    : "/admin/products";
}


export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requirePageRole([
    "ADMIN",
    "EDITOR",
  ]);


  const params =
    await searchParams;


  const query =
    normalizeValue(
      params.q
    );


  const selectedStatus =
    parseProductStatus(
      params.status
    );


  const selectedCategory =
    normalizeValue(
      params.category
    );


  const selectedProvider =
    normalizeValue(
      params.provider
    );


  const selectedSync =
    parseSyncStatus(
      params.sync
    );


  const currentPage =
    parsePage(
      params.page
    );


  const filters:
    Prisma.ProductWhereInput[] = [];


  if (query) {
    filters.push({
      OR: [
        {
          name: {
            contains:
              query,

            mode:
              "insensitive",
          },
        },

        {
          description: {
            contains:
              query,

            mode:
              "insensitive",
          },
        },

        {
          editorialSummary: {
            contains:
              query,

            mode:
              "insensitive",
          },
        },

        {
          brand: {
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


  if (selectedProvider) {
    filters.push({
      providerProducts: {
        some: {
          providerId:
            selectedProvider,
        },
      },
    });
  }


  if (selectedSync) {
    filters.push({
      providerProducts: {
        some: {
          syncStatus:
            selectedSync,
        },
      },
    });
  }


  const where:
    Prisma.ProductWhereInput =
    filters.length > 0
      ? {
          AND:
            filters,
        }
      : {};


  const [
    products,
    totalCount,
    categories,
    providers,
    statusCounts,
    syncCounts,
  ] = await Promise.all([
    prisma.product.findMany({
      where,

      orderBy: [
        {
          updatedAt:
            "desc",
        },

        {
          name:
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
        slug: true,
        name: true,
        status: true,
        updatedAt: true,

        brand: {
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

        providerProducts: {
          orderBy: [
            {
              priority:
                "asc",
            },

            {
              updatedAt:
                "desc",
            },
          ],

          select: {
            id: true,
            syncStatus: true,
            lastSyncedAt: true,
            price: true,
            currency: true,
            availability: true,

            provider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.product.count({
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

    prisma.affiliateProvider.findMany({
      orderBy: {
        name:
          "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),

    Promise.all(
      Object.values(
        ProductStatus
      ).map(
        async (
          status
        ) => ({
          status,

          count:
            await prisma.product.count({
              where: {
                status,
              },
            }),
        })
      )
    ),

    Promise.all(
      Object.values(
        SyncStatus
      ).map(
        async (
          status
        ) => ({
          status,

          count:
            await prisma.providerProduct.count({
              where: {
                syncStatus:
                  status,
              },
            }),
        })
      )
    ),
  ]);


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
        selectedCategory ||
        selectedProvider ||
        selectedSync
    );


  const publishedCount =
    statusCounts.find(
      (item) =>
        item.status ===
        ProductStatus.PUBLISHED
    )?.count ??
    0;


  const syncedCount =
    statusCounts.find(
      (item) =>
        item.status ===
        ProductStatus.SYNCED
    )?.count ??
    0;


  const reviewCount =
    statusCounts.find(
      (item) =>
        item.status ===
        ProductStatus.PENDING_REVIEW
    )?.count ??
    0;


  const staleCount =
    statusCounts.find(
      (item) =>
        item.status ===
        ProductStatus.STALE
    )?.count ??
    0;


  const failedSyncCount =
    syncCounts.find(
      (item) =>
        item.status ===
        SyncStatus.FAILED
    )?.count ??
    0;


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <header className="flex flex-wrap items-end justify-between gap-5">

          <div>

            <p className="admin-eyebrow">
              Commerce / Products
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Product management
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Search, review, filter, and
              manage Venuvella products
              and their affiliate-provider
              relationships.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">
<Link
    href="/admin/products/new"
    className="admin-primary"
  >
    Add Product
  </Link>
            <Link
              href="/admin/provider-sync"
              className="admin-secondary"
            >
              Provider sync
            </Link>

          </div>

        </header>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Total
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {statusCounts.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.count,
                0
              )}
            </p>

          </div>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ProductStatus.PUBLISHED,

              category:
                selectedCategory,

              provider:
                selectedProvider,

              sync:
                selectedSync ??
                "",

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
                ProductStatus.SYNCED,

              category:
                selectedCategory,

              provider:
                selectedProvider,

              sync:
                selectedSync ??
                "",

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Synced
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {syncedCount}
            </p>

          </Link>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ProductStatus.PENDING_REVIEW,

              category:
                selectedCategory,

              provider:
                selectedProvider,

              sync:
                selectedSync ??
                "",

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Review
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {reviewCount}
            </p>

          </Link>


          <Link
            href={buildPageHref({
              q:
                query,

              status:
                ProductStatus.STALE,

              category:
                selectedCategory,

              provider:
                selectedProvider,

              sync:
                selectedSync ??
                "",

              page:
                1,
            })}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
          >

            <p className="admin-eyebrow">
              Stale
            </p>


            <p className="mt-2 text-3xl font-semibold">
              {staleCount}
            </p>

          </Link>

        </section>


        {failedSyncCount >
          0 && (
          <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 p-5">

            <p className="font-semibold">
              Provider sync attention required
            </p>


            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {failedSyncCount} provider
              mapping
              {failedSyncCount ===
              1
                ? " has"
                : "s have"}{" "}
              a failed sync status.
            </p>


            <Link
              href={buildPageHref({
                q:
                  "",

                status:
                  "",

                category:
                  "",

                provider:
                  "",

                sync:
                  SyncStatus.FAILED,

                page:
                  1,
              })}
              className="admin-link mt-3 inline-flex"
            >
              Review failed syncs →
            </Link>

          </div>
        )}


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">

          <form
            method="GET"
            className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px_210px_210px_190px_auto]"
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
                placeholder="Product, description, or brand"
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
                  ProductStatus
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
                      {formatLabel(
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


            <div>

              <label
                htmlFor="provider"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
              >
                Provider
              </label>


              <select
                id="provider"
                name="provider"
                defaultValue={
                  selectedProvider
                }
                className="admin-input w-full"
              >

                <option value="">
                  All providers
                </option>


                {providers.map(
                  (provider) => (

                    <option
                      key={
                        provider.id
                      }
                      value={
                        provider.id
                      }
                    >
                      {provider.name}
                    </option>

                  )
                )}

              </select>

            </div>


            <div>

              <label
                htmlFor="sync"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
              >
                Sync status
              </label>


              <select
                id="sync"
                name="sync"
                defaultValue={
                  selectedSync ??
                  ""
                }
                className="admin-input w-full"
              >

                <option value="">
                  All sync states
                </option>


                {Object.values(
                  SyncStatus
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
                      {formatLabel(
                        status
                      )}
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
                  href="/admin/products"
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
              ? "No matching products"
              : `Showing ${firstItem}–${lastItem} of ${totalCount} products`}
          </p>


          {hasFilters && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Filters active
            </p>
          )}

        </div>


        <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

          {products.length >
          0 ? (
            <div className="divide-y divide-[var(--line)]">

              {products.map(
                (product) => {
                  const primaryMapping =
                    product.providerProducts[0] ??
                    null;


                  const failedMappings =
                    product.providerProducts.filter(
                      (mapping) =>
                        mapping.syncStatus ===
                        SyncStatus.FAILED
                    ).length;


                  return (
                    <div
                      key={
                        product.id
                      }
                      className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between"
                    >

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                            {product.category.name}
                          </p>


                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getProductStatusClasses(
                              product.status
                            )}`}
                          >
                            {formatLabel(
                              product.status
                            )}
                          </span>


                          {failedMappings >
                            0 && (
                            <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-800">
                              {failedMappings} failed sync
                              {failedMappings ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          )}

                        </div>


                        <h2 className="mt-3 text-xl font-semibold">
                          {product.name}
                        </h2>


                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--muted)]">

                          <span>
                            Brand:{" "}
                            {product.brand?.name ??
                              "Venuvella"}
                          </span>


                          <span>
                            Providers:{" "}
                            {product.providerProducts.length}
                          </span>


                          <span>
                            Updated:{" "}
                            {formatDate(
                              product.updatedAt
                            )}
                          </span>

                        </div>


                        {primaryMapping && (
                          <div className="mt-4 flex flex-wrap items-center gap-2">

                            <span className="text-xs text-[var(--muted)]">
                              Primary provider:
                            </span>


                            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium">
                              {primaryMapping.provider.name}
                            </span>


                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getSyncStatusClasses(
                                primaryMapping.syncStatus
                              )}`}
                            >
                              {formatLabel(
                                primaryMapping.syncStatus
                              )}
                            </span>


                            {primaryMapping.price !==
                              null && (
                              <span className="text-xs text-[var(--muted)]">
                                {primaryMapping.currency ??
                                  ""}
                                {" "}
                                {primaryMapping.price.toString()}
                              </span>
                            )}

                          </div>
                        )}


                        {product.providerProducts.length >
                          1 && (
                          <div className="mt-3 flex flex-wrap gap-2">

                            {product.providerProducts
                              .slice(
                                1,
                                6
                              )
                              .map(
                                (mapping) => (

                                  <span
                                    key={
                                      mapping.id
                                    }
                                    className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]"
                                  >
                                    {mapping.provider.name}
                                  </span>

                                )
                              )}

                            {product.providerProducts.length >
                              6 && (
                              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
                                +
                                {product.providerProducts.length -
                                  6}{" "}
                                more
                              </span>
                            )}

                          </div>
                        )}

                      </div>


                      <div className="flex shrink-0 flex-wrap gap-2">

                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-secondary"
                        >
                          View
                        </Link>


                        <Link
                          href={`/admin/products/${product.id}`}
                          className="admin-primary"
                        >
                          Manage
                        </Link>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="p-10 text-center">

              <p className="font-medium">
                {hasFilters
                  ? "No products match these filters."
                  : "No products have been added yet."}
              </p>


              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                {hasFilters
                  ? "Try changing the search term, product status, category, provider, or sync state."
                  : "Products will appear here once they are added to the Venuvella catalog."}
              </p>


              {hasFilters && (
                <Link
                  href="/admin/products"
                  className="admin-secondary mt-6 inline-flex"
                >
                  Clear filters
                </Link>
              )}

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

                    provider:
                      selectedProvider,

                    sync:
                      selectedSync ??
                      "",

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

                    provider:
                      selectedProvider,

                    sync:
                      selectedSync ??
                      "",

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