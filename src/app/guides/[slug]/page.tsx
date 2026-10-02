import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await prisma.buyingGuide.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true, blocks: { orderBy: { position: "asc" } }, faqs: { orderBy: { position: "asc" } } } });
  if (!guide) notFound();
  return <main className="container-shell py-14 sm:py-20"><article className="mx-auto max-w-4xl"><p className="admin-eyebrow">Buying Guide / {guide.category.name}</p><h1 className="display-serif mt-3 max-w-3xl text-5xl leading-[.98] sm:text-7xl">{guide.title}</h1><p className="mt-6 max-w-2xl text-lg leading-7 text-[var(--muted)]">{guide.introduction ?? guide.excerpt}</p><div className="prose-venuvella mt-10 max-w-3xl">{guide.blocks.map((block) => { const data = block.data as { text?: string }; return block.type === "HEADING" ? <h2 key={block.id}>{data.text}</h2> : <p key={block.id}>{data.text}</p>; })}</div></article></main>;
}
