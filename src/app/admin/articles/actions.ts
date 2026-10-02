"use server";

import { revalidatePath } from "next/cache";

import {
  ArticleBlockType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { articleInputSchema } from "@/lib/validation/content";


export type ArticleActionState = {
  ok: boolean;
  message: string;
};


type ParsedBlock = {
  type: string;
  data: Prisma.InputJsonValue;
};


function getProductRelations(
  blocks: ParsedBlock[]
) {
  const seen = new Set<string>();

  const products: {
    productId: string;
    position: number;
  }[] = [];


  function addProduct(
    productId: string,
    position: number
  ) {
    if (!productId) {
      return;
    }

    if (seen.has(productId)) {
      return;
    }

    seen.add(productId);

    products.push({
      productId,
      position,
    });
  }


  blocks.forEach((block, position) => {

    /*
     * SINGLE PRODUCT
     */

    if (block.type === "PRODUCT") {
      const data = block.data as {
        productId?: unknown;
      };

      if (
        typeof data.productId === "string"
      ) {
        addProduct(
          data.productId,
          position
        );
      }

      return;
    }


    /*
     * PRODUCT GRID
     */

    if (block.type === "PRODUCT_GRID") {
      const data = block.data as {
        productIds?: unknown;
      };

      if (
        Array.isArray(data.productIds)
      ) {
        data.productIds.forEach(
          (productId) => {
            if (
              typeof productId ===
              "string"
            ) {
              addProduct(
                productId,
                position
              );
            }
          }
        );
      }
    }

  });


  return products;
}


export async function createArticle(
  _previous: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {

  const raw =
    Object.fromEntries(
      formData.entries()
    );


  const parsed =
    articleInputSchema.safeParse(
      raw
    );


  if (!parsed.success) {
    return {
      ok: false,

      message:
        parsed.error.issues[0]?.message ??
        "Please check the form.",
    };
  }


  let blocks: ParsedBlock[];


  try {
    const value =
      JSON.parse(
        parsed.data.blocks
      );


    if (!Array.isArray(value)) {
      throw new Error(
        "Blocks must be an array."
      );
    }


    blocks = value;
  } catch {
    return {
      ok: false,

      message:
        "Article blocks contain invalid JSON.",
    };
  }


  /*
   * Validate block types
   */

  const invalidBlock =
    blocks.find((block) => {
      return !Object.values(
        ArticleBlockType
      ).includes(
        block.type as ArticleBlockType
      );
    });


  if (invalidBlock) {
    return {
      ok: false,

      message:
        "Article contains an unsupported block type.",
    };
  }


  /*
   * Validate PRODUCT and PRODUCT_GRID blocks
   */

  for (const block of blocks) {

    /*
     * PRODUCT
     */

    if (block.type === "PRODUCT") {
      const data = block.data as {
        productId?: unknown;
      };


      if (
        typeof data.productId !== "string" ||
        !data.productId
      ) {
        return {
          ok: false,

          message:
            "A product block is missing its product.",
        };
      }
    }


    /*
     * PRODUCT_GRID
     */

    if (
      block.type ===
      "PRODUCT_GRID"
    ) {
      const data = block.data as {
        productIds?: unknown;
      };


      if (
        !Array.isArray(
          data.productIds
        ) ||
        data.productIds.length ===
          0 ||
        !data.productIds.every(
          (productId) =>
            typeof productId ===
              "string" &&
            productId.length > 0
        )
      ) {
        return {
          ok: false,

          message:
            "A product grid must contain at least one valid product.",
        };
      }
    }

  }


  /*
   * Build ArticleProduct relations
   */

  const productRelations =
    getProductRelations(blocks);


  /*
   * Validate products still exist and are published
   */

  if (
    productRelations.length > 0
  ) {
    const productIds =
      productRelations.map(
        (item) =>
          item.productId
      );


    const existingProducts =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },

          status: "PUBLISHED",
        },

        select: {
          id: true,
        },
      });


    if (
      existingProducts.length !==
      productIds.length
    ) {
      return {
        ok: false,

        message:
          "One or more inserted products are no longer available.",
      };
    }
  }


  /*
   * Check duplicate article slug
   */

  const exists =
    await prisma.article.findUnique({
      where: {
        slug:
          parsed.data.slug,
      },

      select: {
        id: true,
      },
    });


  if (exists) {
    return {
      ok: false,

      message:
        "That article slug is already in use.",
    };
  }


  /*
   * Published date
   */

  const publishedAt =
    parsed.data.status ===
    "PUBLISHED"
      ? new Date()
      : null;


  /*
   * Create article
   */

  const article =
    await prisma.article.create({
      data: {

        title:
          parsed.data.title,

        slug:
          parsed.data.slug,

        subtitle:
          parsed.data.subtitle ||
          null,

        excerpt:
          parsed.data.excerpt ||
          null,

        featuredImage:
          parsed.data
            .featuredImage ||
          null,

        categoryId:
          parsed.data.categoryId,

        authorId:
          parsed.data.authorId,

        status:
          parsed.data.status,

        publishedAt,


        /*
         * ARTICLE BLOCKS
         */

        blocks: {
          create:
            blocks.map(
              (
                block,
                position
              ) => ({
                type:
                  ArticleBlockType[
                    block.type as keyof typeof ArticleBlockType
                  ],

                position,

                data:
                  block.data,
              })
            ),
        },


        /*
         * ARTICLE ↔ PRODUCT RELATIONS
         */

        relatedProducts:
          productRelations.length >
          0
            ? {
                create:
                  productRelations.map(
                    (product) => ({
                      productId:
                        product.productId,

                      position:
                        product.position,
                    })
                  ),
              }
            : undefined,


        /*
         * SEO
         */

        seo: {
          create: {

            title:
              parsed.data
                .seoTitle ||
              parsed.data.title,

            description:
              parsed.data
                .seoDescription ||
              parsed.data
                .excerpt ||
              null,

          },
        },

      },
    });


  /*
   * Revalidate public pages
   */

  revalidatePath("/");

  revalidatePath(
    "/articles"
  );

  revalidatePath(
    `/articles/${article.slug}`
  );


  /*
   * Revalidate category page
   */

  const category =
    await prisma.category.findUnique({
      where: {
        id:
          article.categoryId,
      },

      select: {
        slug: true,
      },
    });


  if (category) {
    revalidatePath(
      `/${category.slug}`
    );
  }


  return {
    ok: true,

    message:
      `Article “${article.title}” created.`,
  };
}