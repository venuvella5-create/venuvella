import Link from "next/link";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";
import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


function isSafeExternalUrl(
  value:
    string |
    null
) {
  if (!value) {
    return false;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}


function percentage(
  value: number,
  total: number
) {
  if (total <= 0) {
    return 0;
  }

  return (
    (value / total) *
    100
  );
}


function daysSince(
  date: Date
) {
  return Math.floor(
    (
      Date.now() -
      date.getTime()
    ) /
      86_400_000
  );
}


export default async function ProvidersPage() {
  await requirePageRole([
    "ADMIN",
  ]);


  const thirtyDaysAgo =
    new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() -
      29
  );


  const [
    providers,
    recentProviderGroups,
    publishedProducts,
  ] =
    await Promise.all([
      prisma.affiliateProvider.findMany({
        orderBy: {
          name:
            "asc",
        },

        include: {
          providerProducts: {
            select: {
              id:
                true,
              productId:
                true,
              affiliateUrl:
                true,
              productUrl:
                true,
              availability:
                true,
              syncStatus:
                true,
              priority:
                true,
              updatedAt:
                true,

              product: {
                select: {
                  id:
                    true,
                  name:
                    true,
                  slug:
                    true,
                  status:
                    true,
                },
              },
            },
          },

          _count: {
            select: {
              providerProducts:
                true,
              clicks:
                true,
            },
          },
        },
      }),

      prisma.affiliateClick.groupBy({
        by: [
          "providerId",
        ],

        where: {
          createdAt: {
            gte:
              thirtyDaysAgo,
          },

          providerId: {
            not:
              null,
          },
        },

        _count: {
          _all:
            true,
        },
      }),

      prisma.product.findMany({
        where: {
          status:
            "PUBLISHED",
        },

        select: {
          id:
            true,
          name:
            true,
          slug:
            true,

          providerProducts: {
            where: {
              provider: {
                status: {
                  not:
                    "INACTIVE",
                },
              },
            },

            select: {
              providerId:
                true,
              affiliateUrl:
                true,
              productUrl:
                true,
              updatedAt:
                true,
            },
          },
        },
      }),
    ]);


  const recentClicksByProvider =
    new Map(
      recentProviderGroups
        .filter(
          (
            group
          ) =>
            Boolean(
              group.providerId
            )
        )
        .map(
          (
            group
          ) => [
            group.providerId as string,
            group._count._all,
          ]
        )
    );


  const totalRecentClicks =
    recentProviderGroups.reduce(
      (
        total,
        group
      ) =>
        total +
        group._count._all,
      0
    );


  const productsWithNoProvider =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length ===
        0
    );


  const productsWithSingleProvider =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length ===
        1
    );


  const productsWithNoValidDestination =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length >
          0 &&
        product.providerProducts.every(
          (
            mapping
          ) =>
            !isSafeExternalUrl(
              mapping.affiliateUrl
            ) &&
            !isSafeExternalUrl(
              mapping.productUrl
            )
        )
    );


  const productsWithMultipleProviders =
    publishedProducts.filter(
      (
        product
      ) =>
        product.providerProducts
          .length >=
        2
    );


  const coverageRate =
    percentage(
      publishedProducts.length -
        productsWithNoProvider.length,
      publishedProducts.length
    );


  const multiProviderCoverageRate =
    percentage(
      productsWithMultipleProviders.length,
      publishedProducts.length
    );


  const providersWithMetrics =
    providers.map(
      (
        provider
      ) => {
        const recentClicks =
          recentClicksByProvider.get(
            provider.id
          ) ??
          0;

        const publishedMappings =
          provider.providerProducts.filter(
            (
              mapping
            ) =>
              mapping.product.status ===
              "PUBLISHED"
          );

        const validMappings =
          publishedMappings.filter(
            (
              mapping
            ) =>
              isSafeExternalUrl(
                mapping.affiliateUrl
              ) ||
              isSafeExternalUrl(
                mapping.productUrl
              )
          );

        const affiliateReadyMappings =
          publishedMappings.filter(
            (
              mapping
            ) =>
              isSafeExternalUrl(
                mapping.affiliateUrl
              )
          );

        const staleMappings =
          publishedMappings.filter(
            (
              mapping
            ) =>
              daysSince(
                mapping.updatedAt
              ) >
              30
          );

        return {
          provider,
          recentClicks,
          recentClickShare:
            percentage(
              recentClicks,
              totalRecentClicks
            ),
          publishedMappings,
          validMappings,
          affiliateReadyMappings,
          staleMappings,
        };
      }
    );


  const topRecentProvider =
    [...providersWithMetrics]
      .sort(
        (
          a,
          b
        ) =>
          b.recentClicks -
          a.recentClicks
      )[0] ??
    null;


  const concentration =
    topRecentProvider
      ? topRecentProvider.recentClickShare
      : 0;


  const optimizationSignals: {
    title: string;
    detail: string;
    tone:
      | "positive"
      | "watch"
      | "neutral";
  }[] = [];


  if (
    publishedProducts.length ===
    0
  ) {
    optimizationSignals.push({
      title:
        "No published products yet",
      detail:
        "Provider optimization will become meaningful once published products are available.",
      tone:
        "neutral",
    });
  } else {
    if (
      productsWithNoProvider.length >
      0
    ) {
      optimizationSignals.push({
        title:
          "Published products without a provider",
        detail:
          `${productsWithNoProvider.length} published product${productsWithNoProvider.length === 1 ? "" : "s"} currently have no active provider mapping. Add at least one valid retailer destination before promoting them heavily.`,
        tone:
          "watch",
      });
    }


    if (
      productsWithNoValidDestination.length >
      0
    ) {
      optimizationSignals.push({
        title:
          "Mappings without a usable destination",
        detail:
          `${productsWithNoValidDestination.length} product${productsWithNoValidDestination.length === 1 ? "" : "s"} have provider mappings but no valid HTTP/HTTPS affiliate or retailer URL.`,
        tone:
          "watch",
      });
    }


    if (
      productsWithSingleProvider.length >
      0
    ) {
      optimizationSignals.push({
        title:
          "Single-provider dependency",
        detail:
          `${productsWithSingleProvider.length} published product${productsWithSingleProvider.length === 1 ? "" : "s"} rely on only one active provider. Add alternatives first to products receiving the most retailer interest.`,
        tone:
          "neutral",
      });
    }


    if (
      concentration >=
      70
    ) {
      optimizationSignals.push({
        title:
          "Recent provider concentration is high",
        detail:
          `${topRecentProvider?.provider.name ?? "The leading provider"} received ${concentration.toFixed(1)}% of retailer clicks in the last 30 days. Review coverage before changing priority purely because of click volume.`,
        tone:
          "watch",
      });
    } else if (
      totalRecentClicks >
      0
    ) {
      optimizationSignals.push({
        title:
          "Recent retailer interest is distributed",
        detail:
          `The leading provider received ${concentration.toFixed(1)}% of retailer clicks in the last 30 days. Continue prioritizing destination quality, availability and editorial usefulness.`,
        tone:
          "positive",
      });
    }
  }


  const visibleSignals =
    optimizationSignals.slice(
      0,
      4
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Commerce / Providers
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Affiliate providers
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Manage retailer coverage, affiliate destinations,
              provider concentration and product mapping health.
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
              href="/admin/providers/new"
              className="admin-primary"
            >
              + Add provider
            </Link>

          </div>

        </div>


        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            label="Product coverage"
            value={`${coverageRate.toFixed(1)}%`}
            detail={`${publishedProducts.length - productsWithNoProvider.length} of ${publishedProducts.length} published products mapped`}
          />

          <MetricCard
            label="Multi-provider coverage"
            value={`${multiProviderCoverageRate.toFixed(1)}%`}
            detail={`${productsWithMultipleProviders.length} published products have 2+ active providers`}
          />

          <MetricCard
            label="No valid destination"
            value={String(
              productsWithNoValidDestination.length
            )}
            detail="Mapped products with no usable outbound URL"
          />

          <MetricCard
            label="30-day retailer clicks"
            value={String(
              totalRecentClicks
            )}
            detail={
              topRecentProvider
                ? `Leader: ${topRecentProvider.provider.name} (${concentration.toFixed(1)}%)`
                : "No provider-attributed clicks yet"
            }
          />

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Provider intelligence
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Coverage recommendations
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            These recommendations use mapping health and retailer-click behavior.
            Click volume is a signal of outbound interest, not confirmed sales or revenue.
          </p>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {visibleSignals.length >
            0 ? (
              visibleSignals.map(
                (
                  signal
                ) => (
                  <div
                    key={
                      signal.title
                    }
                    className={`rounded-xl border p-5 ${
                      signal.tone ===
                      "positive"
                        ? "border-emerald-200 bg-emerald-50"
                        : signal.tone ===
                            "watch"
                          ? "border-amber-300 bg-amber-50"
                          : "border-[var(--line)] bg-[var(--paper)]"
                    }`}
                  >
                    <p className="font-semibold">
                      {signal.title}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {signal.detail}
                    </p>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Provider coverage looks healthy for the current catalog.
              </p>
            )}

          </div>

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Coverage gaps
            </p>

            <h2 className="display-serif mt-2 text-3xl">
              Products needing attention
            </h2>


            <div className="mt-6 space-y-6">

              <IssueList
                title="No active provider"
                products={
                  productsWithNoProvider
                }
              />

              <IssueList
                title="No valid destination"
                products={
                  productsWithNoValidDestination
                }
              />

              <IssueList
                title="Only one active provider"
                products={
                  productsWithSingleProvider.slice(
                    0,
                    8
                  )
                }
              />

            </div>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Priority guidance
            </p>

            <h2 className="display-serif mt-2 text-3xl">
              How routing currently works
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--muted)]">

              <p>
                Provider mappings are ordered by the lowest priority number first.
                When priorities match, the most recently updated mapping is considered first.
              </p>

              <p>
                Venuvella prefers a valid affiliate URL and only falls back to the normal retailer URL when no valid affiliate URL is available for the selected candidate.
              </p>

              <p>
                A provider explicitly selected from the product page remains preferred for that click.
                Priority should therefore represent destination quality and editorial preference, not just raw click totals.
              </p>

            </div>

          </div>

        </section>


        <section className="mt-8">

          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Provider directory
              </p>

              <h2 className="display-serif mt-2 text-3xl">
                Mapping and click health
              </h2>

            </div>

            <p className="text-sm text-[var(--muted)]">
              Last 30 days + all-time mapping totals
            </p>

          </div>


          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

            {providersWithMetrics.length >
            0 ? (

              <div className="divide-y divide-[var(--line)]">

                {providersWithMetrics.map(
                  (
                    item
                  ) => {

                    const {
                      provider,
                      recentClicks,
                      recentClickShare,
                      publishedMappings,
                      validMappings,
                      affiliateReadyMappings,
                      staleMappings,
                    } =
                      item;


                    const mappingHealth =
                      publishedMappings.length >
                      0
                        ? percentage(
                            validMappings.length,
                            publishedMappings.length
                          )
                        : 0;


                    return (

                      <div
                        key={
                          provider.id
                        }
                        className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(110px,0.45fr))_auto] lg:items-center"
                      >

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="text-xl font-semibold">
                              {provider.name}
                            </h3>


                            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {provider.status}
                            </span>

                          </div>


                          <p className="mt-2 text-sm text-[var(--muted)]">
                            /{provider.slug}
                          </p>


                          {provider.websiteUrl && (
                            <p className="mt-2 break-all text-xs text-[var(--muted)]">
                              {provider.websiteUrl}
                            </p>
                          )}

                        </div>


                        <ProviderStat
                          label="Published mappings"
                          value={
                            publishedMappings.length
                          }
                        />


                        <ProviderStat
                          label="Valid destinations"
                          value={`${mappingHealth.toFixed(0)}%`}
                        />


                        <ProviderStat
                          label="Affiliate ready"
                          value={
                            affiliateReadyMappings.length
                          }
                        />


                        <ProviderStat
                          label="30d clicks"
                          value={
                            recentClicks
                          }
                          detail={`${recentClickShare.toFixed(1)}% share`}
                        />


                        <div className="flex flex-col items-end gap-2">

                          {staleMappings.length >
                            0 && (
                            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-amber-800">
                              {staleMappings.length} stale
                            </span>
                          )}


                          <Link
                            href={`/admin/providers/${provider.id}`}
                            className="admin-primary shrink-0"
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

                <p className="text-sm text-[var(--muted)]">
                  No affiliate providers have been created yet.
                </p>


                <Link
                  href="/admin/providers/new"
                  className="admin-primary mt-6 inline-flex"
                >
                  Create first provider
                </Link>

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}


function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

      <p className="admin-eyebrow">
        {label}
      </p>

      <p className="mt-3 text-4xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        {detail}
      </p>

    </div>
  );
}


function ProviderStat({
  label,
  value,
  detail,
}: {
  label: string;
  value:
    string |
    number;
  detail?: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-[var(--muted)]">
          {detail}
        </p>
      )}

    </div>
  );
}


function IssueList({
  title,
  products,
}: {
  title: string;
  products: {
    id: string;
    name: string;
    slug: string;
  }[];
}) {
  return (
    <div>

      <div className="flex items-center justify-between gap-4">

        <p className="text-sm font-semibold">
          {title}
        </p>

        <span className="text-xs text-[var(--muted)]">
          {products.length}
        </span>

      </div>


      {products.length >
      0 ? (

        <div className="mt-3 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">

          {products
            .slice(
              0,
              8
            )
            .map(
              (
                product
              ) => (

                <Link
                  key={
                    product.id
                  }
                  href={`/admin/products/${product.id}`}
                  className="block px-4 py-3 text-sm transition hover:bg-[var(--paper)]"
                >
                  {product.name}
                </Link>

              )
            )}

        </div>

      ) : (

        <p className="mt-2 text-xs text-[var(--muted)]">
          None.
        </p>

      )}

    </div>
  );
}
