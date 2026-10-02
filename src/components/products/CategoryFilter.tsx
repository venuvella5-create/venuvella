"use client";

import { useRouter, useSearchParams } from "next/navigation";


type Category = {
  id: string;
  name: string;
  slug: string;
};


export function CategoryFilter({
  categories,
}: {
  categories: Category[];
}) {

  const router = useRouter();

  const searchParams = useSearchParams();


  const activeCategory =
    searchParams.get("category");



  function selectCategory(slug?: string) {

    const params = new URLSearchParams(
      searchParams.toString()
    );


    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }


    router.push(
      `/products?${params.toString()}`
    );

  }



  return (

    <div className="mb-10 flex flex-wrap gap-3">


      <button

        onClick={() => selectCategory()}

        className={`
          rounded-full border px-5 py-2 text-sm
          ${
            !activeCategory
              ? "bg-black text-white"
              : ""
          }
        `}

      >
        All
      </button>



      {categories.map((category) => (

        <button

          key={category.id}

          onClick={() =>
            selectCategory(category.slug)
          }

          className={`
            rounded-full border px-5 py-2 text-sm
            ${
              activeCategory === category.slug
                ? "bg-black text-white"
                : ""
            }
          `}

        >

          {category.name}

        </button>

      ))}


    </div>

  );

}