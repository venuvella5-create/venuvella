import Link from "next/link";

import {
  logoutAdminAction,
} from "@/app/admin/login/actions";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function AdminDashboardPage() {
  const session =
    await requirePageRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
      "ANALYST",
    ]);


  const isAdmin =
    session.role ===
    "ADMIN";

  const isEditor =
    session.role ===
    "EDITOR";

  const isAuthor =
    session.role ===
    "AUTHOR";

  const isAnalyst =
    session.role ===
    "ANALYST";


  const ownAuthor =
    isAuthor
      ? await prisma.author.findUnique({
          where: {
            userId:
              session.userId,
          },

          select: {
            id: true,
            name: true,
          },
        })
      : null;


  const articleCount =
    await prisma.article.count({
      where:
        isAuthor
          ? ownAuthor
            ? {
                authorId:
                  ownAuthor.id,
              }
            : {
                id: {
                  equals:
                    "__no_article__",
                },
              }
          : undefined,
    });


  const productCount =
    isAdmin || isEditor
      ? await prisma.product.count()
      : null;


  const clickCount =
    isAdmin || isAnalyst
      ? await prisma.affiliateClick.count()
      : null;


  const providerCount =
    isAdmin
      ? await prisma.affiliateProvider.count()
      : null;


  const staffCount =
    isAdmin
      ? await prisma.user.count()
      : null;


  const recentArticles =
    await prisma.article.findMany({
      where:
        isAuthor
          ? ownAuthor
            ? {
                authorId:
                  ownAuthor.id,
              }
            : {
                id: {
                  equals:
                    "__no_article__",
                },
              }
          : undefined,

      orderBy: {
        updatedAt:
          "desc",
      },

      take: 5,

      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,

        author: {
          select: {
            name: true,
          },
        },

        category: {
          select: {
            name: true,
          },
        },
      },
    });


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-start justify-between gap-6">

          <div>

            <p className="admin-eyebrow">
              Venuvella
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Admin dashboard
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Signed in as{" "}
              <span className="font-medium text-[var(--ink)]">
                {session.email}
              </span>
              {" · "}
              {session.role}
            </p>

          </div>


          <form
            action={
              logoutAdminAction
            }
          >
            <button
              type="submit"
              className="admin-secondary"
            >
              Log out
            </button>
          </form>

        </div>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Articles
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {articleCount}
            </p>

          </div>


          {productCount !== null && (
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

              <p className="admin-eyebrow">
                Products
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {productCount}
              </p>

            </div>
          )}


          {clickCount !== null && (
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

              <p className="admin-eyebrow">
                Affiliate clicks
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {clickCount}
              </p>

            </div>
          )}


          {providerCount !== null && (
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

              <p className="admin-eyebrow">
                Providers
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {providerCount}
              </p>

            </div>
          )}


          {staffCount !== null && (
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

              <p className="admin-eyebrow">
                Staff
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {staffCount}
              </p>

            </div>
          )}

        </section>


        {isAuthor && !ownAuthor && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <p className="font-medium">
              Author profile required
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Your account is not linked to an
              author profile yet. An administrator
              must link your account before you can
              create or edit articles.
            </p>

          </div>
        )}


        <section className="mt-10">

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Workspace
              </p>

              <h2 className="display-serif mt-2 text-3xl">
                Administration
              </h2>

            </div>

          </div>


          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {(isAdmin ||
              isEditor ||
              isAuthor) && (
              <Link
                href="/admin/articles"
                className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <p className="font-semibold">
                  Articles
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Create and manage editorial content.
                </p>
              </Link>
            )}


            {(isAdmin ||
              isEditor) && (
              <Link
                href="/admin/products"
                className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <p className="font-semibold">
                  Products
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Manage the Venuvella product catalog.
                </p>
              </Link>
            )}


            {(isAdmin ||
              isAnalyst) && (
              <Link
                href="/admin/analytics"
                className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <p className="font-semibold">
                  Analytics
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Review affiliate click and traffic data.
                </p>
              </Link>
            )}


            {isAdmin && (
              <>
                <Link
                  href="/admin/staff"
                  className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
                >
                  <p className="font-semibold">
                    Staff
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Manage administrator, editor,
                    author, and analyst accounts.
                  </p>
                </Link>


                <Link
                  href="/admin/providers"
                  className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
                >
                  <p className="font-semibold">
                    Providers
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Configure affiliate providers.
                  </p>
                </Link>


                <Link
                  href="/admin/provider-sync"
                  className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
                >
                  <p className="font-semibold">
                    Provider sync
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Run and review provider synchronization.
                  </p>
                </Link>


                <Link
                  href="/admin/provider-sync/scheduler"
                  className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
                >
                  <p className="font-semibold">
                    Scheduler
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Manage automated provider sync scheduling.
                  </p>
                </Link>


                <Link
                  href="/admin/affiliate-ops"
                  className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5"
                >
                  <p className="font-semibold">
                    Affiliate operations
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Monitor affiliate infrastructure and health.
                  </p>
                </Link>
              </>
            )}

          </div>

        </section>


        <section className="mt-10">

          <div>

            <p className="admin-eyebrow">
              Content
            </p>

            <h2 className="display-serif mt-2 text-3xl">
              Recent articles
            </h2>

          </div>


          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

            {recentArticles.length > 0 ? (

              <div className="divide-y divide-[var(--line)]">

                {recentArticles.map(
                  (article) => (

                    <Link
                      key={article.id}
                      href={`/admin/articles/${article.id}`}
                      className="block p-5 hover:bg-[var(--paper)]"
                    >

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div>

                          <p className="font-medium">
                            {article.title}
                          </p>

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {article.author.name}
                            {" · "}
                            {article.category.name}
                          </p>

                        </div>


                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {article.status}
                        </span>

                      </div>

                    </Link>

                  )
                )}

              </div>

            ) : (

              <div className="p-8 text-sm text-[var(--muted)]">
                No articles available.
              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}