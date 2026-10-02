import Link from "next/link";



import {

  notFound,

} from "next/navigation";



import {

  prisma,

} from "@/lib/db/prisma";
import {
  requirePageRole,
} from "@/lib/auth/require-admin";




import {

  deleteProviderMapping,

} from "@/app/admin/products/actions";



import {

  ProviderMappingForm,

} from "@/components/admin/ProviderMappingForm";





export const dynamic =

  "force-dynamic";





function getProviderKind(

  providerName: string

) {

  const normalized =

    providerName

      .trim()

      .toLowerCase();





  if (

    normalized.includes(

      "amazon"

    )

  ) {

    return "amazon";

  }





  if (

    normalized.includes(

      "walmart"

    )

  ) {

    return "walmart";

  }





  return "generic";

}





function getExternalIdLabel(

  providerName: string

) {

  const kind =

    getProviderKind(

      providerName

    );





  if (

    kind ===

    "amazon"

  ) {

    return "ASIN";

  }





  if (

    kind ===

    "walmart"

  ) {

    return "Walmart item ID";

  }





  return "External ID";

}





function getStatusLabel(

  status: string

) {



  if (

    status ===

    "SUCCESS"

  ) {

    return "Ready";

  }





  if (

    status ===

    "PENDING"

  ) {

    return "Pending";

  }





  if (

    status ===

    "STALE"

  ) {

    return "Needs update";

  }





  if (

    status ===

    "FAILED"

  ) {

    return "Failed";

  }





  return status;

}





export default async function AdminProductPage({

  params,

}: {

  params: Promise<{

    id: string;

  }>;

}) {



  const { id } =

    await params;





  

  await requirePageRole([
    "ADMIN",
    "EDITOR",
  ]);

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





  const amazonMappingCount =

    product.providerProducts.filter(

      (mapping) =>

        getProviderKind(

          mapping.provider.name

        ) ===

        "amazon"

    ).length;





  const walmartMappingCount =

    product.providerProducts.filter(

      (mapping) =>

        getProviderKind(

          mapping.provider.name

        ) ===

        "walmart"

    ).length;





  const activeMappingCount =

    product.providerProducts.filter(

      (mapping) =>

        mapping.syncStatus ===

        "SUCCESS"

    ).length;





  return (

    <main className="min-h-screen bg-[#efeee9] py-10">



      <div className="container-shell">



        {/* BACK */}



        <Link

          href="/admin/products"

          className="admin-link"

        >

          â† Products

        </Link>





        {/* HEADER */}



        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">



          <div>



            <p className="admin-eyebrow">

              Commerce / Product

            </p>





            <h1 className="display-serif mt-2 text-5xl">

              {

                product.name

              }

            </h1>





            <p className="mt-4 text-sm text-[var(--muted)]">



              {

                product.brand?.name ??

                "Venuvella"

              }



              {" Â· "}



              {

                product.category.name

              }



              {" Â· "}



              {

                product.status

              }



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

              href="/admin/provider-sync"

              className="admin-secondary"

            >

              Sync

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





        {/* AFFILIATE SUMMARY */}



        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">



          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="admin-eyebrow">

              Destinations

            </p>





            <p className="mt-3 text-3xl font-semibold">

              {

                product

                  .providerProducts

                  .length

              }

            </p>





            <p className="mt-2 text-xs text-[var(--muted)]">

              Total provider mappings

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="admin-eyebrow">

              Ready

            </p>





            <p className="mt-3 text-3xl font-semibold">

              {

                activeMappingCount

              }

            </p>





            <p className="mt-2 text-xs text-[var(--muted)]">

              Active affiliate destinations

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="admin-eyebrow">

              Amazon

            </p>





            <p className="mt-3 text-3xl font-semibold">

              {

                amazonMappingCount

              }

            </p>





            <p className="mt-2 text-xs text-[var(--muted)]">

              Amazon Associates mappings

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="admin-eyebrow">

              Walmart

            </p>





            <p className="mt-3 text-3xl font-semibold">

              {

                walmartMappingCount

              }

            </p>





            <p className="mt-2 text-xs text-[var(--muted)]">

              Walmart affiliate mappings

            </p>



          </div>



        </section>





        {/* MANUAL AFFILIATE WORKFLOW */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Manual affiliate workflow

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Amazon + Walmart

          </h2>





          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">

            Venuvella keeps its own editorial

            product record while each merchant

            is stored as a separate shopping

            destination. This lets the same

            Venuvella product link to Amazon,

            Walmart or other providers without

            making any merchant the identity of

            the product.

          </p>





          <div className="mt-6 grid gap-4 lg:grid-cols-2">



            {/* AMAZON */}



            <div className="rounded-xl border border-[var(--line)] bg-[#f4f3ee] p-5">



              <div className="flex items-center justify-between gap-4">



                <div>



                  <p className="text-sm font-semibold">

                    Amazon Associates

                  </p>





                  <p className="mt-1 text-xs text-[var(--muted)]">

                    Current mode: Manual

                  </p>



                </div>





                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">

                  Manual

                </span>



              </div>





              <div className="mt-5 space-y-2 text-xs leading-5 text-[var(--muted)]">



                <p>

                  1. Find the product on Amazon.

                </p>



                <p>

                  2. Copy its 10-character ASIN.

                </p>



                <p>

                  3. Generate your Amazon

                  Associates affiliate link.

                </p>



                <p>

                  4. Add both values to the

                  provider mapping below.

                </p>



                <p>

                  5. Mark the mapping Ready once

                  the destination has been

                  verified.

                </p>



              </div>





              <p className="mt-5 text-xs font-semibold">

                Future:

                {" "}

                Creators API adapter

              </p>



            </div>





            {/* WALMART */}



            <div className="rounded-xl border border-[var(--line)] bg-[#f4f3ee] p-5">



              <div className="flex items-center justify-between gap-4">



                <div>



                  <p className="text-sm font-semibold">

                    Walmart Affiliate

                  </p>





                  <p className="mt-1 text-xs text-[var(--muted)]">

                    Current mode: Manual

                  </p>



                </div>





                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">

                  Manual

                </span>



              </div>





              <div className="mt-5 space-y-2 text-xs leading-5 text-[var(--muted)]">



                <p>

                  1. Find the product on

                  Walmart.

                </p>



                <p>

                  2. Record its Walmart item or

                  product ID.

                </p>



                <p>

                  3. Generate the approved

                  affiliate tracking link.

                </p>



                <p>

                  4. Add the mapping below.

                </p>



                <p>

                  5. Mark the mapping Ready once

                  the destination has been

                  verified.

                </p>



              </div>





              <p className="mt-5 text-xs font-semibold">

                Future:

                {" "}

                approved affiliate feed / API

              </p>



            </div>



          </div>



        </section>





        {/* EXISTING MAPPINGS */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Provider mappings

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Shopping destinations

          </h2>





          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">

            Edit the external product

            information, affiliate destination,

            price and availability associated

            with this Venuvella product.

          </p>





          {product.providerProducts.length >

          0 ? (



            <div className="mt-8 space-y-6">



              {product.providerProducts.map(

                (mapping) => {



                  const providerKind =

                    getProviderKind(

                      mapping

                        .provider

                        .name

                    );





                  return (

                    <div

                      key={

                        mapping.id

                      }

                      className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5"

                    >



                      {/* MAPPING HEADER */}



                      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">



                        <div>



                          <div className="flex flex-wrap items-center gap-2">



                            <p className="admin-eyebrow">

                              Provider mapping

                            </p>





                            {(providerKind ===

                              "amazon" ||

                              providerKind ===

                                "walmart") && (



                              <span className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">

                                Manual affiliate

                              </span>



                            )}



                          </div>





                          <h3 className="mt-2 text-xl font-semibold">

                            {

                              mapping

                                .provider

                                .name

                            }

                          </h3>





                          <p className="mt-2 text-xs text-[var(--muted)]">



                            {

                              getExternalIdLabel(

                                mapping

                                  .provider

                                  .name

                              )

                            }



                            {": "}



                            {

                              mapping.externalProductId

                            }



                          </p>





                          <p className="mt-1 text-xs text-[var(--muted)]">



                            Priority:

                            {" "}

                            {

                              mapping.priority

                            }



                          </p>



                        </div>





                        <div className="flex flex-wrap items-center gap-2">



                          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">

                            {

                              getStatusLabel(

                                mapping.syncStatus

                              )

                            }

                          </span>





                          {mapping.productUrl && (



                            <a

                              href={

                                mapping.productUrl

                              }

                              target="_blank"

                              rel="noopener noreferrer"

                              className="admin-secondary"

                            >

                              Product

                            </a>



                          )}





                          {mapping.affiliateUrl && (



                            <a

                              href={

                                mapping.affiliateUrl

                              }

                              target="_blank"

                              rel="noopener noreferrer"

                              className="admin-secondary"

                            >

                              Test affiliate link

                            </a>



                          )}





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





                      {/* MAPPING FORM */}



                      <ProviderMappingForm

                        productId={

                          product.id

                        }

                        providers={

                          providerOptions

                        }

                        mapping={{

                          id:

                            mapping.id,



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

                  );

                }

              )}



            </div>



          ) : (



            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-8 text-center">



              <p className="text-sm font-semibold">

                No affiliate destinations yet.

              </p>





              <p className="mt-2 text-xs text-[var(--muted)]">

                Add Amazon, Walmart or another

                provider using the form below.

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

            Add another merchant or affiliate

            destination for this product.

          </p>





          {providers.length >

          0 ? (



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

                No affiliate providers exist

                yet.

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
