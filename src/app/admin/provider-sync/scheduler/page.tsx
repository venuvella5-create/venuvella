import Link from "next/link";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

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
] as const;


function formatDate(
  value:
    | Date
    | null
    | undefined
) {
  if (!value) {
    return "Never";
  }


  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    value
  );
}


function getScheduleLabel(
  schedule:
    | string
    | null
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


function getStatusLabel(
  status: string
) {
  switch (status) {
    case "SUCCESS":
      return "Success";

    case "COMPLETED_WITH_ERRORS":
      return "Completed with errors";

    case "FAILED":
      return "Failed";

    case "RUNNING":
      return "Running";

    case "PENDING":
      return "Pending";

    default:
      return status
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
}


function getStatusClasses(
  status: string
) {
  switch (status) {
    case "SUCCESS":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case "RUNNING":
      return "border-blue-300 bg-blue-50 text-blue-800";

    case "COMPLETED_WITH_ERRORS":
      return "border-amber-300 bg-amber-50 text-amber-800";

    case "FAILED":
      return "border-rose-300 bg-rose-50 text-rose-800";

    default:
      return "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]";
  }
}


function getDurationLabel(
  startedAt: Date,
  finishedAt:
    | Date
    | null
) {
  if (!finishedAt) {
    return "In progress";
  }


  const milliseconds =
    Math.max(
      0,
      finishedAt.getTime() -
        startedAt.getTime()
    );


  const seconds =
    Math.round(
      milliseconds /
        1000
    );


  if (
    seconds <
    60
  ) {
    return `${seconds}s`;
  }


  const minutes =
    Math.floor(
      seconds /
        60
    );


  const remainingSeconds =
    seconds %
    60;


  return `${minutes}m ${remainingSeconds}s`;
}


function calculateNextExpectedRun(
  schedule:
    | string
    | null,
  enabled: boolean
) {
  if (
    !enabled ||
    !schedule
  ) {
    return null;
  }


  const now =
    new Date();


  const next =
    new Date(
      now
    );


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
        (
          currentHour +
          1
        ) /
          6
      ) *
      6;


    if (
      nextHour >=
      24
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
      currentHour <
      12
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
      (
        8 -
        currentDay
      ) %
      7;


    if (
      daysUntilMonday ===
      0
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
  await requirePageRole([
    "ADMIN",
  ]);


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

      take:
        8,
    }),
  ]);


  const enabled =
    job?.enabled ??
    true;


  const schedule =
    job?.schedule ??
    "0 0 * * *";


  const nextExpectedRun =
    calculateNextExpectedRun(
      schedule,
      enabled
    );


  const selectedSchedule =
    SCHEDULE_OPTIONS.find(
      (option) =>
        option.value ===
        schedule
    );


  const recentFailures =
    recentLogs.filter(
      (log) =>
        log.status ===
          "FAILED" ||
        log.status ===
          "COMPLETED_WITH_ERRORS"
    );


  const latestNeedsAttention =
    latestLog &&
    (
      latestLog.status ===
        "FAILED" ||
      latestLog.status ===
        "COMPLETED_WITH_ERRORS" ||
      latestLog.failed >
        0
    );


  const runningLog =
    recentLogs.find(
      (log) =>
        log.status ===
        "RUNNING"
    ) ??
    null;


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <Link
            href="/admin/provider-sync"
            className="admin-link"
          >
            ← Provider sync
          </Link>


          <Link
            href="/admin/provider-sync"
            className="admin-secondary"
          >
            Sync dashboard
          </Link>

        </div>


        <header className="mt-6">

          <p className="admin-eyebrow">
            Provider sync / Automation
          </p>


          <h1 className="display-serif mt-2 text-5xl">
            Scheduler controls
          </h1>


          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Configure Venuvella&apos;s desired
            synchronization frequency and monitor
            the operational state of scheduled
            provider automation.
          </p>

        </header>


        {runningLog && (
          <section className="mt-8 rounded-2xl border border-blue-300 bg-blue-50 p-5">

            <p className="font-semibold">
              A provider sync is currently running
            </p>


            <p className="mt-2 text-sm text-[var(--muted)]">
              Started{" "}
              {formatDate(
                runningLog.startedAt
              )}.
              Scheduler settings can still be reviewed,
              but avoid changing automation state during
              an active run unless necessary.
            </p>

          </section>
        )}


        {!enabled && (
          <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <p className="font-semibold">
              Automatic synchronization is disabled
            </p>


            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Scheduled cron requests will not start new
              provider synchronization runs while this
              setting is disabled. Manual synchronization
              remains available from the provider-sync
              dashboard.
            </p>

          </section>
        )}


        {latestNeedsAttention && (
          <section className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 p-5">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="font-semibold">
                  Latest execution requires attention
                </p>


                <p className="mt-2 text-sm text-[var(--muted)]">
                  The most recent sync finished as{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {getStatusLabel(
                      latestLog.status
                    )}
                  </span>
                  {" "}with{" "}
                  {latestLog.failed} failed item
                  {latestLog.failed ===
                  1
                    ? ""
                    : "s"}.
                </p>

              </div>


              <Link
                href={`/admin/provider-sync/${latestLog.id}`}
                className="admin-secondary"
              >
                Review run
              </Link>

            </div>

          </section>
        )}


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Automatic sync
            </p>


            <p className="mt-3 text-2xl font-semibold">
              {enabled
                ? "Enabled"
                : "Disabled"}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Application automation state
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Schedule
            </p>


            <p className="mt-3 font-semibold">
              {getScheduleLabel(
                schedule
              )}
            </p>


            <p className="mt-2 font-mono text-xs text-[var(--muted)]">
              {schedule}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Last run
            </p>


            <p className="mt-3 text-sm font-semibold">
              {formatDate(
                job?.lastRunAt ??
                  latestLog?.finishedAt ??
                  latestLog?.startedAt ??
                  null
              )}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Latest recorded execution
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Next expected
            </p>


            <p className="mt-3 text-sm font-semibold">
              {enabled
                ? formatDate(
                    nextExpectedRun
                  )
                : "Automatic sync disabled"}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Based on saved application schedule
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Recent issues
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {recentFailures.length}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Latest {recentLogs.length} execution
              {recentLogs.length ===
              1
                ? ""
                : "s"}
            </p>

          </div>

        </section>


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Automation state
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Automatic synchronization
            </h2>


            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Disabling automatic synchronization prevents
              the protected cron endpoint from starting new
              scheduled provider-sync runs. Manual runs from
              the admin dashboard remain available.
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

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Current configuration
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Schedule summary
            </h2>


            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Frequency
                </span>


                <strong>
                  {getScheduleLabel(
                    schedule
                  )}
                </strong>

              </div>


              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Cron expression
                </span>


                <code className="text-xs">
                  {schedule}
                </code>

              </div>


              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Expected runs
                </span>


                <strong className="text-sm">
                  {selectedSchedule?.description ??
                    "Custom schedule"}
                </strong>

              </div>


              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Mode
                </span>


                <strong>
                  Automatic
                </strong>

              </div>

            </div>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Frequency
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Synchronization schedule
          </h2>


          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Choose the frequency Venuvella records for
            provider synchronization. Your deployment
            platform must use a compatible cron frequency.
          </p>


          <form
            action={
              updateProviderSyncScheduleAction
            }
            className="mt-6 max-w-2xl"
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
              className="admin-input mt-3 w-full"
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
                    {option.label}
                  </option>

                )
              )}

            </select>


            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {SCHEDULE_OPTIONS.map(
                (option) => {
                  const active =
                    option.value ===
                    schedule;


                  return (
                    <div
                      key={
                        option.value
                      }
                      className={
                        active
                          ? "rounded-xl border border-[var(--ink)] bg-[var(--paper)] p-4"
                          : "rounded-xl border border-[var(--line)] p-4"
                      }
                    >

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-sm font-semibold">
                          {option.label}
                        </p>


                        {active && (
                          <span className="rounded-full bg-[var(--ink)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                            Current
                          </span>
                        )}

                      </div>


                      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                        {option.description}
                      </p>


                      <code className="mt-3 block text-[10px] text-[var(--muted)]">
                        {option.value}
                      </code>

                    </div>
                  );
                }
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


        <section className="mt-8 rounded-2xl border border-blue-300 bg-blue-50 p-6">

          <p className="admin-eyebrow">
            Deployment requirement
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Application schedule vs external scheduler
          </h2>


          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            This setting stores Venuvella&apos;s desired
            synchronization frequency. It does not create
            or modify your hosting provider&apos;s cron
            configuration. The hosting platform must still
            call the protected endpoint at the intended
            frequency.
          </p>


          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="rounded-xl border border-blue-200 bg-white p-5">

              <p className="admin-eyebrow">
                Endpoint
              </p>


              <p className="mt-3 break-all font-mono text-sm">
                /api/cron/provider-sync
              </p>

            </div>


            <div className="rounded-xl border border-blue-200 bg-white p-5">

              <p className="admin-eyebrow">
                Authorization
              </p>


              <p className="mt-3 font-mono text-sm">
                Bearer CRON_SECRET
              </p>


              <p className="mt-2 text-xs text-[var(--muted)]">
                Never expose the secret in browser code
                or public configuration.
              </p>

            </div>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Latest execution
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Most recent sync
              </h2>

            </div>


            {latestLog && (
              <Link
                href={`/admin/provider-sync/${latestLog.id}`}
                className="admin-secondary"
              >
                View run
              </Link>
            )}

          </div>


          {latestLog ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <div>

                <p className="admin-eyebrow">
                  Status
                </p>


                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                    latestLog.status
                  )}`}
                >
                  {getStatusLabel(
                    latestLog.status
                  )}
                </span>

              </div>


              <div>

                <p className="admin-eyebrow">
                  Started
                </p>


                <p className="mt-3 text-sm font-semibold">
                  {formatDate(
                    latestLog.startedAt
                  )}
                </p>

              </div>


              <div>

                <p className="admin-eyebrow">
                  Duration
                </p>


                <p className="mt-3 text-sm font-semibold">
                  {getDurationLabel(
                    latestLog.startedAt,
                    latestLog.finishedAt
                  )}
                </p>

              </div>


              <div>

                <p className="admin-eyebrow">
                  Processed
                </p>


                <p className="mt-3 text-xl font-semibold">
                  {latestLog.processed}
                </p>

              </div>


              <div>

                <p className="admin-eyebrow">
                  Failed
                </p>


                <p className="mt-3 text-xl font-semibold">
                  {latestLog.failed}
                </p>

              </div>

            </div>
          ) : (
            <p className="mt-6 text-sm text-[var(--muted)]">
              No provider sync has run yet.
            </p>
          )}

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Automation history
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Recent executions
              </h2>

            </div>


            <p className="text-xs text-[var(--muted)]">
              Latest {recentLogs.length} runs
            </p>

          </div>


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

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                            log.status
                          )}`}
                        >
                          {getStatusLabel(
                            log.status
                          )}
                        </span>


                        <span className="text-xs text-[var(--muted)]">
                          {formatDate(
                            log.startedAt
                          )}
                        </span>

                      </div>


                      <p className="mt-2 text-xs text-[var(--muted)]">
                        {log.processed} processed
                        {" · "}
                        {log.failed} failed
                        {" · "}
                        {getDurationLabel(
                          log.startedAt,
                          log.finishedAt
                        )}
                      </p>


                      {log.error && (
                        <p className="mt-2 max-w-3xl text-xs leading-5 text-rose-700">
                          {log.error}
                        </p>
                      )}

                    </div>


                    <Link
                      href={`/admin/provider-sync/${log.id}`}
                      className="admin-link"
                    >
                      Details →
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
