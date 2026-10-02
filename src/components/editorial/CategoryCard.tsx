import Image from "next/image";
import Link from "next/link";

export function CategoryCard({ title, description, image, subcategories }: { title: string; description: string; image: string; subcategories: string[] }) {
  return <Link href={`/${title.toLowerCase()}`} className="group block"><div className="relative aspect-[4/5] overflow-hidden bg-[var(--warm)]"><Image src={image} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="text-[10px] uppercase tracking-[0.16em] opacity-80">Explore</p><h3 className="display-serif mt-1 text-2xl">{title}</h3><p className="mt-1 text-xs leading-5 text-white/85">{description}</p><p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-white/75">{subcategories.join(" · ")}</p></div></div></Link>;
}
