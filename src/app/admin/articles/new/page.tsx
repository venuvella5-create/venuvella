import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { ArticleEditor } from "@/components/admin/ArticleEditor";


export default async function NewArticlePage() {
  const [categories, authors, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.author.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        name: "asc",
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
          ← Articles
        </Link>


        <div className="mb-8 mt-4">

          <p className="admin-eyebrow">
            Content / New article
          </p>

          <h1 className="display-serif text-5xl">
            Create an article
          </h1>

        </div>


        <ArticleEditor
          categories={categories}
          authors={authors}
          products={products}
        />

      </div>

    </main>
  );
}