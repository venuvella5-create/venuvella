import Link from "next/link";

import { logoutAdminAction } from "@/app/admin/login/actions";
import { prisma } from "@/lib/db/prisma";


export default async function AdminDashboard() {

  const [
    articles,
    products,
    pendingProducts,
    clicks,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.product.count(),
    prisma.product.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),
    prisma.affiliateClick.count(),
  ]);


  const recent =
    await prisma.article.findMany({
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Venuvella / Admin
            </p>


            <h1 className="display-serif text-5xl">
              Editorial dashboard
            </h1>

          </div>


          <div className="flex flex-wrap items-center gap-3">

            <Link
              href="/admin/articles/new"
              className="admin-primary"
            >
              New article
            </Link>


            <form action={logoutAdminAction}>

              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.12em] transition hover:bg-[#e8e6df]"
              >
                Sign out
              </button>

            </form>

          </div>

        </div>


        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ["Articles", articles],
            ["Products", products],
            [
              "Pending review",
              pendingProducts,
            ],
            [
              "Affiliate clicks",
              clicks,
            ],
          ].map(
            ([label, value]) => (

              <div
                key={String(label)}
                className="rounded-2xl border border-[var(--line)] bg-white p-6"
              >

                <p className="admin-eyebrow">
                  {label}
                </p>


                <p className="mt-3 text-4xl font-semibold">
                  {value}
                </p>

              </div>

            )
          )}

        </div>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex items-center justify-between">

            <h2 className="display-serif text-3xl">
              Recent content
            </h2>


            <Link
              href="/admin/articles"
              className="admin-link"
            >
              View all →
            </Link>

          </div>


          <div className="mt-5 divide-y divide-[var(--line)]">

            {recent.map(
              (article) => (

                <Link
                  key={article.slug}
                  href={`/admin/articles/${article.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 hover:opacity-70"
                >

                  <span>

                    <span className="block font-medium">
                      {article.title}
                    </span>


                    <span className="text-xs text-[var(--muted)]">
                      Updated{" "}
                      {article.updatedAt.toLocaleDateString()}
                    </span>

                  </span>


                  <span className="admin-badge">
                    {article.status}
                  </span>

                </Link>

              )
            )}

          </div>

        </section>

      </div>

    </main>
  );
}