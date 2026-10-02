"use client";

import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

const links = ["Beauty", "Home", "Fitness", "Style", "Seasonal", "Guides", "Deals"];

export function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="container-shell flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Venuvella home"><Logo /></Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {links.map((link) => <Link key={link} href={`/${link.toLowerCase()}`} className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--muted)] transition hover:text-[var(--ink)]">{link}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/search" aria-label="Search" className="grid size-10 place-items-center rounded-full hover:bg-[var(--warm)]"><Search size={18} strokeWidth={1.6} /></Link>
          <Link href="#newsletter" className="hidden rounded-full border border-[var(--ink)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] sm:inline-flex">Newsletter</Link>
          <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-full hover:bg-[var(--warm)] lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && <div className="border-t border-[var(--line)] bg-[var(--paper)] lg:hidden"><nav className="container-shell grid py-5" aria-label="Mobile navigation">{links.map((link) => <Link onClick={() => setOpen(false)} key={link} href={`/${link.toLowerCase()}`} className="border-b border-[var(--line)] py-4 text-sm font-medium uppercase tracking-[0.1em] last:border-b-0">{link}</Link>)}<Link onClick={() => setOpen(false)} href="#newsletter" className="mt-4 inline-flex w-fit rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white">Get the Edit</Link></nav></div>}
    </header>
  </>;
}
