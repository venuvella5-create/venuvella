import Link from "next/link";

import { getProducts } from "@/lib/products/queries";
import { getCategories } from "@/lib/categories/queries";
import { getBrands } from "@/lib/brands/queries";

import { ProductCard } from "@/components/editorial/ProductCard";
import { SearchBar } from "@/components/products/SearchBar";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { BrandFilter } from "@/components/products/BrandFilter";
import { ActiveFilters } from "@/components/products/ActiveFilters";


export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    q?: string;
  }>;
}) {

  const params = await searchParams;


  const products = await getProducts({
    categorySlug: params.category,
    brandSlug: params.brand,
    search: params.q,
  });


  const categories = await getCategories();

  const brands = await getBrands();


  const activeCategory = categories.find(
    (category) => category.slug === params.category
  );

  const activeBrand = brands.find(
    (brand) => brand.slug === params.brand
  );


  const productCount = products.length;


  return (

    <main className="mx-auto max-w-7xl px-6 py-16">


      {/* Page introduction */}

      <section className="mb-10 max-w-3xl">

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Shop the edit
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Discover products worth having.
        </h1>

        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          A considered collection of products selected by Venuvella.
        </p>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Showing {productCount} product
          {productCount !== 1 && "s"}
        </p>

      </section>


      {/* Search */}

      <SearchBar />


      {/* Category filters */}

      <CategoryFilter
        categories={categories}
      />


      {/* Brand filters */}

      <BrandFilter
        brands={brands}
      />


      {/* Active filters */}

      <ActiveFilters
        categoryName={activeCategory?.name}
        brandName={activeBrand?.name}
      />


      {/* Products / empty state */}

      {products.length > 0 ? (

        <section
          className="
            grid
            grid-cols-1
            gap-x-8
            gap-y-14
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >

          {products.map((product) => (

            <ProductCard
              key={product.id}
              brand={product.brand?.name ?? "Venuvella"}
              name={product.name}
              summary={product.editorialSummary ?? ""}
              image={
                product.images[0]?.url ??
                "/placeholder.png"
              }
              slug={product.slug}
            />

          ))}

        </section>

      ) : (

        <section className="border-t border-[var(--border)] py-20 text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            No matches
          </p>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            No products found.
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--muted)]">
            We couldn&apos;t find any products matching your current search or
            filters. Try another search or clear your selections.
          </p>

          <Link
            href="/products"
            className="
              mt-8
              inline-flex
              border
              border-[var(--ink)]
              px-6
              py-3
              text-xs
              font-semibold
              uppercase
              tracking-[0.14em]
            "
          >
            Clear filters
          </Link>

        </section>

      )}


    </main>

  );

}