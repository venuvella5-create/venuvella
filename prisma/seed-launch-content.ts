/**
 * Imports the launch content: 10 articles and the 35 products they feature.
 *
 * - Safe to run more than once. Anything that already exists (matched by slug)
 *   is skipped, never overwritten, so your own edits are kept.
 * - Requires categories and an author to exist. Run `npm run db:seed` first if
 *   you have not already.
 * - Each product gets an Amazon search link as a starting "buy" link. If you
 *   put AMAZON_ASSOCIATE_TAG="yourtag-20" in .env before running, your
 *   Associates tag is added to those links automatically.
 *
 * Run with:  npm run db:seed-launch
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ArticleBlockType, PrismaClient, ProviderStatus } from "@prisma/client";

import { launchArticles } from "./launch-content/articles";
import { launchProducts } from "./launch-content/products";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readAssociateTag(): string | null {
  const fromEnv = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  if (fromEnv) return fromEnv;

  try {
    const file = readFileSync(join(process.cwd(), ".env"), "utf8");
    const match = file.match(/^\s*AMAZON_ASSOCIATE_TAG\s*=\s*"?([^"\r\n]+)"?\s*$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

async function main() {
  const tag = readAssociateTag();
  console.log(
    tag
      ? `Using Amazon Associates tag: ${tag}`
      : "No AMAZON_ASSOCIATE_TAG found: Amazon links will be plain search links (you can edit them later)."
  );

  // ── Author ──────────────────────────────────────────────
  const author =
    (await prisma.author.findFirst({ where: { slug: "venuvella-edit" } })) ??
    (await prisma.author.findFirst());

  if (!author) {
    throw new Error("No author found. Run `npm run db:seed` first.");
  }

  // ── Categories ──────────────────────────────────────────
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));

  for (const slug of ["beauty", "home", "fitness", "style", "seasonal"]) {
    if (!categoryId.has(slug)) {
      throw new Error(`Category "${slug}" is missing. Run \`npm run db:seed\` first.`);
    }
  }

  // ── Amazon provider ─────────────────────────────────────
  const amazon =
    (await prisma.affiliateProvider.findFirst({
      where: { OR: [{ slug: "amazon" }, { name: "Amazon" }] },
      select: { id: true },
    })) ??
    (await prisma.affiliateProvider.create({
      data: {
        name: "Amazon",
        slug: "amazon",
        websiteUrl: "https://www.amazon.com",
        status: ProviderStatus.ACTIVE,
      },
      select: { id: true },
    }));

  // ── Products ────────────────────────────────────────────
  const productId = new Map<string, string>();
  let productsCreated = 0;

  for (const item of launchProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      select: { id: true },
    });

    if (existing) {
      productId.set(item.slug, existing.id);
      continue;
    }

    const brandSlug = slugify(item.brand);
    const brand =
      (await prisma.brand.findUnique({ where: { slug: brandSlug } })) ??
      (await prisma.brand.create({
        data: { name: item.brand, slug: brandSlug },
      }));

    const searchUrl =
      `https://www.amazon.com/s?k=${encodeURIComponent(item.name)}` +
      (tag ? `&tag=${encodeURIComponent(tag)}` : "");

    const created = await prisma.product.create({
      data: {
        slug: item.slug,
        name: item.name,
        editorialSummary: item.summary,
        status: "PUBLISHED",
        categoryId: categoryId.get(item.category)!,
        brandId: brand.id,
        providerProducts: {
          create: {
            providerId: amazon.id,
            externalProductId: item.slug,
            productUrl: searchUrl,
            affiliateUrl: searchUrl,
            syncStatus: "SUCCESS",
            lastSyncedAt: new Date(),
            priority: 10,
          },
        },
      },
      select: { id: true },
    });

    productId.set(item.slug, created.id);
    productsCreated++;
  }

  // ── Articles ────────────────────────────────────────────
  let articlesCreated = 0;
  let articlesSkipped = 0;
  const DAY = 24 * 60 * 60 * 1000;

  for (let index = 0; index < launchArticles.length; index++) {
    const article = launchArticles[index];

    const exists = await prisma.article.findUnique({
      where: { slug: article.slug },
      select: { id: true },
    });

    if (exists) {
      articlesSkipped++;
      continue;
    }

    // Build blocks and the article ↔ product relations.
    const relations: { productId: string; position: number }[] = [];
    const seen = new Set<string>();

    function relate(slug: string, position: number) {
      const id = productId.get(slug);
      if (!id) throw new Error(`Unknown product "${slug}" in "${article.slug}".`);
      if (!seen.has(id)) {
        seen.add(id);
        relations.push({ productId: id, position });
      }
      return id;
    }

    const blocks = article.blocks.map((block, position) => {
      if (block.type === "PRODUCT") {
        return {
          type: ArticleBlockType.PRODUCT,
          position,
          data: { productId: relate(block.product, position) },
        };
      }

      if (block.type === "PRODUCT_GRID") {
        return {
          type: ArticleBlockType.PRODUCT_GRID,
          position,
          data: {
            productIds: block.products.map((slug) => relate(slug, position)),
          },
        };
      }

      return {
        type: ArticleBlockType[block.type],
        position,
        data: { text: block.text },
      };
    });

    // Spread publish dates over the last 10 days so the feed looks natural.
    const publishedAt = new Date(
      Date.now() - (launchArticles.length - index) * DAY + index * 60 * 60 * 1000
    );

    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        featuredImage: article.image,
        categoryId: categoryId.get(article.category)!,
        authorId: author.id,
        status: "PUBLISHED",
        publishedAt,
        blocks: { create: blocks },
        relatedProducts: { create: relations },
        seo: {
          create: {
            title: article.seoTitle,
            description: article.seoDescription,
          },
        },
      },
    });

    articlesCreated++;
  }

  console.log(
    `Products created: ${productsCreated} (already existed: ${launchProducts.length - productsCreated})`
  );
  console.log(
    `Articles created: ${articlesCreated} (already existed: ${articlesSkipped})`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
