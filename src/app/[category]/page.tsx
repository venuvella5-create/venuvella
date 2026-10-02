import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { prisma } from "@/lib/db/prisma";
import { getArticlesByCategory } from "@/lib/content/articles";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  if (!process.env.DATABASE_URL) notFound();
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const articles = await getArticlesByCategory(slug);
  return <main className="container-shell py-14 sm:py-20"><div className="max-w-3xl"><p className="admin-eyebrow">Venuvella / {category.name}</p><h1 className="display-serif mt-3 text-6xl tracking-[-.04em]">{category.name}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">{category.description}</p></div><div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2">{articles.map((article, index) => <ArticleCard key={article.id} article={{ category: category.name, title: article.title, excerpt: article.excerpt ?? "", image: article.featuredImage ?? "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85", slug: article.slug, readingTime: "6 min" }} featured={index === 0} />)}</div>{articles.length === 0 && <div className="mt-10 border-t border-[var(--line)] py-10">No published stories in this category yet.</div>}<Link href="/articles" className="mt-10 inline-flex admin-primary">All articles</Link></main>;
}
