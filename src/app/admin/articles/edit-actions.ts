"use server";







import { revalidatePath } from "next/cache";







import {



  ArticleBlockType,



  Prisma,



} from "@prisma/client";







import { prisma } from "@/lib/db/prisma";

import { requireRole } from "@/lib/auth/require-admin";



import { articleInputSchema } from "@/lib/validation/content";
import {
  getEditorialReadiness,
  getPublishBlockMessage,
} from "@/lib/content/editorial-readiness";







import type {



  ArticleActionState,



} from "./actions";











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











export async function updateArticle(



  _previous: ArticleActionState,



  formData: FormData



): Promise<ArticleActionState> {







    const session =
    await requireRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
    ]);



const raw =



    Object.fromEntries(



      formData.entries()



    );











  const id =



    String(raw.id ?? "");











  const parsed =



    articleInputSchema.safeParse(



      raw



    );











  if (!id || !parsed.success) {



    return {



      ok: false,







      message:



        !parsed.success



          ? parsed.error.issues[0]



              ?.message ??



            "Please check the form."



          : "Missing article ID.",



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



     * PRODUCT GRID



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



   * Server-side publishing safeguard.



   */







  const readiness =



    getEditorialReadiness({



      title: parsed.data.title,



      slug: parsed.data.slug,



      excerpt:



        parsed.data.excerpt ?? "",



      featuredImage:



        parsed.data.featuredImage ?? "",



      seoTitle:



        parsed.data.seoTitle ?? "",



      seoDescription:



        parsed.data.seoDescription ?? "",



      blocks,



    });











  if (



    parsed.data.status ===



      "PUBLISHED" &&



    readiness.blockers.length > 0



  ) {



    return {



      ok: false,



      message:



        getPublishBlockMessage(



          readiness



        ) ??



        "Complete the publishing checklist before publishing.",



    };



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



   * Load current article



   */







  const article =



    await prisma.article.findUnique({



      where: {



        id,



      },







      select: {



        slug: true,



        categoryId: true,

        authorId: true,

        status: true,

        publishedAt: true,



      },



    });











  if (!article) {



    return {



      ok: false,







      message:



        "Article not found.",



    };



  }
  /*
   * AUTHOR OWNERSHIP
   *
   * ADMIN and EDITOR may edit any article.
   *
   * AUTHOR may only edit an article already
   * owned by the Author record linked to their
   * own User account, and may not reassign it.
   */

  if (
    session.role ===
    "AUTHOR"
  ) {
    const ownAuthor =
      await prisma.author.findUnique({
        where: {
          userId:
            session.userId,
        },

        select: {
          id: true,
        },
      });


    if (!ownAuthor) {
      return {
        ok: false,

        message:
          "Your account is not linked to an author profile.",
      };
    }


    if (
      article.authorId !==
      ownAuthor.id
    ) {
      return {
        ok: false,

        message:
          "You can only edit your own articles.",
      };
    }


    if (
      parsed.data.authorId !==
      ownAuthor.id
    ) {
      return {
        ok: false,

        message:
          "You cannot reassign this article to another author.",
      };
    }
  }














  /*



   * Prevent duplicate article slug



   */







  const duplicate =



    await prisma.article.findFirst({



      where: {



        slug:



          parsed.data.slug,







        NOT: {



          id,



        },



      },







      select: {



        id: true,



      },



    });











  if (duplicate) {



    return {



      ok: false,







      message:



        "That article slug is already in use.",



    };



  }











  /*



   * Update article transaction



   */







  const updated =



    await prisma.$transaction(



      async (tx) => {







        /*



         * Replace article blocks



         */







        await tx.articleBlock.deleteMany({



          where: {



            articleId: id,



          },



        });











        /*



         * Replace article/product relations



         */







        await tx.articleProduct.deleteMany({



          where: {



            articleId: id,



          },



        });











        return tx.article.update({



          where: {



            id,



          },







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







            publishedAt:



              parsed.data.status ===



              "PUBLISHED"



                ? article.publishedAt ?? new Date()



                : article.publishedAt,











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



              upsert: {







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











                update: {



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







          },



        });



      }



    );











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











  revalidatePath(



    `/articles/${updated.slug}`



  );











  /*



   * Revalidate old category page



   */







  const oldCategory =



    await prisma.category.findUnique({



      where: {



        id:



          article.categoryId,



      },







      select: {



        slug: true,



      },



    });











  if (oldCategory) {



    revalidatePath(



      `/${oldCategory.slug}`



    );



  }











  /*



   * Revalidate new category page



   */







  const newCategory =



    await prisma.category.findUnique({



      where: {



        id:



          parsed.data.categoryId,



      },







      select: {



        slug: true,



      },



    });











  if (newCategory) {



    revalidatePath(



      `/${newCategory.slug}`



    );



  }











  return {



    ok: true,







    message:



      `Article “${updated.title}” updated.`,



  };



}