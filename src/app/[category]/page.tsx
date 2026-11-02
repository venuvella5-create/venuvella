import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  ArticleCard,
} from "@/components/editorial/ArticleCard";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  getArticlesByCategories,
  getArticlesByCategory,
} from "@/lib/content/articles";


export const revalidate = 300;

// Build no pages up front: each page is created the first time someone
// visits it, then served from the cache and refreshed every 5 minutes.
// (An empty list also keeps the build from querying the database.)
export function generateStaticParams() {
  return [];
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;

  if (!process.env.DATABASE_URL) {
    return {};
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) {
    return {};
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Venuvella picks and stories in ${category.name}.`,
    alternates: { canonical: `/${slug}` },
  };
}

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

      include: {
        parent: {
          select: {
            slug: true,
          },
        },

        children: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            name: true,
            slug: true,
          },
        },
      },
    });


  if (
    !category
  ) {
    notFound();
  }


  // A section like "Celebrity Women" lives at /celebrity-fashion/women.
  if (
    category.parent &&
    slug.startsWith(`${category.parent.slug}-`)
  ) {
    permanentRedirect(
      `/${category.parent.slug}/${slug.slice(
        category.parent.slug.length + 1
      )}`
    );
  }

  const childSections =
    category.children.map(
      (child) => ({
        label:
          child.name.replace(
            /^Celebrity\s+/,
            ""
          ),

        href: `/${slug}/${child.slug.slice(
          slug.length + 1
        )}`,
      })
    );

  const articles =
    category.children.length > 0
      ? await getArticlesByCategories([
          slug,
          ...category.children.map(
            (child) => child.slug
          ),
        ])
      : await getArticlesByCategory(
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


      {childSections.length > 0 && (
        <nav
          aria-label={`${category.name} sections`}
          className="mt-10 flex flex-wrap gap-3"
        >
          {childSections.map(
            (section) => (
              <Link
                key={section.href}
                href={section.href}
                className="inline-flex min-h-[46px] items-center rounded-full border border-[var(--ink)] px-7 text-[11px] font-semibold uppercase tracking-[0.13em] transition hover:bg-[var(--ink)] hover:text-white"
              >
                {section.label}
              </Link>
            )
          )}
        </nav>
      )}

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
                    article.category?.name ??
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