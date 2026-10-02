"use client";

import { useRouter, useSearchParams } from "next/navigation";


type Brand = {
  id: string;
  name: string;
  slug: string;
};


export function BrandFilter({
  brands,
}: {
  brands: Brand[];
}) {

  const router = useRouter();

  const searchParams = useSearchParams();


  const activeBrand =
    searchParams.get("brand");



  function selectBrand(slug?: string) {

    const params = new URLSearchParams(
      searchParams.toString()
    );


    if (slug) {

      params.set(
        "brand",
        slug
      );

    } else {

      params.delete("brand");

    }


    router.push(
      `/products?${params.toString()}`
    );

  }



  return (

    <div className="mb-10 flex flex-wrap gap-3">


      <button

        onClick={() => selectBrand()}

        className={`
          rounded-full border px-5 py-2 text-sm
          ${
            !activeBrand
              ? "bg-black text-white"
              : ""
          }
        `}

      >
        All Brands

      </button>



      {brands.map((brand) => (

        <button

          key={brand.id}

          onClick={() =>
            selectBrand(brand.slug)
          }

          className={`
            rounded-full border px-5 py-2 text-sm
            ${
              activeBrand === brand.slug
                ? "bg-black text-white"
                : ""
            }
          `}

        >

          {brand.name}

        </button>

      ))}


    </div>

  );

}