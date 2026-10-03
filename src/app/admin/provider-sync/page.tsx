import Link from "next/link";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

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


function getProviderStatusClasses(
  status: string
) {
  const normalized =
    status.toUpperCase();


  if (
    normalized ===
      "ACTIVE" ||
    normalized ===
      "ENABLED"
  ) {
    return "border-emerald-300 bg-emerald-50 text-emerald-800";
  }


  if (
    normalized ===
      "INACTIVE" ||
    normalized ===
      "DISABLED"
  ) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }


  return "border-[var(--line)] bg-white text-[var(--ink)]";
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


function getTimeSince(
  value:
    | Date
    | null
    | undefined
) {
  if (!value) {
    return "No completed run yet";
  }


  const milliseconds =
    Math.max(
      0,
      Date.now() -
        value.getTime()
    );


  const minutes =
    Math.floor(
      milliseconds /
        60_000
    );


  if (
    minutes <
    1
  ) {
    return "Just now";
  }


  if (
    minutes <
    60
  ) {
    return `${minutes}m ago`;
  }


  const hours =
    Math.floor(
      minutes /
        60
    );


  if (
    hours <
    24
  ) {
    return `${hours}h ago`;
  }


  const days =
    Math.floor(
      hours /
        24
    );


  return `${days}d ago`;
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

      take:
        20,
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


  const latestFinishedAt =
    latestLog?.finishedAt ??
    latestLog?.startedAt ??
    job?.lastRunAt ??
    null;


  const failedRuns =
    logs.filter(
      (log) =>
        log.status ===
          "FAILED"
    );


  const partialRuns =
    logs.filter(
      (log) =>
        log.status ===
          "COMPLETED_WITH_ERRORS"
    );


  const successfulRuns =
    logs.filter(
      (log) =>
        log.status ===
          "SUCCESS"
    );


  const runningRun =
    logs.find(
      (log) =>
        log.status ===
        "RUNNING"
    ) ??
    null;


  const recentProblemRuns =
    logs.filter(
      (log) =>
        log.status ===
          "FAILED" ||
        log.status ===
          "COMPLETED_WITH_ERRORS"
    );


  const totalMappings =
    providers.reduce(
      (
        total,
        provider
      ) =>
        total +
        provider._count
          .providerProducts,
      0
    );


  const mappedProviders =
    providers.filter(
      (provider) =>
        provider._count
          .providerProducts >
        0
    ).length;


  const adapterCoverage =
    providers.length >
    0
      ? Math.round(
          (
            providersWithAdapters.length /
            providers.length
          ) *
            100
        )
      : 0;


  const last20ProblemCount =
    failedRuns.length +
    partialRuns.length;


  const last20SuccessRate =
    logs.length >
    0
      ? Math.round(
          (
            successfulRuns.length /
            logs.length
          ) *
            100
        )
      : 0;


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


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <header className="flex flex-wrap items-end justify-between gap-6">

          <div>

            <p className="admin-eyebrow">
              Affiliate / Automation
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Provider sync
            </h1>


            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Operate and monitor provider-independent
              synchronization for merchant pricing,
              availability, provider metadata, and
              affiliate destinations.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/provider-sync/scheduler"
              className="admin-secondary"
            >
              Scheduler
            </Link>


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

          </div>

        </header>


        {runningRun && (
          <section className="mt-8 rounded-2xl border border-blue-300 bg-blue-50 p-5">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="font-semibold">
                  Provider sync currently running
                </p>


                <p className="mt-2 text-sm text-[var(--muted)]">
                  Started{" "}
                  {formatDate(
                    runningRun.startedAt
                  )}.
                  Avoid launching another run until
                  this job completes.
                </p>

              </div>


              <Link
                href={`/admin/provider-sync/${runningRun.id}`}
                className="admin-secondary"
              >
                View running job
              </Link>

            </div>

          </section>
        )}


        {latestNeedsAttention && (
          <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <div className="flex flex-wrap items-center justify-between gap-5">

              <div>

                <p className="font-semibold">
                  Latest synchronization requires attention
                </p>


                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  The latest run finished as{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {getStatusLabel(
                      latestLog.status
                    )}
                  </span>
                  {" "}with{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {latestLog.failed}
                  </span>
                  {" "}
                  failed item
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
                Review latest run
              </Link>

            </div>

          </section>
        )}


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Providers
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {providers.length}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Configured providers
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Mappings
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {totalMappings}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Provider-product mappings
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Adapter coverage
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {adapterCoverage}%
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              {providersWithAdapters.length} of{" "}
              {providers.length} providers
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Success rate
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {logs.length >
              0
                ? `${last20SuccessRate}%`
                : "—"}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Latest {logs.length} run
              {logs.length ===
              1
                ? ""
                : "s"}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Problem runs
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {last20ProblemCount}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Failed or partial
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Last activity
            </p>


            <p className="mt-3 text-sm font-semibold">
              {getTimeSince(
                latestFinishedAt
              )}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              {formatDate(
                latestFinishedAt
              )}
            </p>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-center justify-between gap-6">

            <div>

              <p className="admin-eyebrow">
                Synchronization engine
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Run provider sync
              </h2>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Run all registered provider adapters
                against connected provider-product
                mappings. Providers without adapters
                are skipped rather than populated with
                fabricated provider data.
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
                disabled={
                  Boolean(
                    runningRun
                  )
                }
              >
                {runningRun
                  ? "Sync running"
                  : latestNeedsAttention
                    ? "Retry provider sync"
                    : "Run provider sync"}
              </button>

            </form>

          </div>


          {latestLog && (
            <div className="mt-6 border-t border-[var(--line)] pt-6">

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">

                <div>

                  <p className="admin-eyebrow">
                    Latest status
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
                    Last run
                  </p>


                  <p className="mt-3 text-sm font-semibold">
                    {formatDate(
                      latestLog.finishedAt ??
                        latestLog.startedAt
                    )}
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


        <section className="mt-8 grid gap-8 xl:grid-cols-2">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>

                <p className="admin-eyebrow">
                  Automation
                </p>


                <h2 className="display-serif mt-2 text-3xl">
                  Scheduler
                </h2>

              </div>


              <Link
                href="/admin/provider-sync/scheduler"
                className="admin-secondary"
              >
                Manage scheduler
              </Link>

            </div>


            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

                <p className="admin-eyebrow">
                  Automation job
                </p>


                <p className="mt-3 font-semibold">
                  {job
                    ? "Configured"
                    : "Not configured"}
                </p>

              </div>


              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

                <p className="admin-eyebrow">
                  Last recorded run
                </p>


                <p className="mt-3 text-sm font-semibold">
                  {formatDate(
                    job?.lastRunAt ??
                      null
                  )}
                </p>

              </div>

            </div>


            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              Scheduling configuration and future run
              timing are managed from the dedicated
              scheduler page.
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-6">

            <p className="admin-eyebrow">
              Integration health
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Coverage summary
            </h2>


            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Providers with adapters
                </span>


                <strong>
                  {providersWithAdapters.length}
                </strong>

              </div>


              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Providers without adapters
                </span>


                <strong>
                  {providersWithoutAdapters.length}
                </strong>

              </div>


              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Providers with mappings
                </span>


                <strong>
                  {mappedProviders}
                </strong>

              </div>


              <div className="flex items-center justify-between gap-4">

                <span className="text-sm text-[var(--muted)]">
                  Registered adapters
                </span>


                <strong>
                  {registeredAdapters.length}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {providersWithoutAdapters.length >
          0 && (
          <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6">

            <p className="admin-eyebrow">
              Integration warning
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Providers without adapters
            </h2>


            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              These providers can hold manual affiliate
              mappings, but automated provider-controlled
              fields will be skipped until an adapter is
              registered.
            </p>


            <div className="mt-6 divide-y divide-amber-200">

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
                        {provider.name}
                      </p>


                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {provider._count.providerProducts}{" "}
                        mapping
                        {provider._count.providerProducts ===
                        1
                          ? ""
                          : "s"}
                        {" · "}
                        {provider.slug}
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

          </section>
        )}


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
                        {adapter.name}
                      </p>


                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Adapter slug:{" "}
                        {adapter.slug}
                      </p>

                    </div>


                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
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
                        {provider.name}
                      </p>


                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        <span className="text-xs text-[var(--muted)]">
                          {provider._count.providerProducts}{" "}
                          mapping
                          {provider._count.providerProducts ===
                          1
                            ? ""
                            : "s"}
                        </span>


                        <span
                          className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${getProviderStatusClasses(
                            provider.status
                          )}`}
                        >
                          {formatStatus(
                            provider.status
                          )}
                        </span>

                      </div>

                    </div>


                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                        Adapter available
                      </span>


                      <Link
                        href={`/admin/providers/${provider.id}`}
                        className="admin-secondary"
                      >
                        Settings
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>
          ) : (
            <p className="mt-6 text-sm text-[var(--muted)]">
              No configured providers currently match a
              registered adapter.
            </p>
          )}

        </section>


        {recentProblemRuns.length >
          0 && (
          <section className="mt-8 rounded-2xl border border-rose-300 bg-rose-50 p-6">

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div>

                <p className="admin-eyebrow">
                  Attention
                </p>


                <h2 className="display-serif mt-2 text-3xl">
                  Recent problem runs
                </h2>

              </div>


              <span className="text-xs text-[var(--muted)]">
                From latest 20 runs
              </span>

            </div>


            <div className="mt-6 divide-y divide-rose-200">

              {recentProblemRuns
                .slice(
                  0,
                  5
                )
                .map(
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


                        <p className="mt-2 text-sm">
                          {log.processed} processed
                          {" · "}
                          {log.failed} failed
                        </p>


                        {log.error && (
                          <p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--muted)]">
                            {log.error}
                          </p>
                        )}

                      </div>


                      <Link
                        href={`/admin/provider-sync/${log.id}`}
                        className="admin-secondary"
                      >
                        Review
                      </Link>

                    </div>

                  )
                )}

            </div>

          </section>
        )}


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
                      Status
                    </th>

                    <th className="px-3 py-3">
                      Processed
                    </th>

                    <th className="px-3 py-3">
                      Failed
                    </th>

                    <th className="px-3 py-3">
                      Duration
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

                        <td className="whitespace-nowrap px-3 py-4 text-xs">
                          {formatDate(
                            log.startedAt
                          )}
                        </td>


                        <td className="px-3 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                              log.status
                            )}`}
                          >
                            {getStatusLabel(
                              log.status
                            )}
                          </span>

                        </td>


                        <td className="px-3 py-4">
                          {log.processed}
                        </td>


                        <td className="px-3 py-4">
                          {log.failed}
                        </td>


                        <td className="whitespace-nowrap px-3 py-4 text-xs">
                          {getDurationLabel(
                            log.startedAt,
                            log.finishedAt
                          )}
                        </td>


                        <td className="max-w-sm px-3 py-4 text-xs text-[var(--muted)]">
                          {log.error ??
                            "—"}
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

              <p className="text-sm font-semibold">
                No provider synchronization jobs have run yet.
              </p>


              <p className="mt-2 text-xs text-[var(--muted)]">
                Run the provider sync above to create the first automation log.
              </p>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}


function formatStatus(
  status: string
) {
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
