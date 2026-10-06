import Link from "next/link";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  createProduct,
} from "./actions";

export const dynamic =
  "force-dynamic";

export default async function NewProductPage() {
  await requirePageRole([
    "ADMIN",
    "EDITOR",
  ]);

  const [
    categories,
    brands,
  ] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#efeee9] py-10">
      <div className="container-shell">
        <header className="flex items-center justify-between">

          <div>
            <p className="admin-eyebrow">
              Commerce / Products
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Create product
            </h1>
          </div>

          <Link
            href="/admin/products"
            className="admin-secondary"
          >
            Back
          </Link>

        </header>

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <form
            action={createProduct}
            className="space-y-6"
          >

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Name
              </label>

              <input
                name="name"
                required
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Slug
              </label>

              <input
                name="slug"
                className="admin-input w-full"
                placeholder="leave blank to auto-generate"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                name="categoryId"
                required
                className="admin-input w-full"
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Brand
              </label>

              <select
                name="brandId"
                className="admin-input w-full"
              >
                <option value="">
                  No brand
                </option>

                {brands.map(
                  (brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                rows={6}
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Editorial Summary
              </label>

              <textarea
                name="editorialSummary"
                rows={5}
                className="admin-input w-full"
              />
            </div>

            <div className="flex gap-3">

              <button
                type="submit"
                className="admin-primary"
              >
                Create Product
              </button>

              <Link
                href="/admin/products"
                className="admin-secondary"
              >
                Cancel
              </Link>

            </div>

          </form>

        </section>
      </div>
    </main>
  );
}