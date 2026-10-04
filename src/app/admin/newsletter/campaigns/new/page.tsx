import Link from "next/link";

import {
  NewsletterCampaignEditor,
} from "@/components/admin/NewsletterCampaignEditor";
import {
  createNewsletterCampaign,
} from "@/app/admin/newsletter/campaigns/actions";
import {
  requirePageRole,
} from "@/lib/auth/require-admin";
import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function NewNewsletterCampaignPage() {
  await requirePageRole([
    "ADMIN",
  ]);

  const [
    articles,
    products,
    latestIssue,
  ] =
    await Promise.all([
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

      prisma.newsletterCampaign.findFirst({
        orderBy: {
          issueNumber:
            "desc",
        },

        select: {
          issueNumber:
            true,
        },
      }),
    ]);

  const nextIssueNumber =
    (
      latestIssue?.issueNumber ??
      0
    ) +
    1;

  return (
    <main className="min-h-screen bg-[#efeee9] py-10">
      <div className="container-shell">
        <Link
          href="/admin/newsletter/campaigns"
          className="admin-link"
        >
          ← Newsletter campaigns
        </Link>

        <div className="mb-8 mt-4">
          <p className="admin-eyebrow">
            Newsletter / New issue
          </p>

          <h1 className="display-serif mt-2 text-5xl">
            Create The Venuvella Edit
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Build the editorial structure,
            select stories and products, and
            prepare the issue for scheduling.
          </p>
        </div>

        <NewsletterCampaignEditor
          mode="create"
          action={
            createNewsletterCampaign
          }
          initial={{
            issueNumber:
              nextIssueNumber,
            subject:
              "",
            previewText:
              "",
            editorialIntro:
              "",
            status:
              "DRAFT",
            scheduledAt:
              "",
            featuredArticleId:
              "",
            articleIds:
              [],
            productIds:
              [],
          }}
          articles={
            articles
          }
          products={
            products
          }
        />
      </div>
    </main>
  );
}
