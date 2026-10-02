import Link from "next/link";

import { prisma } from "@/lib/db/prisma";

import {
  disableProviderSyncAction,
  enableProviderSyncAction,
  updateProviderSyncScheduleAction,
} from "./actions";


export const dynamic =
  "force-dynamic";


const JOB_NAME =
  "provider-product-sync";


const SCHEDULE_OPTIONS = [
  {
    value:
      "0 */6 * * *",

    label:
      "Every 6 hours",

    description:
      "4 synchronization runs per day.",
  },

  {
    value:
      "0 */12 * * *",

    label:
      "Every 12 hours",

    description:
      "2 synchronization runs per day.",
  },

  {
    value:
      "0 0 * * *",

    label:
      "Once daily",

    description:
      "One synchronization run per day.",
  },

  {
    value:
      "0 0 * * 1",

    label:
      "Once weekly",

    description:
      "One synchronization run every Monday.",
  },
];


function formatDate(
  value: Date | null
) {
  if (!value) {
    return "Never";
  }


  return value.toLocaleString();
}


function getScheduleLabel(
  schedule: string | null
) {
  if (!schedule) {
    return "Not configured";
  }


  const option =
    SCHEDULE_OPTIONS.find(
      (item) =>
        item.value ===
        schedule
    );


  return (
    option?.label ??
    schedule
  );
}


function calculateNextExpectedRun(
  schedule: string | null,
  enabled: boolean
) {
  if (!enabled) {
    return null;
  }


  const now =
    new Date();


  const next =
    new Date(now);


  if (
    schedule ===
    "0 */6 * * *"
  ) {
    next.setMinutes(
      0,
      0,
      0
    );


    const currentHour =
      now.getHours();


    const nextHour =
      Math.ceil(
        (currentHour + 1) /
          6
      ) * 6;


    if (
      nextHour >= 24
    ) {
      next.setDate(
        next.getDate() +
          1
      );

      next.setHours(
        0,
        0,
        0,
        0
      );

      return next;
    }


    next.setHours(
      nextHour,
      0,
      0,
      0
    );


    return next;
  }


  if (
    schedule ===
    "0 */12 * * *"
  ) {
    next.setMinutes(
      0,
      0,
      0
    );


    const currentHour =
      now.getHours();


    if (
      currentHour < 12
    ) {
      next.setHours(
        12,
        0,
        0,
        0
      );
    } else {
      next.setDate(
        next.getDate() +
          1
      );

      next.setHours(
        0,
        0,
        0,
        0
      );
    }


    return next;
  }


  if (
    schedule ===
    "0 0 * * *"
  ) {
    next.setDate(
      next.getDate() +
        1
    );

    next.setHours(
      0,
      0,
      0,
      0
    );


    return next;
  }


  if (
    schedule ===
    "0 0 * * 1"
  ) {
    const currentDay =
      next.getDay();


    let daysUntilMonday =
      (8 - currentDay) %
      7;


    if (
      daysUntilMonday === 0
    ) {
      daysUntilMonday =
        7;
    }


    next.setDate(
      next.getDate() +
        daysUntilMonday
    );

    next.setHours(
      0,
      0,
      0,
      0
    );


    return next;
  }


  return null;
}


export default async function ProviderSyncSchedulerPage() {
  const [
    job,
    latestLog,
    recentLogs,
  ] = await Promise.all([

    prisma.automationJob.findUnique({
      where: {
        name:
          JOB_NAME,
      },
    }),


    prisma.automationLog.findFirst({
      where: {
        jobName:
          JOB_NAME,
      },

      orderBy: {
        startedAt:
          "desc",
      },
    }),


    prisma.automationLog.findMany({
      where: {
        jobName:
          JOB_NAME,
      },

      orderBy: {
        startedAt:
          "desc",
      },

      take: 5,
    }),

  ]);


  const enabled =
    job?.enabled ??
    true;


  const schedule =
    job?.schedule ??
    "0 */6 * * *";


  const nextExpectedRun =
    calculateNextExpectedRun(
      schedule,
      enabled
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        {/* Back */}

        <Link
          href="/admin/provider-sync"
          className="admin-link"
        >
          ← Provider sync
        </Link>


        {/* Header */}

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">

          <div>

            <p className="admin-eyebrow">
              Provider sync / Automation
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Scheduler controls
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Configure how frequently Venuvella
              should allow automated provider
              synchronization jobs to run.
            </p>

          </div>


          <Link
            href="/admin/provider-sync"
            className="admin-secondary"
          >
            Sync dashboard
          </Link>

        </div>


        {/* Main status */}

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Automatic sync
            </p>


            <p className="mt-4 text-2xl font-semibold">
              {
                enabled
                  ? "Enabled"
                  : "Disabled"
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Schedule
            </p>


            <p className="mt-4 text-lg font-semibold">
              {
                getScheduleLabel(
                  schedule
                )
              }
            </p>


            <p className="mt-2 font-mono text-xs text-[var(--muted)]">
              {
                schedule
              }
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Last run
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


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Next expected run
            </p>


            <p className="mt-4 text-sm font-semibold">
              {
                enabled
                  ? formatDate(
                      nextExpectedRun
                    )
                  : "Automatic sync disabled"
              }
            </p>

          </div>

        </section>


        {/* Enable / disable */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Automation state
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Automatic synchronization
          </h2>


          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Disabling automatic synchronization
            prevents the cron endpoint from
            starting new scheduled provider
            synchronization runs. Manual
            synchronization from the admin
            dashboard remains available.
          </p>


          <div className="mt-6">

            {enabled ? (

              <form
                action={
                  disableProviderSyncAction
                }
              >

                <button
                  type="submit"
                  className="admin-secondary"
                >
                  Disable automatic sync
                </button>

              </form>

            ) : (

              <form
                action={
                  enableProviderSyncAction
                }
              >

                <button
                  type="submit"
                  className="admin-primary"
                >
                  Enable automatic sync
                </button>

              </form>

            )}

          </div>

        </section>


        {/* Schedule */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Frequency
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Synchronization schedule
          </h2>


          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Choose how frequently your external
            scheduler should call Venuvella&apos;s
            provider synchronization endpoint.
          </p>


          <form
            action={
              updateProviderSyncScheduleAction
            }
            className="mt-6 max-w-xl"
          >

            <label
              htmlFor="schedule"
              className="block text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Schedule
            </label>


            <select
              id="schedule"
              name="schedule"
              defaultValue={
                schedule
              }
              className="mt-3 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >

              {SCHEDULE_OPTIONS.map(
                (option) => (

                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>

                )
              )}

            </select>


            <div className="mt-4 space-y-2">

              {SCHEDULE_OPTIONS.map(
                (option) => (

                  <div
                    key={
                      option.value
                    }
                    className="text-xs text-[var(--muted)]"
                  >
                    <span className="font-semibold text-black">
                      {
                        option.label
                      }
                    </span>

                    {" — "}

                    {
                      option.description
                    }
                  </div>

                )
              )}

            </div>


            <button
              type="submit"
              className="admin-primary mt-6"
            >
              Save schedule
            </button>

          </form>

        </section>


        {/* Scheduler explanation */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Important
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Application schedule vs external scheduler
          </h2>


          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            This setting records Venuvella&apos;s
            desired synchronization frequency.
            Your hosting platform or external
            scheduler must still be configured
            to call the protected cron endpoint
            at the same frequency.
          </p>


          <div className="mt-6 rounded-xl bg-[#f4f3ee] p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Endpoint
            </p>


            <p className="mt-2 break-all font-mono text-sm">
              /api/cron/provider-sync
            </p>


            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Authorization
            </p>


            <p className="mt-2 font-mono text-sm">
              Bearer CRON_SECRET
            </p>

          </div>

        </section>


        {/* Latest execution */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Latest execution
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Most recent sync
          </h2>


          {latestLog ? (

            <div className="mt-6 grid gap-4 md:grid-cols-4">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Status
                </p>


                <p className="mt-2 text-sm font-semibold">
                  {
                    latestLog.status
                  }
                </p>

              </div>


              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Started
                </p>


                <p className="mt-2 text-sm">
                  {
                    formatDate(
                      latestLog.startedAt
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

                <Link
                  href={`/admin/provider-sync/${latestLog.id}`}
                  className="admin-link"
                >
                  View run →
                </Link>

              </div>

            </div>

          ) : (

            <p className="mt-6 text-sm text-[var(--muted)]">
              No provider sync has run yet.
            </p>

          )}

        </section>


        {/* Recent runs */}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Automation history
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Recent executions
          </h2>


          {recentLogs.length >
          0 ? (

            <div className="mt-6 divide-y divide-[var(--line)]">

              {recentLogs.map(
                (log) => (

                  <div
                    key={
                      log.id
                    }
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >

                    <div>

                      <p className="text-sm font-semibold">
                        {
                          log.status
                        }
                      </p>


                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {
                          formatDate(
                            log.startedAt
                          )
                        }
                        {" · "}
                        {
                          log.processed
                        }
                        {" processed · "}
                        {
                          log.failed
                        }
                        {" failed"}
                      </p>

                    </div>


                    <Link
                      href={`/admin/provider-sync/${log.id}`}
                      className="admin-link"
                    >
                      Details
                    </Link>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="mt-6 text-sm text-[var(--muted)]">
              No synchronization history available.
            </p>

          )}

        </section>

      </div>

    </main>
  );
}