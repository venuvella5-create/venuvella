import { prisma } from "@/lib/db/prisma";

export async function getPublishedProducts(limit = 8) {
  if (!process.env.DATABASE_URL) return [];
  return prisma.product.findMany({ where: { status: "PUBLISHED" }, orderBy: { updatedAt: "desc" }, take: limit, include: { brand: true, images: { orderBy: { position: "asc" }, take: 1 } } });
}
