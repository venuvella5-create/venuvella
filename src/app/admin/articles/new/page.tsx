import Link from "next/link";

import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { requirePageRole } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function NewArticlePage() {
  const session =
    await requirePageRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
    ]);


  const isAuthor =
    session.role ===
    "AUTHOR";


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


  const [
    categories,
    authors,
    products,
  ] = await Promise.all([

    prisma.category.findMany({
      orderBy: {
        sortOrder:
          "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),


    isAuthor
      ? Promise.resolve(
          ownAuthor
            ? [
                {
                  id:
                    ownAuthor.id,

                  name:
                    ownAuthor.name,
                },
              ]
            : []
        )
      : prisma.author.findMany({
          orderBy: {
            name:
              "asc",
          },

          select: {
            id: true,
            name: true,
          },
        }),


    prisma.product.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      orderBy: {
        name:
          "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        editorialSummary: true,

        brand: {
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
    }),

  ]);


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/articles"
          className="admin-link"
        >
          â† Articles
        </Link>


        <div className="mb-8 mt-4">

          <p className="admin-eyebrow">
            Content / New article
          </p>


          <h1 className="display-serif text-5xl">
            Create an article
          </h1>


          {isAuthor && ownAuthor && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Creating as{" "}
              <span className="font-medium text-[var(--ink)]">
                {ownAuthor.name}
              </span>
            </p>
          )}

        </div>


        {isAuthor && !ownAuthor ? (

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6">

            <p className="admin-eyebrow">
              Author account
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Author profile required
            </h2>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Your user account is not linked to an
              author profile. An administrator must
              connect your account to an author profile
              before you can create articles.
            </p>


            <Link
              href="/admin/articles"
              className="admin-secondary mt-6 inline-flex"
            >
              Back to articles
            </Link>

          </section>

        ) : (

          <ArticleEditor
            categories={categories}
            authors={authors}
            products={products}
          />

        )}

      </div>

    </main>
  );
}
