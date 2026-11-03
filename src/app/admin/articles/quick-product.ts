"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-admin";

export type QuickProductInput = {
  name: string;
  categoryId: string;
  imageUrl: string;
  buyUrl: string;
  providerId: string;
  price: string;
  summary: string;
};

export type QuickProductOption = {
  id: string;
  name: string;
  slug: string;
  editorialSummary: string | null;
  brand: { name: string } | null;
  category: { name: string };
};

export type QuickProductResult =
  | { ok: true; product: QuickProductOption }
  | { ok: false; message: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Creates and publishes a product from inside the article editor, with its
 * image and affiliate link, so it can be inserted straight into the article.
 * The product also appears on the Products page like any other product.
 */
export async function quickCreateProduct(
  input: QuickProductInput
): Promise<QuickProductResult> {
  await requireRole(["ADMIN", "EDITOR"]);

  const name = input.name.trim();
  const imageUrl = input.imageUrl.trim();
  const buyUrl = input.buyUrl.trim();
  const rawPrice = input.price.trim();
  const summary = input.summary.trim();

  if (!name) {
    return { ok: false, message: "Product name is required." };
  }

  if (!input.categoryId) {
    return { ok: false, message: "Please choose a category." };
  }

  if (imageUrl && !isHttpUrl(imageUrl)) {
    return {
      ok: false,
      message: "Image URL must start with http:// or https://",
    };
  }

  if (buyUrl && !isHttpUrl(buyUrl)) {
    return {
      ok: false,
      message: "Affiliate link must start with http:// or https://",
    };
  }

  let price: Prisma.Decimal | null = null;
  if (rawPrice) {
    const parsed = Number(rawPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { ok: false, message: "Price must be a number like 29.99" };
    }
    price = new Prisma.Decimal(rawPrice);
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });

  if (!category) {
    return { ok: false, message: "That category was not found." };
  }

  // Unique slug: add -2, -3 ... if the name is already taken.
  const baseSlug = slugify(name);
  if (!baseSlug) {
    return { ok: false, message: "Could not build a URL from that name." };
  }

  let slug = baseSlug;
  for (let attempt = 2; attempt < 50; attempt++) {
    const taken = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!taken) break;
    slug = `${baseSlug}-${attempt}`;
  }

  // Retailer: the one chosen, or a generic "Direct link" store.
  let providerId: string | null = null;
  if (buyUrl) {
    if (input.providerId) {
      const provider = await prisma.affiliateProvider.findUnique({
        where: { id: input.providerId },
        select: { id: true },
      });
      providerId = provider?.id ?? null;
    }

    if (!providerId) {
      const direct = await prisma.affiliateProvider.upsert({
        where: { slug: "direct" },
        update: {},
        create: { name: "Direct link", slug: "direct", status: "ACTIVE" },
        select: { id: true },
      });
      providerId = direct.id;
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      categoryId: input.categoryId,
      editorialSummary: summary || null,
      status: "PUBLISHED",
      ...(imageUrl
        ? {
            images: {
              create: { url: imageUrl, altText: name, position: 0 },
            },
          }
        : {}),
      ...(buyUrl && providerId
        ? {
            providerProducts: {
              create: {
                providerId,
                externalProductId: slug,
                productUrl: buyUrl,
                affiliateUrl: buyUrl,
                price,
                currency: price ? "USD" : null,
                syncStatus: "SUCCESS",
                lastSyncedAt: new Date(),
                priority: 10,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      editorialSummary: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { ok: true, product };
}
