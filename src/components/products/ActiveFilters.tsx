"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";


type FilterOption = {
  label: string;
  param: "q" | "category" | "brand";
};


export function ActiveFilters({
  categoryName,
  brandName,
}: {
  categoryName?: string;
  brandName?: string;
}) {

  const searchParams = useSearchParams();

  const search = searchParams.get("q");
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");


  const filters: FilterOption[] = [];

  if (search) {
    filters.push({
      label: `Search: ${search}`,
      param: "q",
    });
  }

  if (category && categoryName) {
    filters.push({
      label: categoryName,
      param: "category",
    });
  }

  if (brand && brandName) {
    filters.push({
      label: brandName,
      param: "brand",
    });
  }


  if (filters.length === 0) {
    return null;
  }


  function hrefWithout(param: FilterOption["param"]) {

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.delete(param);

    const query = params.toString();

    return query
      ? `/products?${query}`
      : "/products";
  }


  return (

    <div className="mb-10 border-t border-[var(--border)] pt-6">

      <div className="flex flex-wrap items-center gap-3">

        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Active filters
        </span>


        {filters.map((filter) => (

          <Link
            key={filter.param}
            href={hrefWithout(filter.param)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[var(--border)]
              px-4
              py-2
              text-sm
              transition
              hover:border-[var(--ink)]
            "
          >

            {filter.label}

            <span aria-hidden="true">
              ×
            </span>

          </Link>

        ))}


        <Link
          href="/products"
          className="ml-1 text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4"
        >
          Clear all
        </Link>

      </div>

    </div>

  );

}