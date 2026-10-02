import Link from "next/link";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function AdminProductsPage() {
  await requirePageRole([
    "ADMIN",
    "EDITOR",
  ]);


  const products =
    await prisma.product.findMany({
      orderBy: {
        updatedAt: "desc",
      },

      include: {
        brand: true,
        category: true,

        providerProducts: {
          include: {
            provider: true,
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
              Commerce / Products
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Product management
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Manage Venuvella products and connect them
              to affiliate providers.
            </p>
          </div>


          <Link
            href="/admin"
            className="admin-secondary"
          >
            Back to admin
          </Link>

        </div>


        <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

          {products.length > 0 ? (

            <div className="divide-y divide-[var(--line)]">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-5 p-5 md:flex-row md:items-center"
                >

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {product.category.name}
                    </p>


                    <h2 className="mt-2 text-xl font-semibold">
                      {product.name}
                    </h2>


                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">

                      <span>
                        Brand:{" "}
                        {product.brand?.name ?? "Venuvella"}
                      </span>

                      <span>
                        Status:{" "}
                        {product.status}
                      </span>

                      <span>
                        Providers:{" "}
                        {product.providerProducts.length}
                      </span>

                    </div>


                    {product.providerProducts.length > 0 && (

                      <div className="mt-3 flex flex-wrap gap-2">

                        {product.providerProducts.map((mapping) => (

                          <span
                            key={mapping.id}
                            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs"
                          >
                            {mapping.provider.name}
                          </span>

                        ))}

                      </div>

                    )}

                  </div>


                  <div className="flex shrink-0 flex-wrap gap-2">

                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
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

              ))}

            </div>

          ) : (

            <div className="p-10 text-center">

              <p className="text-sm text-[var(--muted)]">
                No products found.
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
