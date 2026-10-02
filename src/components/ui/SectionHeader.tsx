import Link from "next/link";

export function SectionHeader({ eyebrow, title, href, linkLabel = "View all" }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return <div className="mb-7 flex items-end justify-between gap-5"><div>{eyebrow && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>}<h2 className="display-serif text-3xl tracking-[-0.02em] sm:text-4xl">{title}</h2></div>{href && <Link href={href} className="shrink-0 border-b border-[var(--ink)] pb-1 text-[11px] font-semibold uppercase tracking-[0.12em]">{linkLabel}</Link>}</div>;
}
