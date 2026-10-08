import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Item = {
  type: "product" | "article";
  title: string;
  href: string;
  image: string | null;
  label: string;
  blurb: string | null;
};

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Returns up to one product and one article to recommend on the page the
 * visitor is reading. Uses the current page's category when it can.
 */
export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ items: [] });
  }

  const path = new URL(request.url).searchParams.get("path") ?? "/";
  const parts = path.split("?")[0].split("/").filter(Boolean);

  let categoryId: string | null = null;
  let excludeArticleSlug: string | null = null;
  let excludeProductSlug: string | null = null;

  try {
    if (parts[0] === "articles" && parts[1]) {
      excludeArticleSlug = parts[1];
      const current = await prisma.article.findUnique({
        where: { slug: parts[1] },
        select: { categoryId: true },
      });
      categoryId = current?.categoryId ?? null;
    } else if (parts[0] === "products" && parts[1]) {
      excludeProductSlug = parts[1];
      const current = await prisma.product.findUnique({
        where: { slug: parts[1] },
        select: { categoryId: true },
      });
      categoryId = current?.categoryId ?? null;
    } else if (parts.length === 1) {
      const category = await prisma.category.findUnique({
        where: { slug: parts[0] },
        select: { id: true },
      });
      categoryId = category?.id ?? null;
    }

    const productWhere = {
      status: "PUBLISHED" as const,
      ...(excludeProductSlug ? { NOT: { slug: excludeProductSlug } } : {}),
    };
    const articleWhere = {
      status: "PUBLISHED" as const,
      publishedAt: { lte: new Date() },
      ...(excludeArticleSlug ? { NOT: { slug: excludeArticleSlug } } : {}),
    };

    async function findProducts(withCategory: boolean) {
      return prisma.product.findMany({
        where: {
          ...productWhere,
          ...(withCategory && categoryId ? { categoryId } : {}),
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          name: true,
          slug: true,
          editorialSummary: true,
          brand: { select: { name: true } },
          images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        },
      });
    }

    async function findArticles(withCategory: boolean) {
      return prisma.article.findMany({
        where: {
          ...articleWhere,
          ...(withCategory && categoryId ? { categoryId } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
        },
      });
    }

    let products = await findProducts(true);
    if (products.length === 0 && categoryId) products = await findProducts(false);

    let articles = await findArticles(true);
    if (articles.length === 0 && categoryId) articles = await findArticles(false);

    const items: Item[] = [];

    const product = pickRandom(products);
    if (product) {
      items.push({
        type: "product",
        title: product.name,
        href: `/products/${product.slug}`,
        image: product.images[0]?.url ?? null,
        label: product.brand?.name
          ? `Shop · ${product.brand.name}`
          : "Shop this pick",
        blurb: product.editorialSummary,
      });
    }

    const article = pickRandom(articles);
    if (article) {
      items.push({
        type: "article",
        title: article.title,
        href: `/articles/${article.slug}`,
        image: article.featuredImage,
        label: "Keep reading",
        blurb: article.excerpt,
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Recommendations failed:", error);
    return NextResponse.json({ items: [] });
  }
}
