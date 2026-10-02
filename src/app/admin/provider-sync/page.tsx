import Link from "next/link";



import { prisma } from "@/lib/db/prisma";
import { requirePageRole } from "@/lib/auth/require-admin";



import {

  getRegisteredProviderAdapters,

  hasProviderAdapter,

} from "@/lib/affiliate/provider-sync/registry";



import {

  runProviderSyncAction,

} from "./actions";





export const dynamic =

  "force-dynamic";





function formatDate(

  value: Date | null

) {

  if (!value) {

    return "Never";

  }





  return value.toLocaleString();

}





function getStatusLabel(

  status: string

) {

  if (

    status === "SUCCESS"

  ) {

    return "Success";

  }





  if (

    status ===

    "COMPLETED_WITH_ERRORS"

  ) {

    return "Completed with errors";

  }





  if (

    status === "FAILED"

  ) {

    return "Failed";

  }





  if (

    status === "RUNNING"

  ) {

    return "Running";

  }





  return status;

}





export default async function ProviderSyncPage() {

    await requirePageRole([
    "ADMIN",
  ]);

const [

    providers,

    job,

    logs,

  ] = await Promise.all([

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





    prisma.automationJob.findUnique({

      where: {

        name:

          "provider-product-sync",

      },

    }),





    prisma.automationLog.findMany({

      where: {

        jobName:

          "provider-product-sync",

      },



      orderBy: {

        startedAt:

          "desc",

      },



      take: 20,

    }),

  ]);





  const registeredAdapters =

    getRegisteredProviderAdapters();





  const providersWithAdapters =

    providers.filter(

      (provider) =>

        hasProviderAdapter(

          provider.slug

        )

    );





  const providersWithoutAdapters =

    providers.filter(

      (provider) =>

        !hasProviderAdapter(

          provider.slug

        )

    );





  const latestLog =

    logs[0] ??

    null;





  return (

    <main className="min-h-screen bg-[#efeee9] py-10">



      <div className="container-shell">



        {/* Header */}



        <div className="flex flex-wrap items-end justify-between gap-6">



          <div>



            <p className="admin-eyebrow">

              Affiliate / Synchronization

            </p>





            <h1 className="display-serif mt-2 text-5xl">

              Provider sync

            </h1>





            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">

              Provider-independent synchronization

              infrastructure for prices,

              availability, provider metadata

              and merchant destinations.

            </p>



          </div>





          <div className="flex flex-wrap gap-2">



            <Link

              href="/admin/affiliate-ops"

              className="admin-secondary"

            >

              Affiliate operations

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





        {/* Run synchronization */}



        <section className="mt-10 rounded-2xl border border-[var(--line)] bg-white p-6">



          <div className="flex flex-wrap items-center justify-between gap-6">



            <div>



              <p className="admin-eyebrow">

                Synchronization engine

              </p>





              <h2 className="display-serif mt-2 text-3xl">

                Run provider sync

              </h2>





              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">

                Run registered provider

                adapters against connected

                provider-product mappings.

                Providers without adapters are

                recorded as skipped.

              </p>



            </div>





            <form

              action={

                runProviderSyncAction

              }

            >



              <button

                type="submit"

                className="admin-primary"

              >

                Run provider sync

              </button>



            </form>



          </div>





          {latestLog && (



            <div className="mt-6 border-t border-[var(--line)] pt-5">



              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">



                <div>



                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                    Latest status

                  </p>



                  <p className="mt-2 text-sm font-semibold">

                    {

                      getStatusLabel(

                        latestLog.status

                      )

                    }

                  </p>



                </div>





                <div>



                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                    Processed

                  </p>



                  <p className="mt-2 text-sm font-semibold">

                    {

                      latestLog.processed

                    }

                  </p>



                </div>





                <div>



                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                    Failed

                  </p>



                  <p className="mt-2 text-sm font-semibold">

                    {

                      latestLog.failed

                    }

                  </p>



                </div>





                <div>



                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">

                    Last run

                  </p>



                  <p className="mt-2 text-sm font-semibold">

                    {

                      formatDate(

                        latestLog.finishedAt ??

                        latestLog.startedAt

                      )

                    }

                  </p>



                </div>





                <div className="flex items-end">



                  <Link

                    href={`/admin/provider-sync/${latestLog.id}`}

                    className="admin-secondary"

                  >

                    View run

                  </Link>



                </div>



              </div>



            </div>



          )}



        </section>





        {/* Architecture status */}



        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">



          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Providers

            </p>



            <p className="mt-4 text-4xl font-semibold">

              {

                providers.length

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Registered adapters

            </p>



            <p className="mt-4 text-4xl font-semibold">

              {

                registeredAdapters.length

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Connected providers

            </p>



            <p className="mt-4 text-4xl font-semibold">

              {

                providersWithAdapters.length

              }

            </p>



          </div>





          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">



            <p className="admin-eyebrow">

              Last sync run

            </p>



            <p className="mt-4 text-sm font-semibold">

              {

                formatDate(

                  job?.lastRunAt ??

                  null

                )

              }

            </p>



          </div>



        </section>





        {/* Architecture notice */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Sync architecture

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Provider adapters

          </h2>





          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">

            Venuvella only updates

            provider-controlled information

            through configured provider adapters.

            Providers without an adapter are

            skipped rather than producing

            fabricated data.

          </p>



        </section>





        {/* Registered adapters */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Registry

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Registered adapters

          </h2>





          {registeredAdapters.length >

          0 ? (



            <div className="mt-6 divide-y divide-[var(--line)]">



              {registeredAdapters.map(

                (adapter) => (



                  <div

                    key={

                      adapter.slug

                    }

                    className="flex flex-wrap items-center justify-between gap-4 py-4"

                  >



                    <div>



                      <p className="font-medium">

                        {

                          adapter.name

                        }

                      </p>





                      <p className="mt-1 text-xs text-[var(--muted)]">

                        Adapter slug:{" "}

                        {

                          adapter.slug

                        }

                      </p>



                    </div>





                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">

                      Registered

                    </span>



                  </div>



                )

              )}



            </div>



          ) : (



            <p className="mt-6 text-sm text-[var(--muted)]">

              No provider adapters are registered.

            </p>



          )}



        </section>





        {/* Providers with adapters */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Integration coverage

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Providers with adapters

          </h2>





          {providersWithAdapters.length >

          0 ? (



            <div className="mt-6 divide-y divide-[var(--line)]">



              {providersWithAdapters.map(

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

                          provider._count

                            .providerProducts

                        }

                        {" "}

                        mappings Â·{" "}

                        {

                          provider.status

                        }

                      </p>



                    </div>





                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">

                      Adapter available

                    </span>



                  </div>



                )

              )}



            </div>



          ) : (



            <p className="mt-6 text-sm text-[var(--muted)]">

              No configured providers currently

              match a registered adapter.

            </p>



          )}



        </section>





        {/* Providers without adapters */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <p className="admin-eyebrow">

            Integration coverage

          </p>





          <h2 className="display-serif mt-2 text-3xl">

            Providers without adapters

          </h2>





          {providersWithoutAdapters.length >

          0 ? (



            <div className="mt-6 divide-y divide-[var(--line)]">



              {providersWithoutAdapters.map(

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

                          provider._count

                            .providerProducts

                        }

                        {" "}

                        mappings Â· slug{" "}

                        {

                          provider.slug

                        }

                      </p>



                    </div>





                    <Link

                      href={`/admin/providers/${provider.id}`}

                      className="admin-secondary"

                    >

                      Provider settings

                    </Link>



                  </div>



                )

              )}



            </div>



          ) : (



            <p className="mt-6 text-sm text-[var(--muted)]">

              Every configured provider

              currently has an adapter.

            </p>



          )}



        </section>





        {/* Sync history */}



        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">



          <div className="flex flex-wrap items-end justify-between gap-4">



            <div>



              <p className="admin-eyebrow">

                Automation

              </p>





              <h2 className="display-serif mt-2 text-3xl">

                Sync history

              </h2>



            </div>





            <p className="text-xs text-[var(--muted)]">

              Latest 20 runs

            </p>



          </div>





          {logs.length >

          0 ? (



            <div className="mt-6 overflow-x-auto">



              <table className="min-w-full text-left">



                <thead>



                  <tr className="border-b border-[var(--line)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">



                    <th className="px-3 py-3">

                      Started

                    </th>



                    <th className="px-3 py-3">

                      Finished

                    </th>



                    <th className="px-3 py-3">

                      Status

                    </th>



                    <th className="px-3 py-3">

                      Processed

                    </th>



                    <th className="px-3 py-3">

                      Failed

                    </th>



                    <th className="px-3 py-3">

                      Error

                    </th>



                    <th className="px-3 py-3">

                      Details

                    </th>



                  </tr>



                </thead>





                <tbody>



                  {logs.map(

                    (log) => (



                      <tr

                        key={

                          log.id

                        }

                        className="border-b border-[var(--line)] text-sm last:border-b-0"

                      >



                        <td className="whitespace-nowrap px-3 py-4">

                          {

                            formatDate(

                              log.startedAt

                            )

                          }

                        </td>





                        <td className="whitespace-nowrap px-3 py-4">

                          {

                            formatDate(

                              log.finishedAt

                            )

                          }

                        </td>





                        <td className="px-3 py-4 font-medium">

                          {

                            getStatusLabel(

                              log.status

                            )

                          }

                        </td>





                        <td className="px-3 py-4">

                          {

                            log.processed

                          }

                        </td>





                        <td className="px-3 py-4">

                          {

                            log.failed

                          }

                        </td>





                        <td className="max-w-sm px-3 py-4 text-xs text-[var(--muted)]">

                          {

                            log.error ??

                            "â€”"

                          }

                        </td>





                        <td className="px-3 py-4">



                          <Link

                            href={`/admin/provider-sync/${log.id}`}

                            className="admin-link"

                          >

                            View run

                          </Link>



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

                No provider synchronization jobs have run yet.

              </p>



            </div>



          )}



        </section>



      </div>



    </main>

  );

}
