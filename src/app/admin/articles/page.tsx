import Link from "next/link";
import { getAdminArticles } from "@/lib/content/articles";

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();
  return <main className="min-h-screen bg-[#efeee9] py-10"><div className="container-shell"><div className="flex items-end justify-between gap-4"><div><p className="admin-eyebrow">Content</p><h1 className="display-serif text-5xl">Articles</h1></div><Link href="/admin/articles/new" className="admin-primary">New article</Link></div><div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white"><div className="grid grid-cols-[1fr_150px_150px] border-b border-[var(--line)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]"><span>Article</span><span>Status</span><span>Category</span></div>{articles.map((article) => <Link key={article.id} href={`/admin/articles/${article.id}`} className="grid grid-cols-[1fr_150px_150px] items-center border-b border-[var(--line)] px-5 py-5 last:border-0 hover:bg-[var(--paper)]"><span><span className="block font-medium">{article.title}</span><span className="text-xs text-[var(--muted)]">{article.author.name}</span></span><span className="text-xs">{article.status}</span><span className="text-xs">{article.category.name}</span></Link>)}</div></div></main>;
}
