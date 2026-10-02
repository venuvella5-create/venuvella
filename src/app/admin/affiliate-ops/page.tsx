import Link from "next/link";

import { prisma } from "@/lib/db/prisma";

import {
  runProviderHealthCheck,
} from "./actions";


export const dynamic =
  "force-dynamic";


function isValidHttpUrl(
  value: string | null
) {
  if (!value) {
    return false;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}


function formatDate(
  value: Date | null
) {
  if (!value) {
    return "Never";
  }

  return value.toLocaleString();
}


export default async function AffiliateOperationsPage() {
  const [
    publishedProducts,
    mappings,
    providers,
  ] = await Promise.all([
    prisma.product.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      select: {
        id: true,
        name: true,
        slug: true,

        providerProducts: {
          select: {
            id: true,
          },
        },
      },

      orderBy: {
        updatedAt:
          "desc",
      },
    }),


    prisma.providerProduct.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },

        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },

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
    }),


    prisma.affiliateProvider.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,

        _count: {
          select: {
            providerProducts:
              true,
          },
        },
      },

      orderBy: {
        name:
          "asc",
      },
    }),
  ]);


  /*
   * Products without providers.
   */

  const productsWithoutProviders =
    publishedProducts.filter(
      (product) =>
        product
          .providerProducts
          .length === 0
    );


  /*
   * Missing affiliate URLs.
   */

  const mappingsWithoutAffiliateUrl =
    mappings.filter(
      (mapping) =>
        !isValidHttpUrl(
          mapping.affiliateUrl
        )
    );


  /*
   * Missing all destinations.
   */

  const mappingsWithoutDestination =
    mappings.filter(
      (mapping) =>
        !isValidHttpUrl(
          mapping.affiliateUrl
        ) &&
        !isValidHttpUrl(
          mapping.productUrl
        )
    );


  /*
   * Failed mappings.
   */

  const failedMappings =
    mappings.filter(
      (mapping) =>
        mapping.syncStatus ===
        "FAILED"
    );


  /*
   * Stale mappings.
   */

  const staleCutoff =
    new Date();

  staleCutoff.setDate(
    staleCutoff.getDate() -
      30
  );


  const staleMappings =
    mappings.filter(
      (mapping) =>
        mapping.syncStatus ===
          "STALE" ||
        (
          mapping.lastSyncedAt &&
          mapping.lastSyncedAt <
            staleCutoff
        )
    );


  /*
   * Pending mappings.
   */

  const pendingMappings =
    mappings.filter(
      (mapping) =>
        mapping.syncStatus ===
        "PENDING"
    );


  /*
   * Successful mappings.
   */

  const successfulMappings =
    mappings.filter(
      (mapping) =>
        mapping.syncStatus ===
        "SUCCESS"
    );


  /*
   * Inactive providers.
   */

  const inactiveProviders =
    providers.filter(
      (provider) =>
        provider.status ===
        "INACTIVE"
    );


  /*
   * Map provider mappings by product.
   */

  const productMappings =
    new Map<
      string,
      typeof mappings
    >();


  for (
    const mapping
    of mappings
  ) {
    const existing =
      productMappings.get(
        mapping.productId
      ) ?? [];

    existing.push(
      mapping
    );

    productMappings.set(
      mapping.productId,
      existing
    );
  }


  /*
   * Published products that currently
   * have no usable active destination.
   */

  const unmonetizableProducts =
    publishedProducts.filter(
      (product) => {

        const productOffers =
          productMappings.get(
            product.id
          ) ?? [];


        return !productOffers.some(
          (offer) =>
            offer.provider
              .status !==
              "INACTIVE" &&
            (
              isValidHttpUrl(
                offer.affiliateUrl
              ) ||
              isValidHttpUrl(
                offer.productUrl
              )
            )
        );
      }
    );


  /*
   * Healthy mappings.
   */

  const healthyMappings =
    mappings.filter(
      (mapping) =>
        mapping.provider
          .status !==
          "INACTIVE" &&

        mapping.syncStatus !==
          "FAILED" &&

        mapping.syncStatus !==
          "STALE" &&

        (
          isValidHttpUrl(
            mapping.affiliateUrl
          ) ||
          isValidHttpUrl(
            mapping.productUrl
          )
        )
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        {/* Header */}

        <div className="flex flex-wrap items-end justify-between gap-6">

          <div>

            <p className="admin-eyebrow">
              Affiliate / Operations
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Affiliate operations
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Monitor provider health,
              affiliate destinations,
              synchronization status and
              products that may not
              currently monetize correctly.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/analytics"
              className="admin-secondary"
            >
              Analytics
            </Link>


            <Link
              href="/admin/products"
              className="admin-secondary"
            >
              Products
            </Link>


            <Link
              href="/admin/providers"
              className="admin-secondary"
            >
              Providers
            </Link>


            <Link
              href="/admin"
              className="admin-primary"
            >
              Admin home
            </Link>

          </div>

        </div>


        {/* Health scanner */}

        <section className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-center justify-between gap-6">

            <div>

              <p className="admin-eyebrow">
                Automated diagnostics
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Provider health scanner
              </h2>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Scan provider mappings
                for missing destinations,
                inactive providers and
                synchronization records
                older than 30 days.
              </p>

            </div>


            <form
              action={
                runProviderHealthCheck
              }
            >

              <button
                type="submit"
                className="admin-primary"
              >
                Run health check
              </button>

            </form>

          </div>

        </section>


        {/* Main summary */}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Provider mappings
            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {
                mappings.length
              }
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              Total product/provider
              connections
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Healthy mappings
            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {
                healthyMappings.length
              }
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              Operational mappings with
              usable destinations
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Cannot monetize
            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {
                unmonetizableProducts.length
              }
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              Published products with
              no active destination
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Failed
            </p>

            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {
                failedMappings.length
              }
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              Provider mappings marked
              FAILED
            </p>

          </div>

        </section>


        {/* Status overview */}

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Success
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                successfulMappings.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Pending
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                pendingMappings.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Stale
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                staleMappings.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Failed
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                failedMappings.length
              }
            </p>

          </div>

        </section>


        {/* Secondary health metrics */}

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              No provider
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                productsWithoutProviders.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Missing affiliate URL
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                mappingsWithoutAffiliateUrl.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Missing destination
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                mappingsWithoutDestination.length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Inactive providers
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {
                inactiveProviders.length
              }
            </p>

          </div>

        </section>


        {/* Critical products */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Critical
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Products that cannot monetize
              </h2>

            </div>


            <span className="text-sm font-semibold">
              {
                unmonetizableProducts.length
              }
            </span>

          </div>


          {unmonetizableProducts.length >
          0 ? (

            <div className="mt-6 divide-y divide-[var(--line)]">

              {unmonetizableProducts.map(
                (product) => (

                  <div
                    key={
                      product.id
                    }
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >

                    <div>

                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="font-medium hover:underline"
                      >
                        {
                          product.name
                        }
                      </Link>


                      <p className="mt-1 text-xs text-[var(--muted)]">
                        No active provider
                        currently has a
                        usable destination.
                      </p>

                    </div>


                    <Link
                      href={`/admin/products/${product.id}`}
                      className="admin-secondary"
                    >
                      Fix mappings
                    </Link>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] p-8 text-center">

              <p className="text-sm font-medium">
                All published products
                currently have a usable
                provider destination.
              </p>

            </div>

          )}

        </section>


        {/* Products without providers */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Coverage
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Products without providers
          </h2>


          {productsWithoutProviders.length >
          0 ? (

            <div className="mt-6 divide-y divide-[var(--line)]">

              {productsWithoutProviders.map(
                (product) => (

                  <div
                    key={
                      product.id
                    }
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >

                    <div>

                      <p className="font-medium">
                        {
                          product.name
                        }
                      </p>


                      <p className="mt-1 text-xs text-[var(--muted)]">
                        /products/
                        {
                          product.slug
                        }
                      </p>

                    </div>


                    <Link
                      href={`/admin/products/${product.id}`}
                      className="admin-secondary"
                    >
                      Add provider
                    </Link>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="mt-6 text-sm text-[var(--muted)]">
              Every published product
              has at least one provider
              mapping.
            </p>

          )}

        </section>


        {/* Destination problems */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Destination health
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Missing destinations
            </h2>


            <p className="mt-2 text-sm text-[var(--muted)]">
              Mappings with neither a
              valid affiliate URL nor a
              valid product URL.
            </p>


            {mappingsWithoutDestination.length >
            0 ? (

              <div className="mt-6 divide-y divide-[var(--line)]">

                {mappingsWithoutDestination.map(
                  (mapping) => (

                    <div
                      key={
                        mapping.id
                      }
                      className="flex items-start justify-between gap-4 py-4"
                    >

                      <div>

                        <p className="font-medium">
                          {
                            mapping.product.name
                          }
                        </p>


                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {
                            mapping.provider.name
                          }
                        </p>

                      </div>


                      <Link
                        href={`/admin/products/${mapping.productId}`}
                        className="admin-link"
                      >
                        Fix
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-6 text-sm text-[var(--muted)]">
                No mappings are missing
                both destination URLs.
              </p>

            )}

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Monetization
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Missing affiliate URLs
            </h2>


            <p className="mt-2 text-sm text-[var(--muted)]">
              These mappings may fall
              back to a normal product
              URL instead of an affiliate
              destination.
            </p>


            {mappingsWithoutAffiliateUrl.length >
            0 ? (

              <div className="mt-6 divide-y divide-[var(--line)]">

                {mappingsWithoutAffiliateUrl.map(
                  (mapping) => (

                    <div
                      key={
                        mapping.id
                      }
                      className="flex items-start justify-between gap-4 py-4"
                    >

                      <div>

                        <p className="font-medium">
                          {
                            mapping.product.name
                          }
                        </p>


                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {
                            mapping.provider.name
                          }
                        </p>

                      </div>


                      <Link
                        href={`/admin/products/${mapping.productId}`}
                        className="admin-link"
                      >
                        Edit
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-6 text-sm text-[var(--muted)]">
                All mappings currently
                have affiliate URLs.
              </p>

            )}

          </div>

        </section>


        {/* Synchronization health */}

        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Synchronization
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Failed mappings
            </h2>


            {failedMappings.length >
            0 ? (

              <div className="mt-6 divide-y divide-[var(--line)]">

                {failedMappings.map(
                  (mapping) => (

                    <div
                      key={
                        mapping.id
                      }
                      className="flex items-start justify-between gap-4 py-4"
                    >

                      <div>

                        <p className="font-medium">
                          {
                            mapping.product.name
                          }
                        </p>


                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {
                            mapping.provider.name
                          }
                          {" · "}
                          FAILED
                        </p>

                      </div>


                      <Link
                        href={`/admin/products/${mapping.productId}`}
                        className="admin-link"
                      >
                        Inspect
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-6 text-sm text-[var(--muted)]">
                No failed mappings.
              </p>

            )}

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Synchronization
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Stale mappings
            </h2>


            <p className="mt-2 text-sm text-[var(--muted)]">
              Explicitly stale or last
              synchronized more than
              30 days ago.
            </p>


            {staleMappings.length >
            0 ? (

              <div className="mt-6 divide-y divide-[var(--line)]">

                {staleMappings.map(
                  (mapping) => (

                    <div
                      key={
                        mapping.id
                      }
                      className="flex items-start justify-between gap-4 py-4"
                    >

                      <div>

                        <p className="font-medium">
                          {
                            mapping.product.name
                          }
                        </p>


                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Last sync:{" "}
                          {
                            formatDate(
                              mapping.lastSyncedAt
                            )
                          }
                        </p>

                      </div>


                      <Link
                        href={`/admin/products/${mapping.productId}`}
                        className="admin-link"
                      >
                        Inspect
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-6 text-sm text-[var(--muted)]">
                No stale mappings found.
              </p>

            )}

          </div>

        </section>


        {/* Inactive providers */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Provider health
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Inactive providers
          </h2>


          {inactiveProviders.length >
          0 ? (

            <div className="mt-6 divide-y divide-[var(--line)]">

              {inactiveProviders.map(
                (provider) => (

                  <div
                    key={
                      provider.id
                    }
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >

                    <div>

                      <p className="font-medium">
                        {
                          provider.name
                        }
                      </p>


                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {
                          provider
                            ._count
                            .providerProducts
                        }
                        {" "}
                        product mappings
                      </p>

                    </div>


                    <Link
                      href={`/admin/providers/${provider.id}`}
                      className="admin-secondary"
                    >
                      Manage provider
                    </Link>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="mt-6 text-sm text-[var(--muted)]">
              No providers are currently
              inactive.
            </p>

          )}

        </section>


        {/* Mapping inventory */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Inventory
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Provider mappings
          </h2>


          {mappings.length >
          0 ? (

            <div className="mt-6 overflow-x-auto">

              <table className="min-w-full text-left">

                <thead>

                  <tr className="border-b border-[var(--line)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                    <th className="px-3 py-3">
                      Product
                    </th>

                    <th className="px-3 py-3">
                      Provider
                    </th>

                    <th className="px-3 py-3">
                      Priority
                    </th>

                    <th className="px-3 py-3">
                      Affiliate URL
                    </th>

                    <th className="px-3 py-3">
                      Product URL
                    </th>

                    <th className="px-3 py-3">
                      Sync status
                    </th>

                    <th className="px-3 py-3">
                      Last synced
                    </th>

                    <th className="px-3 py-3">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {mappings.map(
                    (mapping) => (

                      <tr
                        key={
                          mapping.id
                        }
                        className="border-b border-[var(--line)] text-sm last:border-b-0"
                      >

                        <td className="px-3 py-4 font-medium">
                          {
                            mapping.product.name
                          }
                        </td>


                        <td className="px-3 py-4">
                          {
                            mapping.provider.name
                          }
                        </td>


                        <td className="px-3 py-4">
                          {
                            mapping.priority
                          }
                        </td>


                        <td className="px-3 py-4">
                          {
                            isValidHttpUrl(
                              mapping.affiliateUrl
                            )
                              ? "Yes"
                              : "No"
                          }
                        </td>


                        <td className="px-3 py-4">
                          {
                            isValidHttpUrl(
                              mapping.productUrl
                            )
                              ? "Yes"
                              : "No"
                          }
                        </td>


                        <td className="px-3 py-4 font-medium">
                          {
                            mapping.syncStatus
                          }
                        </td>


                        <td className="whitespace-nowrap px-3 py-4 text-xs text-[var(--muted)]">
                          {
                            formatDate(
                              mapping.lastSyncedAt
                            )
                          }
                        </td>


                        <td className="px-3 py-4">

                          <Link
                            href={`/admin/products/${mapping.productId}`}
                            className="admin-link"
                          >
                            Manage
                          </Link>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <p className="mt-6 text-sm text-[var(--muted)]">
              No provider mappings exist yet.
            </p>

          )}

        </section>

      </div>

    </main>
  );
}