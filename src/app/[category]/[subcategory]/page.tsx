import type { Metadata } from "next";
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


export const revalidate = 300;

// Build no pages up front: each page is created the first time someone
// visits it, then served from the cache and refreshed every 5 minutes.
export function generateStaticParams() {
  return [];
}


/**
 * A section inside a parent category, for example
 * /celebrity-fashion/women  (stored as the category "celebrity-fashion-women"
 * whose parent is "celebrity-fashion").
 */
async function getSection(
  parentSlug: string,
  sectionSlug: string
) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const section =
    await prisma.category.findUnique({
      where: {
        slug: `${parentSlug}-${sectionSlug}`,
      },

      include: {
        parent: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

  if (
    !section ||
    section.parent?.slug !== parentSlug
  ) {
    return null;
  }

  return section;
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}): Promise<Metadata> {
  const { category, subcategory } = await params;

  const section = await getSection(
    category,
    subcategory
  );

  if (!section || !section.parent) {
    return {};
  }

  const label = section.name.replace(
    /^Celebrity\s+/,
    ""
  );

  return {
    title: `${section.parent.name}: ${label}`,
    description:
      section.description ??
      `${section.parent.name} for ${label.toLowerCase()}: get the look, with picks you can shop.`,
    alternates: {
      canonical: `/${category}/${subcategory}`,
    },
  };
}


export default async function SectionPage({
  params,
}: {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}) {
  const { category, subcategory } = await params;

  const section = await getSection(
    category,
    subcategory
  );

  if (!section || !section.parent) {
    notFound();
  }

  const articles =
    await getArticlesByCategory(
      section.slug
    );

  const label = section.name.replace(
    /^Celebrity\s+/,
    ""
  );

  return (
    <main className="container-shell py-14 sm:py-20 lg:py-24">

      <section className="max-w-4xl">

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
          Venuvella /{" "}
          <Link
            href={`/${section.parent.slug}`}
            className="underline-offset-4 hover:underline"
          >
            {section.parent.name}
          </Link>{" "}
          / {label}
        </p>

        <h1 className="display-serif mt-4 text-6xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[84px]">
          {section.parent.name}: {label}
        </h1>

        {section.description && (
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            {section.description}
          </p>
        )}

      </section>


      <section className="mt-14 sm:mt-16">

        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">

          {articles.map(
            (article, index) => (
              <ArticleCard
                key={article.id}
                article={{
                  category: section.name,
                  title: article.title,
                  excerpt: article.excerpt ?? "",
                  image:
                    article.featuredImage ??
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",
                  slug: article.slug,
                  readingTime: "6 min",
                }}
                featured={index === 0}
              />
            )
          )}

        </div>

        {articles.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line)] px-6 py-12 text-center">
            <p className="text-base text-[var(--muted)]">
              No published stories in this section yet.
            </p>
          </div>
        )}

      </section>


      <div className="mt-14 flex flex-wrap gap-3">

        <Link
          href={`/${section.parent.slug}`}
          className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] transition hover:bg-[var(--ink)] hover:text-white"
        >
          All {section.parent.name}
        </Link>

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
