import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  NewsletterCampaignStatus,
} from "@prisma/client";

import {
  NewsletterCampaignEditor,
} from "@/components/admin/NewsletterCampaignEditor";
import {
  updateNewsletterCampaign,
} from "@/app/admin/newsletter/campaigns/actions";
import {
  requirePageRole,
} from "@/lib/auth/require-admin";
import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


function toLocalDateTimeInput(
  value:
    Date |
    null
) {
  if (!value) {
    return "";
  }

  const local =
    new Date(
      value.getTime() -
        value.getTimezoneOffset() *
          60_000
    );

  return local
    .toISOString()
    .slice(
      0,
      16
    );
}


function formatDate(
  value:
    Date |
    null
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


export default async function EditNewsletterCampaignPage({
  params,
}: {
  params:
    Promise<{
      id: string;
    }>;
}) {
  await requirePageRole([
    "ADMIN",
  ]);

  const {
    id,
  } =
    await params;

  const [
    campaign,
    articles,
    products,
  ] =
    await Promise.all([
      prisma.newsletterCampaign.findUnique({
        where: {
          id,
        },

        include: {
          articles: {
            orderBy: {
              position:
                "asc",
            },

            select: {
              articleId:
                true,
            },
          },

          products: {
            orderBy: {
              position:
                "asc",
            },

            select: {
              productId:
                true,
            },
          },
        },
      }),

      prisma.article.findMany({
        where: {
          status:
            "PUBLISHED",

          publishedAt: {
            lte:
              new Date(),
          },
        },

        orderBy: {
          publishedAt:
            "desc",
        },

        select: {
          id:
            true,
          title:
            true,
          slug:
            true,

          category: {
            select: {
              name:
                true,
            },
          },
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
          id:
            true,
          name:
            true,
          slug:
            true,

          brand: {
            select: {
              name:
                true,
            },
          },

          category: {
            select: {
              name:
                true,
            },
          },
        },
      }),
    ]);

  if (!campaign) {
    notFound();
  }

  const locked =
    campaign.status ===
      NewsletterCampaignStatus.SENT ||
    Boolean(
      campaign.sentAt
    );

  return (
    <main className="min-h-screen bg-[#efeee9] py-10">
      <div className="container-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/newsletter/campaigns"
            className="admin-link"
          >
            ← Newsletter campaigns
          </Link>

          <span className="text-sm text-[var(--muted)]">
            {campaign.campaignKey}
          </span>
        </div>

        <header className="mt-6">
          <p className="admin-eyebrow">
            Newsletter / Issue #
            {String(
              campaign.issueNumber
            ).padStart(
              3,
              "0"
            )}
          </p>

          <h1 className="display-serif mt-2 text-5xl">
            {campaign.subject}
          </h1>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            <span>
              Status:{" "}
              <strong className="text-[var(--ink)]">
                {campaign.status}
              </strong>
            </span>

            <span>
              Scheduled:{" "}
              <strong className="text-[var(--ink)]">
                {formatDate(
                  campaign.scheduledAt
                )}
              </strong>
            </span>

            <span>
              Sent:{" "}
              <strong className="text-[var(--ink)]">
                {formatDate(
                  campaign.sentAt
                )}
              </strong>
            </span>
          </div>
        </header>

        {locked ? (
          <section className="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6">
            <p className="admin-eyebrow">
              Sent issue
            </p>

            <h2 className="display-serif mt-2 text-3xl">
              This campaign is locked
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Sent newsletter issues are kept
              immutable so the saved campaign
              continues to match what readers
              received.
            </p>
          </section>
        ) : (
          <div className="mt-8">
            <NewsletterCampaignEditor
              mode="edit"
              action={
                updateNewsletterCampaign
              }
              initial={{
                id:
                  campaign.id,
                issueNumber:
                  campaign.issueNumber,
                subject:
                  campaign.subject,
                previewText:
                  campaign.previewText ??
                  "",
                editorialIntro:
                  campaign.editorialIntro ??
                  "",
                status:
                  campaign.status,
                scheduledAt:
                  toLocalDateTimeInput(
                    campaign.scheduledAt
                  ),
                featuredArticleId:
                  campaign.featuredArticleId ??
                  "",
                articleIds:
                  campaign.articles.map(
                    (
                      item
                    ) =>
                      item.articleId
                  ),
                productIds:
                  campaign.products.map(
                    (
                      item
                    ) =>
                      item.productId
                  ),
              }}
              articles={
                articles
              }
              products={
                products
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}
