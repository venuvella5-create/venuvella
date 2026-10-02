import Link from "next/link";

import {
  requireAdminSession,
} from "@/lib/auth/require-admin";


export const dynamic =
  "force-dynamic";


export default async function ForbiddenPage() {
  const session =
    await requireAdminSession();


  return (
    <main className="min-h-screen bg-[#efeee9] py-16">

      <div className="container-shell">

        <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--line)] bg-white p-8 md:p-12">

          <p className="admin-eyebrow">
            Access control
          </p>


          <h1 className="display-serif mt-3 text-5xl">
            Access denied
          </h1>


          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            Your account does not have
            permission to access this section
            of the Venuvella administration
            workspace.
          </p>


          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Signed in as
            </p>


            <p className="mt-2 font-medium">
              {session.email}
            </p>


            <p className="mt-1 text-sm text-[var(--muted)]">
              Role: {session.role}
            </p>

          </div>


          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              href="/admin"
              className="admin-primary"
            >
              Back to dashboard
            </Link>


            <Link
              href="/"
              className="admin-secondary"
            >
              Visit Venuvella
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}