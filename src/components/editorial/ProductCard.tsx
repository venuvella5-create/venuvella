import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


export function ProductCard({
  brand,
  name,
  summary,
  image,
  slug,
}: {
  brand: string;
  name: string;
  summary: string;
  image: string;
  slug: string;
}) {

  return (

    <article className="group">

      <Link href={`/products/${slug}`}>

        <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">

          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.03]
            "
          />

        </div>


        <div className="pt-5">

          <p className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-[var(--accent)]
          ">
            {brand}
          </p>


          <h3 className="
            mt-2
            text-[17px]
            font-medium
            leading-snug
            tracking-tight
            transition-opacity
            group-hover:opacity-70
          ">
            {name}
          </h3>


          {summary && (

            <p className="
              mt-3
              line-clamp-2
              text-sm
              leading-6
              text-[var(--muted)]
            ">
              {summary}
            </p>

          )}


          <span className="
            mt-5
            inline-flex
            items-center
            gap-2
            border-b
            border-[var(--ink)]
            pb-1
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.15em]
          ">
            Explore product
            <ArrowRight
              aria-hidden="true"
              size={11}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>

        </div>

      </Link>

    </article>

  );

}