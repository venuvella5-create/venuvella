import {
  Suspense,
} from "react";

import {
  AdminNavigation,
} from "@/components/admin/AdminNavigation";

import {
  AnalyticsExportButton,
} from "@/components/admin/AnalyticsExportButton";


export default function AdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <>
      <AdminNavigation />

      <Suspense fallback={null}>
        <AnalyticsExportButton />
      </Suspense>

      {children}
    </>
  );
}