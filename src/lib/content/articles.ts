import { prisma } from "@/lib/db/prisma";
import { ContentStatus } from "@prisma/client";

export async function getPublishedArticles(limit = 12) {
  if (!process.env.DATABASE_URL) return [];
  return prisma.article.findMany({
    where: { status: ContentStatus.PUBLISHED, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { category: true, author: true, tags: { include: { tag: true } } },
  });
}

export async function getArticleBySlug(slug: string) {
  if (!process.env.DATABASE_URL) return null;
  return prisma.article.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
      blocks: { orderBy: { position: "asc" } },
      faqs: { orderBy: { position: "asc" } },
      seo: true,
    },
  });
}

export async function getArticlesByCategory(slug: string, limit = 12) {
  if (!process.env.DATABASE_URL) return [];
  return prisma.article.findMany({
    where: { category: { slug }, status: ContentStatus.PUBLISHED, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { category: true, author: true },
  });
}

export async function getAdminArticles() {
  if (!process.env.DATABASE_URL) return [];
  return prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  });
}
