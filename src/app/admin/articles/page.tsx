import Link from "next/link";

import { requirePageRole } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function AdminArticlesPage() {
  const session =
    await requirePageRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
    ]);


  const isAuthor =
    session.role === "AUTHOR";


  const ownAuthor =
    isAuthor
      ? await prisma.author.findUnique({
          where: {
            userId: session.userId,
          },

          select: {
            id: true,
            name: true,
          },
        })
      : null;


  const articles =
    await prisma.article.findMany({
      where:
        isAuthor
          ? ownAuthor
            ? {
                authorId: ownAuthor.id,
              }
            : {
                id: {
                  equals: "__no_article__",
                },
              }
          : undefined,

      orderBy: {
        updatedAt: "desc",
      },

      include: {
        author: true,
        category: true,
      },
    });


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Content
            </p>


            <h1 className="display-serif text-5xl">
              {isAuthor
                ? "Your articles"
                : "Articles"}
            </h1>


            {isAuthor && ownAuthor && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Author profile:{" "}
                {ownAuthor.name}
              </p>
            )}

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin"
              className="admin-secondary"
            >
              Back to admin
            </Link>


            <Link
              href="/admin/articles/new"
              className="admin-primary"
            >
              New article
            </Link>

          </div>

        </div>


        {isAuthor && !ownAuthor && (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <p className="text-sm font-semibold">
              Author profile required
            </p>


            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Your account is not linked to an author
              profile yet. An administrator must link
              your user account before you can manage
              author-specific content.
            </p>

          </div>
        )}


        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

          {articles.length > 0 ? (
            <>

              <div className="grid grid-cols-[1fr_150px_150px] border-b border-[var(--line)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">

                <span>
                  Article
                </span>

                <span>
                  Status
                </span>

                <span>
                  Category
                </span>

              </div>


              {articles.map(
                (article) => (

                  <Link
                    key={article.id}
                    href={`/admin/articles/${article.id}`}
                    className="grid grid-cols-[1fr_150px_150px] items-center border-b border-[var(--line)] px-5 py-5 last:border-0 hover:bg-[var(--paper)]"
                  >

                    <span>

                      <span className="block font-medium">
                        {article.title}
                      </span>


                      <span className="text-xs text-[var(--muted)]">
                        {article.author.name}
                      </span>

                    </span>


                    <span className="text-xs">
                      {article.status}
                    </span>


                    <span className="text-xs">
                      {article.category.name}
                    </span>

                  </Link>

                )
              )}

            </>
          ) : (

            <div className="p-10">

              <p className="text-sm text-[var(--muted)]">
                {isAuthor
                  ? "No articles are available for your author account yet."
                  : "No articles found."}
              </p>


              <Link
                href="/admin/articles/new"
                className="mt-5 inline-flex admin-primary"
              >
                Create article
              </Link>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
