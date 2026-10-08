"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-admin";

const MAX_RETAILERS = 4;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function fail(message: string): never {
  redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
}

/**
 * One-step product creation.
 *
 * Creates the product, its main image and up to four retailer links, and
 * (by default) publishes it immediately. Retailer rows are listed in order
 * of preference: the first row gets the main "Buy" button.
 */
export async function createProduct(formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);

  const name = text(formData, "name");
  const categoryId = text(formData, "categoryId");
  const brandId = text(formData, "brandId");
  const description = text(formData, "description");
  const editorialSummary = text(formData, "editorialSummary");
  const imageUrl = text(formData, "imageUrl");
  const publishNow = formData.get("publishNow") === "on";

  if (!name) fail("Product name is required.");
  if (!categoryId) fail("Please choose a category.");

  const slug = slugify(text(formData, "slug") || name);
  if (!slug) fail("Could not build a URL slug from that name.");

  if (imageUrl && !isHttpUrl(imageUrl)) {
    fail("Image URL must start with http:// or https://");
  }

  // Collect retailer rows (a row counts once it has a buy link).
  const offers: {
    providerId: string | null;
    buyUrl: string;
    price: Prisma.Decimal | null;
  }[] = [];

  for (let i = 1; i <= MAX_RETAILERS; i++) {
    const buyUrl = text(formData, `buyUrl_${i}`);
    if (!buyUrl) continue;

    if (!isHttpUrl(buyUrl)) {
      fail(`Retailer ${i}: buy link must start with http:// or https://`);
    }

    const rawPrice = text(formData, `price_${i}`);
    let price: Prisma.Decimal | null = null;
    if (rawPrice) {
      const parsed = Number(rawPrice);
      if (!Number.isFinite(parsed) || parsed < 0) {
        fail(`Retailer ${i}: price must be a number like 29.99`);
      }
      price = new Prisma.Decimal(rawPrice);
    }

    offers.push({
      providerId: text(formData, `providerId_${i}`) || null,
      buyUrl,
      price,
    });
  }

  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing) {
    fail(`A product with the URL "${slug}" already exists. Change the slug.`);
  }

  // Resolve providers (blank = generic "Direct link"), one offer per provider.
  const resolved: {
    providerId: string;
    buyUrl: string;
    price: Prisma.Decimal | null;
    priority: number;
  }[] = [];
  const usedProviders = new Set<string>();

  for (const offer of offers) {
    let providerId = offer.providerId;

    if (providerId) {
      const provider = await prisma.affiliateProvider.findUnique({
        where: { id: providerId },
        select: { id: true },
      });
      if (!provider) fail("A selected retailer was not found.");
    } else {
      const direct = await prisma.affiliateProvider.upsert({
        where: { slug: "direct" },
        update: {},
        create: { name: "Direct link", slug: "direct", status: "ACTIVE" },
        select: { id: true },
      });
      providerId = direct.id;
    }

    if (usedProviders.has(providerId)) {
      fail(
        "Each retailer can only be used once per product. Pick a different retailer for each row."
      );
    }
    usedProviders.add(providerId);

    resolved.push({
      providerId,
      buyUrl: offer.buyUrl,
      price: offer.price,
      priority: (resolved.length + 1) * 10,
    });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      categoryId,
      brandId: brandId || null,
      description: description || null,
      editorialSummary: editorialSummary || null,
      status: publishNow ? "PUBLISHED" : "DISCOVERED",
      ...(imageUrl
        ? {
            images: {
              create: { url: imageUrl, altText: name, position: 0 },
            },
          }
        : {}),
      ...(resolved.length > 0
        ? {
            providerProducts: {
              create: resolved.map((offer) => ({
                providerId: offer.providerId,
                externalProductId: slug,
                productUrl: offer.buyUrl,
                affiliateUrl: offer.buyUrl,
                price: offer.price,
                currency: offer.price ? "USD" : null,
                syncStatus: "SUCCESS" as const,
                lastSyncedAt: new Date(),
                priority: offer.priority,
              })),
            },
          }
        : {}),
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/");

  redirect(`/admin/products/${product.id}?created=1`);
}
