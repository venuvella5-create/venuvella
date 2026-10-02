import Image from "next/image";
import Link from "next/link";

type Article = { category: string; title: string; excerpt: string; image: string; slug: string; readingTime: string };

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return <article className={featured ? "group md:col-span-2" : "group"}>
    <Link href={`/articles/${article.slug}`} className="block">
      <div className={`relative overflow-hidden bg-[var(--warm)] ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <Image src={article.image} alt="" fill sizes={featured ? "(max-width: 768px) 100vw, 70vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="pt-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{article.category}</p><h3 className={`mt-2 font-medium leading-tight ${featured ? "display-serif text-3xl sm:text-4xl" : "text-xl"}`}>{article.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{article.excerpt}</p><p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{article.readingTime} read</p></div>
    </Link>
  </article>;
}
