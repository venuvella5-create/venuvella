import Link from "next/link";
import { Logo } from "./Logo";

const links = ["About", "Contact", "Beauty", "Home", "Fitness", "Style", "Seasonal", "Guides", "Deals", "Privacy Policy", "Terms", "Affiliate Disclosure", "Cookie Policy", "Advertising Disclosure"];

export function Footer() {
  return <footer className="mt-20 border-t border-[var(--line)] bg-[#efeee9]">
    <div className="container-shell grid gap-12 py-14 md:grid-cols-[1.3fr_2fr]">
      <div><Logo /><p className="mt-4 max-w-xs text-sm leading-6 text-[var(--muted)]">Discover what’s worth having.</p></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">{links.map((link) => <Link key={link} href="#" className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">{link}</Link>)}</div>
    </div>
    <div className="border-t border-[var(--line)]"><div className="container-shell flex flex-col gap-2 py-5 text-[11px] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Venuvella. All rights reserved.</span><span>Beauty · Home · Fitness · Style</span></div></div>
  </footer>;
}
