import Link from "next/link";

import { prisma } from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function ProvidersPage() {
  const providers =
    await prisma.affiliateProvider.findMany({
      orderBy: {
        name: "asc",
      },

      include: {
        _count: {
          select: {
            providerProducts: true,
            clicks: true,
          },
        },
      },
    });


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
              Manage the merchants and affiliate networks
              Venuvella can use for outbound product links.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

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


        <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

          {providers.length > 0 ? (

            <div className="divide-y divide-[var(--line)]">

              {providers.map(
                (provider) => (

                  <div
                    key={provider.id}
                    className="flex flex-col justify-between gap-5 p-5 md:flex-row md:items-center"
                  >

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-semibold">
                          {provider.name}
                        </h2>


                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {provider.status}
                        </span>

                      </div>


                      <p className="mt-2 text-sm text-[var(--muted)]">
                        /{provider.slug}
                      </p>


                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--muted)]">

                        <span>
                          Product mappings:{" "}
                          {
                            provider._count
                              .providerProducts
                          }
                        </span>

                        <span>
                          Clicks:{" "}
                          {
                            provider._count
                              .clicks
                          }
                        </span>

                      </div>


                      {provider.websiteUrl && (
                        <p className="mt-3 break-all text-xs text-[var(--muted)]">
                          {provider.websiteUrl}
                        </p>
                      )}

                    </div>


                    <Link
                      href={`/admin/providers/${provider.id}`}
                      className="admin-primary shrink-0"
                    >
                      Manage
                    </Link>

                  </div>

                )
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

      </div>

    </main>
  );
}