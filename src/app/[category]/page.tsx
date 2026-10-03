import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArticleCard,
} from "@/components/editorial/ArticleCard";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  getArticlesByCategory,
} from "@/lib/content/articles";


export const dynamic =
  "force-dynamic";


export default async function CategoryPage({
  params,
}: {
  params:
    Promise<{
      category: string;
    }>;
}) {
  const {
    category: slug,
  } = await params;


  if (
    !process.env.DATABASE_URL
  ) {
    notFound();
  }


  const category =
    await prisma.category.findUnique({
      where: {
        slug,
      },
    });


  if (
    !category
  ) {
    notFound();
  }


  const articles =
    await getArticlesByCategory(
      slug
    );


  return (
    <main className="container-shell py-14 sm:py-20 lg:py-24">

      <section className="max-w-4xl">

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
          Venuvella / {category.name}
        </p>


        <h1 className="display-serif mt-4 text-6xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[84px]">
          {category.name}
        </h1>


        {category.description && (
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            {category.description}
          </p>
        )}

      </section>


      <section className="mt-14 sm:mt-16">

        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">

          {articles.map(
            (
              article,
              index
            ) => (

              <ArticleCard
                key={
                  article.id
                }
                article={{
                  category:
                    category.name,

                  title:
                    article.title,

                  excerpt:
                    article.excerpt ??
                    "",

                  image:
                    article.featuredImage ??
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",

                  slug:
                    article.slug,

                  readingTime:
                    "6 min",
                }}
                featured={
                  index ===
                  0
                }
              />

            )
          )}

        </div>


        {articles.length ===
          0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] px-6 py-12 text-center">

            <p className="text-base text-[var(--muted)]">
              No published stories in this category yet.
            </p>

          </div>
        )}

      </section>


      <div className="mt-14">

        <Link
          href="/articles"
          className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white transition hover:opacity-90"
        >
          All articles
        </Link>

      </div>

    </main>
  );
}