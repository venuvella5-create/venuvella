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


export const revalidate =
  3600;


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now =
    new Date();


  const [
    articles,
    products,
    categories,
  ] = await Promise.all([
    prisma.article.findMany({
      where: {
        status:
          "PUBLISHED",

        publishedAt: {
          lte:
            now,
        },
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
    {
      url:
        `${siteUrl}/about`,

      changeFrequency:
        "monthly",

      priority:
        0.5,
    },
    {
      url:
        `${siteUrl}/contact`,

      changeFrequency:
        "monthly",

      priority:
        0.4,
    },
    {
      url:
        `${siteUrl}/editorial-policy`,

      changeFrequency:
        "monthly",

      priority:
        0.5,
    },
    {
      url:
        `${siteUrl}/affiliate-disclosure`,

      changeFrequency:
        "monthly",

      priority:
        0.5,
    },
    {
      url:
        `${siteUrl}/privacy`,

      changeFrequency:
        "yearly",

      priority:
        0.3,
    },
    {
      url:
        `${siteUrl}/terms`,

      changeFrequency:
        "yearly",

      priority:
        0.3,
    },
    {
      url:
        `${siteUrl}/cookies`,

      changeFrequency:
        "yearly",

      priority:
        0.3,
    },
  ];


  const reservedTopLevelSlugs =
    new Set([
      "articles",
      "products",
      "guides",
      "deals",
      "seasonal",
      "about",
      "contact",
      "editorial-policy",
      "affiliate-disclosure",
      "privacy",
      "terms",
      "cookies",
      "search",
      "go",
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


  return Array.from(
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
}
