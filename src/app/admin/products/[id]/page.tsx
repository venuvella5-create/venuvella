import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

import {
  deleteProviderMapping,
} from "@/app/admin/products/actions";

import {
  ProviderMappingForm,
} from "@/components/admin/ProviderMappingForm";


export const dynamic =
  "force-dynamic";


export default async function AdminProductPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;


  const [
    product,
    providers,
  ] = await Promise.all([

    prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        brand: true,
        category: true,

        providerProducts: {
          include: {
            provider: true,
          },

          orderBy: {
            updatedAt:
              "desc",
          },
        },
      },
    }),


    prisma.affiliateProvider.findMany({
      orderBy: {
        name:
          "asc",
      },
    }),

  ]);


  if (!product) {
    notFound();
  }


  const providerOptions =
    providers.map(
      (provider) => ({
        id:
          provider.id,

        name:
          provider.name,
      })
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/products"
          className="admin-link"
        >
          ← Products
        </Link>


        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Commerce / Product
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              {product.name}
            </h1>


            <p className="mt-4 text-sm text-[var(--muted)]">

              {product.brand?.name ??
                "Venuvella"}

              {" · "}

              {product.category.name}

              {" · "}

              {product.status}

            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/providers"
              className="admin-secondary"
            >
              Providers
            </Link>


            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="admin-secondary"
            >
              View product
            </Link>

          </div>

        </div>


        {/* EXISTING MAPPINGS */}

        <section className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Provider mappings
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Shopping destinations
          </h2>


          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Edit the external product information,
            affiliate destination, price and availability
            associated with this Venuvella product.
          </p>


          {product.providerProducts.length >
          0 ? (

            <div className="mt-8 space-y-6">

              {product.providerProducts.map(
                (mapping) => (

                  <div
                    key={
                      mapping.id
                    }
                    className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5"
                  >

                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

                      <div>

                        <p className="admin-eyebrow">
                          Provider mapping
                        </p>


                        <h3 className="mt-2 text-xl font-semibold">
                          {
                            mapping
                              .provider
                              .name
                          }
                        </h3>


                        <p className="mt-2 text-xs text-[var(--muted)]">
                          External ID:{" "}
                          {
                            mapping.externalProductId
                          }
                        </p>

                      </div>


                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {
                            mapping.syncStatus
                          }
                        </span>


                        <form
                          action={
                            deleteProviderMapping
                          }
                        >

                          <input
                            type="hidden"
                            name="mappingId"
                            value={
                              mapping.id
                            }
                          />

                          <input
                            type="hidden"
                            name="productId"
                            value={
                              product.id
                            }
                          />


                          <button
                            type="submit"
                            className="admin-danger"
                          >
                            Remove
                          </button>

                        </form>

                      </div>

                    </div>


                    <ProviderMappingForm
  productId={product.id}
  providers={providerOptions}
  mapping={{
    id: mapping.id,

    providerId:
      mapping.providerId,

    externalProductId:
      mapping.externalProductId,

    productUrl:
      mapping.productUrl,

    affiliateUrl:
      mapping.affiliateUrl,

    price:
      mapping.price?.toString() ??
      null,

    currency:
      mapping.currency,

    availability:
      mapping.availability,

    priority:
      mapping.priority,

    syncStatus:
      mapping.syncStatus,
  }}
/>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-8 text-center">

              <p className="text-sm text-[var(--muted)]">
                No provider mappings have been created
                for this product yet.
              </p>

            </div>

          )}

        </section>


        {/* CREATE NEW MAPPING */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Add provider mapping
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Connect another provider
          </h2>


          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Add another merchant or affiliate destination
            for this product.
          </p>


          {providers.length > 0 ? (

            <div className="mt-8">

              <ProviderMappingForm
                productId={
                  product.id
                }

                providers={
                  providerOptions
                }
              />

            </div>

          ) : (

            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-8">

              <p className="text-sm text-[var(--muted)]">
                No affiliate providers exist yet.
              </p>


              <Link
                href="/admin/providers/new"
                className="admin-primary mt-5 inline-flex"
              >
                Create provider
              </Link>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}