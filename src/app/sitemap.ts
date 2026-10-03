import type {
  MetadataRoute,
} from "next";

import {
  prisma,
} from "@/lib/db/prisma";


const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://venuvella.vercel.app"
).replace(
  /\/$/,
  ""
);


export const dynamic =
  "force-dynamic";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    articles,
    products,
    categories,
  ] = await Promise.all([
    prisma.article.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      select: {
        slug:
          true,

        updatedAt:
          true,

        publishedAt:
          true,
      },
    }),

    prisma.product.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      select: {
        slug:
          true,

        updatedAt:
          true,
      },
    }),

    prisma.category.findMany({
      select: {
        slug:
          true,
      },
    }),
  ]);


  const staticPages: MetadataRoute.Sitemap = [
    {
      url:
        siteUrl,

      changeFrequency:
        "daily",

      priority:
        1,
    },

    {
      url:
        `${siteUrl}/articles`,

      changeFrequency:
        "daily",

      priority:
        0.9,
    },

    {
      url:
        `${siteUrl}/products`,

      changeFrequency:
        "daily",

      priority:
        0.9,
    },

    {
      url:
        `${siteUrl}/guides`,

      changeFrequency:
        "weekly",

      priority:
        0.8,
    },

    {
      url:
        `${siteUrl}/deals`,

      changeFrequency:
        "daily",

      priority:
        0.8,
    },

    {
      url:
        `${siteUrl}/seasonal`,

      changeFrequency:
        "weekly",

      priority:
        0.7,
    },
  ];


  const reservedTopLevelSlugs =
    new Set([
      "articles",
      "products",
      "guides",
      "deals",
      "seasonal",
      "admin",
      "api",
    ]);


  const categoryPages: MetadataRoute.Sitemap =
    categories
      .filter(
        (
          category
        ) =>
          !reservedTopLevelSlugs.has(
            category.slug
          )
      )
      .map(
        (
          category
        ) => ({
          url:
            `${siteUrl}/${category.slug}`,

          changeFrequency:
            "weekly",

          priority:
            0.7,
        })
      );


  const articlePages: MetadataRoute.Sitemap =
    articles.map(
      (
        article
      ) => ({
        url:
          `${siteUrl}/articles/${article.slug}`,

        lastModified:
          article.updatedAt ??
          article.publishedAt ??
          undefined,

        changeFrequency:
          "weekly",

        priority:
          0.8,
      })
    );


  const productPages: MetadataRoute.Sitemap =
    products.map(
      (
        product
      ) => ({
        url:
          `${siteUrl}/products/${product.slug}`,

        lastModified:
          product.updatedAt,

        changeFrequency:
          "weekly",

        priority:
          0.7,
      })
    );


  const entries = [
    ...staticPages,
    ...categoryPages,
    ...articlePages,
    ...productPages,
  ];


  const uniqueEntries =
    Array.from(
      new Map(
        entries.map(
          (
            entry
          ) => [
            entry.url,
            entry,
          ]
        )
      ).values()
    );


  return uniqueEntries;
}