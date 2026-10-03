"use client";

import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

export function AnalyticsExportButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname !== "/admin/analytics") {
    return null;
  }

  const requestedRange =
    searchParams.get("range");

  const allowedRanges = [
    "today",
    "7d",
    "30d",
    "all",
  ];

  const range =
    requestedRange &&
    allowedRanges.includes(requestedRange)
      ? requestedRange
      : "30d";

  return (
    <div className="border-b border-[var(--line)] bg-[#f7f6f2]">
      <div className="container-shell flex items-center justify-end py-3">
        <Link
          href={`/admin/analytics/export?range=${range}`}
          className="admin-secondary"
          prefetch={false}
        >
          Export CSV
        </Link>
      </div>
    </div>
  );
}