"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AdminRole =
  | "ADMIN"
  | "EDITOR"
  | "AUTHOR"
  | "ANALYST";

type SessionResponse = {
  authenticated: boolean;
  email?: string;
  role?: AdminRole;
  mustChangePassword?: boolean;
};

type NavigationItem = {
  label: string;
  href: string;
  roles: AdminRole[];
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/admin", roles: ["ADMIN", "EDITOR", "AUTHOR", "ANALYST"] },
  { label: "Articles", href: "/admin/articles", roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { label: "Products", href: "/admin/products", roles: ["ADMIN", "EDITOR"] },
  { label: "Analytics", href: "/admin/analytics", roles: ["ADMIN", "ANALYST"] },
  { label: "Staff", href: "/admin/staff", roles: ["ADMIN"] },
  { label: "Authors", href: "/admin/authors", roles: ["ADMIN"] },
  { label: "Providers", href: "/admin/providers", roles: ["ADMIN"] },
  { label: "Provider sync", href: "/admin/provider-sync", roles: ["ADMIN"] },
  { label: "Scheduler", href: "/admin/provider-sync/scheduler", roles: ["ADMIN"] },
  { label: "Affiliate ops", href: "/admin/affiliate-ops", roles: ["ADMIN"] },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation() {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionResponse | null>(null);

  const isPublicAdminPath =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/change-password" ||
    pathname.startsWith("/admin/change-password/");

  useEffect(() => {
    if (isPublicAdminPath) {
      return;
    }

    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          if (!cancelled) {
            setSession({ authenticated: false });
          }
          return;
        }

        const data = (await response.json()) as SessionResponse;

        if (!cancelled) {
          setSession(data);
        }
      } catch {
        if (!cancelled) {
          setSession({ authenticated: false });
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [isPublicAdminPath, pathname]);

  if (isPublicAdminPath) {
    return null;
  }

  if (!session || !session.authenticated || !session.role || session.mustChangePassword) {
    return null;
  }

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(session.role as AdminRole)
  );

  return (
    <nav className="border-b border-[var(--line)] bg-white">
      <div className="container-shell">
        <div className="flex min-h-16 items-center gap-5">
          <Link href="/admin" className="shrink-0">
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">
              Venuvella
            </span>
            <span className="ml-2 text-xs text-[var(--muted)]">Admin</span>
          </Link>

          <div className="h-6 w-px shrink-0 bg-[var(--line)]" />

          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-3">
            {visibleItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "shrink-0 rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white"
                      : "shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden shrink-0 text-right lg:block">
            <p className="max-w-48 truncate text-xs font-medium">{session.email}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {session.role}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
