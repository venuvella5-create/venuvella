"use client";

import type {
  EditorialReadiness,
} from "@/lib/content/editorial-readiness";

export function ArticleReadinessPanel({
  readiness,
  status,
}: {
  readiness: EditorialReadiness;
  status: string;
}) {
  const publishing =
    status === "PUBLISHED";

  const ready =
    readiness.blockers.length === 0;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="admin-eyebrow">
            Pre-publish review
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Editorial readiness
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Drafts can be saved at any stage.
            Publishing requires the essential
            checks below to pass.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[#efeee9] px-5 py-4 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Readiness score
          </p>

          <p className="mt-1 text-3xl font-semibold">
            {readiness.score}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Body words"
          value={readiness.wordCount}
        />
        <Metric
          label="Headings"
          value={readiness.headingCount}
        />
        <Metric
          label="Product blocks"
          value={readiness.productBlockCount}
        />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {readiness.checks.map((check) => (
          <div
            key={check.id}
            className={`rounded-xl border p-4 ${
              check.passed
                ? "border-emerald-200 bg-emerald-50"
                : check.blocking
                  ? "border-amber-300 bg-amber-50"
                  : "border-[var(--line)] bg-[#f7f6f2]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  check.passed
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-[var(--muted)]"
                }`}
              >
                {check.passed ? "✓" : "•"}
              </span>

              <div>
                <p className="text-sm font-semibold">
                  {check.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {check.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {publishing && (
        <div
          className={`mt-6 rounded-xl border p-4 ${
            ready
              ? "border-emerald-300 bg-emerald-50"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          <p className="font-semibold">
            {ready
              ? "Ready to publish"
              : "Publishing is currently blocked"}
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {ready
              ? "All essential publishing checks pass. SEO recommendations can still be improved after publishing."
              : `Complete ${readiness.blockers.length} essential ${
                  readiness.blockers.length === 1
                    ? "check"
                    : "checks"
                } before publishing.`}
          </p>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[#f7f6f2] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}
