import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { EditArticleEditor } from "@/components/admin/EditArticleEditor";


const textBlockTypes = [
  "PARAGRAPH",
  "HEADING",
  "QUOTE",
  "BULLET_LIST",
  "NUMBERED_LIST",
] as const;


type TextBlockType =
  (typeof textBlockTypes)[number];


type EditorTextBlock = {
  type: TextBlockType;
  text: string;
};


type EditorProductBlock = {
  type: "PRODUCT";
  productId: string;
};


type EditorProductGridBlock = {
  type: "PRODUCT_GRID";
  productIds: string[];
};


type EditorBlock =
  | EditorTextBlock
  | EditorProductBlock
  | EditorProductGridBlock;


export default async function EditArticlePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;


  const [
    article,
    categories,
    authors,
    products,
  ] = await Promise.all([

    prisma.article.findUnique({
      where: {
        id,
      },

      include: {
        blocks: {
          orderBy: {
            position: "asc",
          },
        },

        seo: true,
      },
    }),


    prisma.category.findMany({
      orderBy: {
        sortOrder: "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),


    prisma.author.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),


    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        editorialSummary: true,

        brand: {
          select: {
            name: true,
          },
        },

        category: {
          select: {
            name: true,
          },
        },
      },
    }),

  ]);


  if (!article) {
    notFound();
  }


  const blocks =
    article.blocks.reduce<EditorBlock[]>(
      (result, block) => {

        const data =
          block.data as {
            text?: unknown;
            productId?: unknown;
            productIds?: unknown;
          };


        /*
         * PRODUCT
         */

        if (
          block.type === "PRODUCT" &&
          typeof data.productId ===
            "string"
        ) {
          result.push({
            type: "PRODUCT",
            productId:
              data.productId,
          });

          return result;
        }


        /*
         * PRODUCT GRID
         */

        if (
          block.type ===
            "PRODUCT_GRID" &&
          Array.isArray(
            data.productIds
          )
        ) {
          const productIds =
            data.productIds.filter(
              (
                productId
              ): productId is string =>
                typeof productId ===
                  "string" &&
                productId.length >
                  0
            );


          if (
            productIds.length > 0
          ) {
            result.push({
              type:
                "PRODUCT_GRID",

              productIds,
            });
          }


          return result;
        }


        /*
         * TEXT BLOCK
         */

        const isTextBlock =
          (
            textBlockTypes as readonly string[]
          ).includes(
            block.type
          );


        if (
          isTextBlock &&
          typeof data.text ===
            "string"
        ) {
          result.push({
            type:
              block.type as TextBlockType,

            text:
              data.text,
          });
        }


        return result;
      },
      []
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/articles"
          className="admin-link"
        >
          ← Articles
        </Link>


        <div className="mb-8 mt-4">

          <p className="admin-eyebrow">
            Content / Edit article
          </p>

          <h1 className="display-serif text-5xl">
            Edit story
          </h1>

        </div>


        <EditArticleEditor
          article={{
            id:
              article.id,

            title:
              article.title,

            slug:
              article.slug,

            subtitle:
              article.subtitle,

            excerpt:
              article.excerpt,

            featuredImage:
              article.featuredImage,

            categoryId:
              article.categoryId,

            authorId:
              article.authorId,

            status:
              article.status,

            seoTitle:
              article.seo?.title ??
              "",

            seoDescription:
              article.seo
                ?.description ??
              "",

            blocks,
          }}

          categories={
            categories
          }

          authors={
            authors
          }

          products={
            products
          }
        />

      </div>

    </main>
  );
}