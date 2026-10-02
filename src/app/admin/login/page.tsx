import Link from "next/link";

import {
  AdminLoginForm,
} from "./LoginForm";


type LoginSearchParams = {
  next?: string;
};


export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const resolvedSearchParams =
    await searchParams;


  const next =
    resolvedSearchParams.next ??
    "/admin";


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#efeee9] px-5 py-12">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <Link
            href="/"
            className="display-serif text-3xl"
          >
            Venuvella
          </Link>


          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Administration
          </p>

        </div>


        <section className="rounded-2xl border border-[var(--line)] bg-white p-7 shadow-sm sm:p-9">

          <p className="admin-eyebrow">
            Secure access
          </p>


          <h1 className="display-serif mt-2 text-4xl">
            Admin sign in
          </h1>


          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            Sign in to manage Venuvella
            content, products, affiliate
            providers and operational tools.
          </p>


          <AdminLoginForm
            nextPath={next}
          />

        </section>


        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Authorized Venuvella personnel only.
        </p>

      </div>

    </main>
  );
}