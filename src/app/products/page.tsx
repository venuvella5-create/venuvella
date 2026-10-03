import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  getProducts,
} from "@/lib/products/queries";

import {
  getCategories,
} from "@/lib/categories/queries";

import {
  getBrands,
} from "@/lib/brands/queries";

import {
  ProductCard,
} from "@/components/editorial/ProductCard";

import {
  SearchBar,
} from "@/components/products/SearchBar";

import {
  CategoryFilter,
} from "@/components/products/CategoryFilter";

import {
  BrandFilter,
} from "@/components/products/BrandFilter";

import {
  ActiveFilters,
} from "@/components/products/ActiveFilters";


export const metadata: Metadata = {
  title:
    "Products",

  description:
    "Browse Venuvella's curated product edit across beauty, home, fitness, style and more.",
};


type SortOption =
  | "editorial"
  | "az"
  | "za";


type ProductSearchParams = {
  category?:
    string;

  brand?:
    string;

  q?:
    string;

  sort?:
    string;
};


function buildProductsUrl({
  category,
  brand,
  q,
  sort,
}: ProductSearchParams) {
  const params =
    new URLSearchParams();


  if (
    category
  ) {
    params.set(
      "category",
      category
    );
  }


  if (
    brand
  ) {
    params.set(
      "brand",
      brand
    );
  }


  if (
    q
  ) {
    params.set(
      "q",
      q
    );
  }


  if (
    sort &&
    sort !==
      "editorial"
  ) {
    params.set(
      "sort",
      sort
    );
  }


  const query =
    params.toString();


  return query
    ? `/products?${query}`
    : "/products";
}


export default async function ProductsPage({
  searchParams,
}: {
  searchParams:
    Promise<ProductSearchParams>;
}) {
  const params =
    await searchParams;


  const sort: SortOption =
    params.sort ===
      "az" ||
    params.sort ===
      "za"
      ? params.sort
      : "editorial";


  const [
    products,
    categories,
    brands,
  ] =
    await Promise.all([
      getProducts({
        categorySlug:
          params.category,

        brandSlug:
          params.brand,

        search:
          params.q,
      }),

      getCategories(),

      getBrands(),
    ]);


  const activeCategory =
    categories.find(
      (
        category
      ) =>
        category.slug ===
        params.category
    );


  const activeBrand =
    brands.find(
      (
        brand
      ) =>
        brand.slug ===
        params.brand
    );


  const sortedProducts =
    [
      ...products,
    ];


  if (
    sort ===
    "az"
  ) {
    sortedProducts.sort(
      (
        left,
        right
      ) =>
        left.name.localeCompare(
          right.name
        )
    );
  }


  if (
    sort ===
    "za"
  ) {
    sortedProducts.sort(
      (
        left,
        right
      ) =>
        right.name.localeCompare(
          left.name
        )
    );
  }


  const productCount =
    sortedProducts.length;


  const hasFilters =
    Boolean(
      params.category ||
      params.brand ||
      params.q
    );


  const sortOptions: Array<{
    value:
      SortOption;

    label:
      string;
  }> = [
    {
      value:
        "editorial",

      label:
        "Editorial order",
    },

    {
      value:
        "az",

      label:
        "A–Z",
    },

    {
      value:
        "za",

      label:
        "Z–A",
    },
  ];


  return (
    <main className="pb-20 sm:pb-28">

      <section className="border-b border-[var(--line)]">

        <div className="container-shell py-14 sm:py-20 lg:py-24">

          <div className="max-w-4xl">

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
              Shop the edit
            </p>


            <h1 className="display-serif mt-5 max-w-4xl text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">

              Discover products
              worth having.

            </h1>


            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">

              A considered
              collection of
              products selected
              for usefulness,
              design and everyday
              relevance.

            </p>

          </div>

        </div>

      </section>


      <section className="container-shell py-10 sm:py-12">

        <div className="grid gap-8">

          <div>

            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Search products
            </p>

            <SearchBar />

          </div>


          <div className="border-t border-[var(--line)] pt-7">

            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Categories
            </p>

            <CategoryFilter
              categories={
                categories
              }
            />

          </div>


          <div className="border-t border-[var(--line)] pt-7">

            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Brands
            </p>

            <BrandFilter
              brands={
                brands
              }
            />

          </div>


          {hasFilters && (

            <div className="border-t border-[var(--line)] pt-6">

              <ActiveFilters
                categoryName={
                  activeCategory?.name
                }
                brandName={
                  activeBrand?.name
                }
              />

            </div>

          )}

        </div>

      </section>


      <section className="border-y border-[var(--line)] bg-[#f6f4ef]">

        <div className="container-shell py-6 sm:py-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <SlidersHorizontal
                  aria-hidden="true"
                  size={
                    15
                  }
                  className="text-[var(--accent)]"
                />


                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Browse results
                </p>

              </div>


              <p className="mt-2 text-base text-[var(--muted)]">

                Showing
                {" "}
                <span className="font-semibold text-[var(--ink)]">
                  {productCount}
                </span>
                {" "}
                {productCount ===
                1
                  ? "product"
                  : "products"}

                {activeCategory && (
                  <>
                    {" "}
                    in
                    {" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {activeCategory.name}
                    </span>
                  </>
                )}

                {activeBrand && (
                  <>
                    {" "}
                    from
                    {" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {activeBrand.name}
                    </span>
                  </>
                )}

              </p>

            </div>


            <div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)] md:text-right">
                Sort by
              </p>


              <div className="flex flex-wrap gap-2">

                {sortOptions.map(
                  (
                    option
                  ) => {

                    const active =
                      sort ===
                      option.value;


                    return (

                      <Link
                        key={
                          option.value
                        }
                        href={
                          buildProductsUrl({
                            category:
                              params.category,

                            brand:
                              params.brand,

                            q:
                              params.q,

                            sort:
                              option.value,
                          })
                        }
                        aria-current={
                          active
                            ? "page"
                            : undefined
                        }
                        className={
                          active
                            ? "inline-flex min-h-[40px] items-center rounded-full bg-[var(--ink)] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                            : "inline-flex min-h-[40px] items-center rounded-full border border-[var(--line)] bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--ink)]"
                        }
                      >

                        <span
                          className={
                            active
                              ? "text-white"
                              : undefined
                          }
                        >
                          {option.label}
                        </span>

                      </Link>

                    );

                  }
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {sortedProducts.length >
        0 ? (

        <section className="container-shell py-14 sm:py-18">

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {sortedProducts.map(
              (
                product
              ) => (

                <ProductCard
                  key={
                    product.id
                  }
                  brand={
                    product.brand?.name ??
                    "Venuvella"
                  }
                  name={
                    product.name
                  }
                  summary={
                    product.editorialSummary ??
                    ""
                  }
                  image={
                    product.images[0]?.url ??
                    "/placeholder.png"
                  }
                  slug={
                    product.slug
                  }
                />

              )
            )}

          </div>

        </section>

      ) : (

        <section className="container-shell py-20 sm:py-24">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1eee7]">

              <Sparkles
                aria-hidden="true"
                size={
                  20
                }
              />

            </div>


            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              No matches
            </p>


            <h2 className="display-serif mt-3 text-4xl leading-tight sm:text-5xl">
              Nothing matched
              those filters.
            </h2>


            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">

              Try another search,
              choose a different
              category or brand,
              or reset the current
              selections.

            </p>


            <Link
              href="/products"
              className="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white"
            >

              <span className="text-white">
                Clear filters
              </span>

              <ArrowRight
                aria-hidden="true"
                size={
                  13
                }
                className="text-white"
              />

            </Link>

          </div>

        </section>

      )}

    </main>
  );
}