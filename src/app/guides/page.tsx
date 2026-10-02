import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const guides = await prisma.buyingGuide.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, include: { category: true } });
  return <main className="container-shell py-14 sm:py-20"><p className="admin-eyebrow">Buying Guides</p><h1 className="display-serif mt-3 text-6xl tracking-[-.04em]">Helpful before you buy.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">Practical criteria, comparisons and product context designed to make decisions clearer.</p><div className="mt-12 grid gap-5 md:grid-cols-3">{guides.map((guide) => <Link key={guide.id} href={`/guides/${guide.slug}`} className="border-t border-[var(--line)] pt-4 hover:opacity-70"><p className="admin-eyebrow">{guide.category.name}</p><h2 className="display-serif mt-2 text-3xl leading-tight">{guide.title}</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{guide.excerpt}</p></Link>)}</div>{guides.length === 0 && <div className="mt-10 border-t border-[var(--line)] py-10">No published guides yet. The guide model is ready for Phase 2 content entry.</div>}</main>;
}
