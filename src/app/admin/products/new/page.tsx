import Link from "next/link";

import { requirePageRole } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

import { createProduct } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePageRole(["ADMIN", "EDITOR"]);

  const { error } = await searchParams;

  const [categories, brands, providers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.affiliateProvider.findMany({
      where: { status: { not: "INACTIVE" } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#efeee9] py-10">
      <div className="container-shell">
        <header className="flex items-center justify-between">
          <div>
            <p className="admin-eyebrow">Commerce / Products</p>
            <h1 className="display-serif mt-2 text-5xl">Add a product</h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
              Fill in the basics and press the button. The product goes live
              straight away and can be used in articles.
            </p>
          </div>

          <Link href="/admin/products" className="admin-secondary">
            Back
          </Link>
        </header>

        {error && <p className="admin-error mt-6">{error}</p>}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">
          <form action={createProduct} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Product name *
              </label>
              <input name="name" required className="admin-input w-full" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category *
                </label>
                <select
                  name="categoryId"
                  required
                  className="admin-input w-full"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Brand</label>
                <select name="brandId" className="admin-input w-full">
                  <option value="">No brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Short summary (shown on cards)
              </label>
              <textarea
                name="editorialSummary"
                rows={3}
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Full description
              </label>
              <textarea
                name="description"
                rows={5}
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Image URL
              </label>
              <input
                name="imageUrl"
                type="url"
                placeholder="https://…/photo.jpg"
                className="admin-input w-full"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Paste a direct link to the product image.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Where to buy</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Add up to 4 stores. The first row is the main &ldquo;Buy&rdquo;
                button; the others appear as extra retailer options. Leave rows
                empty if you don&rsquo;t need them.
              </p>

              <div className="mt-4 space-y-4">
                {[1, 2, 3, 4].map((row) => (
                  <div
                    key={row}
                    className="grid gap-3 rounded-xl border border-[var(--line)] p-4 md:grid-cols-[180px_1fr_120px]"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Store {row}
                      </label>
                      <select
                        name={`providerId_${row}`}
                        className="admin-input w-full"
                      >
                        <option value="">Other / direct link</option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Your affiliate link
                      </label>
                      <input
                        name={`buyUrl_${row}`}
                        type="url"
                        placeholder="https://…"
                        className="admin-input w-full"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Price (USD)
                      </label>
                      <input
                        name={`price_${row}`}
                        inputMode="decimal"
                        placeholder="29.99"
                        className="admin-input w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                URL slug
              </label>
              <input
                name="slug"
                className="admin-input w-full"
                placeholder="leave blank to auto-generate"
              />
            </div>

            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="publishNow"
                defaultChecked
                className="h-4 w-4"
              />
              Publish immediately
            </label>

            <div className="flex gap-3">
              <button type="submit" className="admin-primary">
                Create product
              </button>
              <Link href="/admin/products" className="admin-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
