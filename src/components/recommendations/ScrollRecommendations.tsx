"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = {
  type: "product" | "article";
  title: string;
  href: string;
  image: string | null;
  label: string;
  blurb: string | null;
};

const HIDDEN_PREFIXES = [
  "/admin",
  "/go",
  "/privacy",
  "/terms",
  "/cookies",
  "/contact",
  "/affiliate-disclosure",
  "/editorial-policy",
];

const STORAGE_KEY = "venuvella-recs-dismissed";

/**
 * A small card that slides in after the visitor has scrolled part-way down
 * a page, suggesting a product to shop and an article to read.
 */
export function ScrollRecommendations() {
  const pathname = usePathname();
  // Recommendations are stored together with the page they were loaded for,
  // so they are ignored automatically after the visitor navigates elsewhere.
  const [loaded, setLoaded] = useState<{
    path: string;
    items: Item[];
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        return;
      }
    } catch {
      // storage unavailable: carry on
    }

    let cancelled = false;
    let requested = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/recommendations?path=${encodeURIComponent(pathname)}`
        );
        if (!response.ok) return;
        const data = (await response.json()) as { items?: Item[] };
        if (cancelled || !data.items || data.items.length === 0) return;
        setLoaded({ path: pathname, items: data.items });
      } catch {
        // ignore network errors
      }
    }

    function onScroll() {
      if (requested) return;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable > 0.4) {
        requested = true;
        void load();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  const items =
    loaded && loaded.path === pathname ? loaded.items : [];

  if (dismissed || items.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Recommended for you"
      className="fixed bottom-4 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--line)] bg-white p-4 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          You might like
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close recommendations"
          className="text-lg leading-none text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex gap-3 rounded-xl p-1 hover:bg-[var(--surface)]"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="h-16 w-16 flex-none rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 flex-none rounded-lg bg-[var(--surface)]" />
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {item.label}
              </p>
              <p className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--ink)]">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
