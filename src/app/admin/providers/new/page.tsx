import Link from "next/link";

import { AffiliateProviderForm } from "@/components/admin/AffiliateProviderForm";


export default function NewProviderPage() {
  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/providers"
          className="admin-link"
        >
          ← Providers
        </Link>


        <div className="mt-4">

          <p className="admin-eyebrow">
            Commerce / Providers
          </p>

          <h1 className="display-serif mt-2 text-5xl">
            Add provider
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Create an affiliate merchant or provider that
            can later be connected to Venuvella products.
          </p>

        </div>


        <section className="mt-10 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

          <AffiliateProviderForm />

        </section>

      </div>

    </main>
  );
}