import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ContentStatus,
} from "@prisma/client";

import {
  EditArticleEditor,
} from "@/components/admin/EditArticleEditor";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


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


export const dynamic =
  "force-dynamic";


function formatDateTime(
  value:
    | Date
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    value
  );
}


function getStatusLabel(
  status: ContentStatus
) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return "Published";

    case ContentStatus.SCHEDULED:
      return "Scheduled";

    case ContentStatus.ARCHIVED:
      return "Archived";

    case ContentStatus.DRAFT:
    default:
      return "Draft";
  }
}


function getStatusClasses(
  status: ContentStatus
) {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case ContentStatus.SCHEDULED:
      return "border-blue-300 bg-blue-50 text-blue-800";

    case ContentStatus.ARCHIVED:
      return "border-slate-300 bg-slate-100 text-slate-700";

    case ContentStatus.DRAFT:
    default:
      return "border-amber-300 bg-amber-50 text-amber-800";
  }
}


export default async function EditArticlePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session =
    await requirePageRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
    ]);


  const {
    id,
  } = await params;


  const isAuthor =
    session.role ===
    "AUTHOR";


  const ownAuthor =
    isAuthor
      ? await prisma.author.findUnique({
          where: {
            userId:
              session.userId,
          },

          select: {
            id: true,
            name: true,
          },
        })
      : null;


  if (
    isAuthor &&
    !ownAuthor
  ) {
    notFound();
  }


  const article =
    await prisma.article.findFirst({
      where: {
        id,

        ...(isAuthor &&
        ownAuthor
          ? {
              authorId:
                ownAuthor.id,
            }
          : {}),
      },

      include: {
        blocks: {
          orderBy: {
            position:
              "asc",
          },
        },

        seo: true,

        author: {
          select: {
            id: true,
            name: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });


  if (!article) {
    notFound();
  }


  const [
    categories,
    authors,
    products,
  ] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        sortOrder:
          "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),


    isAuthor
      ? Promise.resolve(
          ownAuthor
            ? [
                {
                  id:
                    ownAuthor.id,

                  name:
                    ownAuthor.name,
                },
              ]
            : []
        )
      : prisma.author.findMany({
          orderBy: {
            name:
              "asc",
          },

          select: {
            id: true,
            name: true,
          },
        }),


    prisma.product.findMany({
      where: {
        status:
          "PUBLISHED",
      },

      orderBy: {
        name:
          "asc",
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


  const blocks =
    article.blocks.reduce<
      EditorBlock[]
    >(
      (
        result,
        block
      ) => {
        const data =
          block.data as {
            text?: unknown;
            productId?: unknown;
            productIds?: unknown;
          };


        if (
          block.type ===
            "PRODUCT" &&
          typeof data.productId ===
            "string"
        ) {
          result.push({
            type:
              "PRODUCT",

            productId:
              data.productId,
          });


          return result;
        }


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
            productIds.length >
            0
          ) {
            result.push({
              type:
                "PRODUCT_GRID",

              productIds,
            });
          }


          return result;
        }


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


  const productBlockCount =
    blocks.filter(
      (block) =>
        block.type ===
          "PRODUCT" ||
        block.type ===
          "PRODUCT_GRID"
    ).length;


  const publicArticleHref =
    `/articles/${article.slug}`;


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <Link
            href="/admin/articles"
            className="admin-link"
          >
            ← Articles
          </Link>


          {article.status ===
            ContentStatus.PUBLISHED && (
            <Link
              href={
                publicArticleHref
              }
              target="_blank"
              rel="noreferrer"
              className="admin-secondary"
            >
              View published article
            </Link>
          )}

        </div>


        <header className="mt-6 flex flex-wrap items-start justify-between gap-6">

          <div className="max-w-3xl">

            <p className="admin-eyebrow">
              Content / Edit article
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Edit story
            </h1>


            <p className="mt-4 text-xl font-medium">
              {article.title}
            </p>


            <div className="mt-4 flex flex-wrap items-center gap-3">

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusClasses(
                  article.status
                )}`}
              >
                {getStatusLabel(
                  article.status
                )}
              </span>


              <span className="text-sm text-[var(--muted)]">
                {article.category.name}
              </span>


              <span className="text-sm text-[var(--muted)]">
                by{" "}
                {article.author.name}
              </span>

            </div>


            {isAuthor &&
              ownAuthor && (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Editing as{" "}
                <span className="font-medium text-[var(--ink)]">
                  {ownAuthor.name}
                </span>
              </p>
            )}

          </div>

        </header>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Status
            </p>


            <p className="mt-3 font-semibold">
              {getStatusLabel(
                article.status
              )}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Updated
            </p>


            <p className="mt-3 text-sm font-medium">
              {formatDateTime(
                article.updatedAt
              )}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Published
            </p>


            <p className="mt-3 text-sm font-medium">
              {formatDateTime(
                article.publishedAt
              )}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Content blocks
            </p>


            <p className="mt-3 text-2xl font-semibold">
              {blocks.length}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Product blocks
            </p>


            <p className="mt-3 text-2xl font-semibold">
              {productBlockCount}
            </p>

          </div>

        </section>


        {article.status ===
          ContentStatus.DRAFT && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <p className="font-semibold">
              Draft article
            </p>


            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This story is not publicly
              visible yet. Review the
              content, products, SEO, and
              publishing status before
              publishing.
            </p>

          </div>
        )}


        {article.status ===
          ContentStatus.SCHEDULED && (
          <div className="mt-6 rounded-2xl border border-blue-300 bg-blue-50 p-5">

            <p className="font-semibold">
              Scheduled article
            </p>


            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This story is scheduled for
              publication. Review any
              editorial changes carefully
              before saving.
            </p>

          </div>
        )}


        {article.status ===
          ContentStatus.ARCHIVED && (
          <div className="mt-6 rounded-2xl border border-slate-300 bg-slate-100 p-5">

            <p className="font-semibold">
              Archived article
            </p>


            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This story is archived and
              should be treated as
              inactive editorial content.
            </p>

          </div>
        )}


        <section className="mt-8">

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

        </section>

      </div>

    </main>
  );
}