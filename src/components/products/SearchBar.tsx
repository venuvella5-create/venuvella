"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";


export function SearchBar() {

  const router = useRouter();

  const searchParams = useSearchParams();


  const currentSearch = searchParams.get("q") ?? "";


  const [value, setValue] = useState(currentSearch);



  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    const params = new URLSearchParams(
      searchParams.toString()
    );


    if (value.trim()) {

      params.set(
        "q",
        value.trim()
      );

    } else {

      params.delete("q");

    }


    router.push(
      `/products?${params.toString()}`
    );

  }



  return (

    <form
      onSubmit={handleSubmit}
      className="mb-10 flex max-w-xl gap-3"
    >

      <input

        value={value}

        onChange={(e) =>
          setValue(e.target.value)
        }

        placeholder="Search products..."

        className="
          flex-1
          rounded-xl
          border
          px-4
          py-3
          text-sm
          outline-none
        "

      />


      <button

        type="submit"

        className="
          rounded-xl
          bg-black
          px-5
          py-3
          text-sm
          text-white
        "

      >

        Search

      </button>


    </form>

  );

}