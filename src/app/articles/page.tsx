import Link from "next/link";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { getPublishedArticles } from "@/lib/content/articles";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getPublishedArticles(24);
  return <main className="container-shell py-14 sm:py-20"><div className="max-w-3xl"><p className="admin-eyebrow">The Venuvella Edit</p><h1 className="display-serif mt-3 text-6xl tracking-[-.04em]">Ideas worth making room for.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">Original editorial stories, practical inspiration and considered product discovery across beauty, home, fitness and style.</p></div><div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2">{articles.map((article, index) => <ArticleCard key={article.id} article={{ category: article.category.name, title: article.title, excerpt: article.excerpt ?? "", image: article.featuredImage ?? "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85", slug: article.slug, readingTime: "6 min" }} featured={index === 0} />)}</div>{articles.length === 0 && <div className="mt-10 border-t border-[var(--line)] py-10"><p>No published articles yet. Use the admin to create the first story.</p><Link href="/admin/articles/new" className="mt-5 inline-flex admin-primary">Create article</Link></div>}</main>;
}
