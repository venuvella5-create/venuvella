import Link from "next/link";

import { notFound } from "next/navigation";



import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/require-admin";





export const dynamic =

  "force-dynamic";





function formatDate(

  value: Date | null

) {

  if (!value) {

    return "â€”";

  }





  return value.toLocaleString();

}





function getDuration(

  value: number | null

) {

  if (

    value === null

  ) {

    return "â€”";

  }





  if (

    value < 1000

  ) {

    return `${value} ms`;

  }





  return `${(

    value /

    1000

  ).toFixed(2)} s`;

}





export default async function ProviderSyncRunPage({

  params,

}: {

  params: Promise<{

    logId: string;

  }>;

}) {

    await requirePageRole([
    "ADMIN",
  ]);

const { logId } =

    await params;





  const log =

    await prisma.automationLog.findUnique({

      where: {

        id:

          logId,

      },



      include: {

        items: {

          orderBy: {

            createdAt:

              "asc",

          },

        },

      },

    });





  if (!log) {

    notFound();

  }





  const successCount =

    log.items.filter(

      (item) =>

        item.status ===

        "SUCCESS"

    ).length;





  const failedCount =

    log.items.filter(

      (item) =>

        item.status ===

        "FAILED"

    ).length;





  const staleCount =

    log.items.filter(

      (item) =>

        item.status ===

        "STALE"

    ).length;





  const skippedCount =

    log.items.filter(

      (item) =>

        item.status ===

        "SKIPPED"

    ).length;





  return (

    <main className="min-h-screen bg-[#efeee9] py-10">



      <div className="container-shell">



        <Link

          href="/admin/provider-sync"

          className="admin-link"

        >

          â† Provider sync

        </Link>





        {/* Header */}



        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">



          <div>



            <p className="admin-eyebrow">

              Provider sync / Run

            </p>





            <h1 className="display-serif mt-2 text-5xl">

              Sync run details

            </h1>





            <p className="mt-4 text-sm text-[var(--muted)]">

              Run ID: {log.id}

            </p>



          </div>





          <Link

            href="/admin/affiliate-ops"

            className="admin-secondary"

          >

            Affiliate operations

          </Link>



        </div>





        {/* Run summary */}



        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">



          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Run status

            </p>





            <p className="mt-4 text-xl font-semibold">

              {

                log.status

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Processed

            </p>





            <p className="mt-4 text-4xl font-semibold">

              {

                log.processed

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Started

            </p>





            <p className="mt-4 text-sm font-semibold">

              {

                formatDate(

                  log.startedAt

                )

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Finished

            </p>





            <p className="mt-4 text-sm font-semibold">

              {

                formatDate(

                  log.finishedAt

                )

              }

            </p>



          </div>



        </section>





        {/* Result counts */}



        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">



          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

              Success

            </p>





            <p className="mt-3 text-2xl font-semibold">

              {

                successCount

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

              Failed

            </p>





            <p className="mt-3 text-2xl font-semibold">

              {

                failedCount

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

              Stale

            </p>





            <p className="mt-3 text-2xl font-semibold">

              {

                staleCount

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">



            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

              Skipped

            </p>





            <p className="mt-3 text-2xl font-semibold">

              {

                skippedCount

              }

            </p>



          </div>



        </section>





        {/* Run error */}



        {log.error && (



          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Run error

            </p>





            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">

              {

                log.error

              }

            </pre>



          </section>



        )}





        {/* Individual results */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Mapping results

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Individual sync results

          </h2>





          {log.items.length >

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

                      External ID

                    </th>



                    <th className="px-3 py-3">

                      Status

                    </th>



                    <th className="px-3 py-3">

                      Message

                    </th>



                    <th className="px-3 py-3">

                      Duration

                    </th>



                    <th className="px-3 py-3">

                      Action

                    </th>



                  </tr>



                </thead>





                <tbody>



                  {log.items.map(

                    (item) => (



                      <tr

                        key={

                          item.id

                        }

                        className="border-b border-[var(--line)] text-sm last:border-b-0"

                      >



                        <td className="px-3 py-4">



                          {item.productSlug ? (



                            <Link

                              href={`/products/${item.productSlug}`}

                              target="_blank"

                              className="font-medium hover:underline"

                            >

                              {

                                item.productName ??

                                "Unknown product"

                              }

                            </Link>



                          ) : (



                            item.productName ??

                            "Unknown product"



                          )}



                        </td>





                        <td className="px-3 py-4">

                          {

                            item.providerName ??

                            item.providerSlug ??

                            "Unknown provider"

                          }

                        </td>





                        <td className="px-3 py-4 text-xs text-[var(--muted)]">

                          {

                            item.externalProductId ??

                            "â€”"

                          }

                        </td>





                        <td className="px-3 py-4 font-semibold">

                          {

                            item.status

                          }

                        </td>





                        <td className="max-w-md px-3 py-4 text-xs leading-5 text-[var(--muted)]">

                          {

                            item.message ??

                            "â€”"

                          }

                        </td>





                        <td className="whitespace-nowrap px-3 py-4 text-xs">

                          {

                            getDuration(

                              item.durationMs

                            )

                          }

                        </td>





                        <td className="px-3 py-4">



                          {item.productId ? (



                            <Link

                              href={`/admin/products/${item.productId}`}

                              className="admin-link"

                            >

                              Manage

                            </Link>



                          ) : (

                            "â€”"

                          )}



                        </td>



                      </tr>



                    )

                  )}



                </tbody>



              </table>



            </div>



          ) : (



            <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] p-8 text-center">



              <p className="text-sm text-[var(--muted)]">

                This run does not contain item-level results.

              </p>





              <p className="mt-2 text-xs text-[var(--muted)]">

                Older synchronization runs created before

                Phase 4.14D will not have detailed items.

              </p>



            </div>



          )}



        </section>



      </div>



    </main>

  );

}
