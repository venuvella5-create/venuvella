import Link from "next/link";

import {
  NewsletterCampaignStatus,
} from "@prisma/client";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";
import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


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


function statusClasses(
  status:
    NewsletterCampaignStatus
) {
  switch (status) {
    case NewsletterCampaignStatus.SCHEDULED:
      return "border-blue-300 bg-blue-50 text-blue-800";

    case NewsletterCampaignStatus.SENT:
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case NewsletterCampaignStatus.ARCHIVED:
      return "border-slate-300 bg-slate-100 text-slate-700";

    case NewsletterCampaignStatus.DRAFT:
    default:
      return "border-amber-300 bg-amber-50 text-amber-800";
  }
}


export default async function NewsletterCampaignsPage() {
  await requirePageRole([
    "ADMIN",
  ]);

  const [
    campaigns,
    confirmedSubscribers,
  ] =
    await Promise.all([
      prisma.newsletterCampaign.findMany({
        orderBy: [
          {
            issueNumber:
              "desc",
          },
          {
            updatedAt:
              "desc",
          },
        ],

        include: {
          featuredArticle: {
            select: {
              title:
                true,
            },
          },

          _count: {
            select: {
              articles:
                true,
              products:
                true,
            },
          },
        },
      }),

      prisma.newsletterSubscriber.count({
        where: {
          confirmedAt: {
            not:
              null,
          },
        },
      }),
    ]);

  const draftCount =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
        NewsletterCampaignStatus.DRAFT
    ).length;

  const scheduledCount =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
        NewsletterCampaignStatus.SCHEDULED
    ).length;

  const sentCount =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
        NewsletterCampaignStatus.SENT
    ).length;

  return (
    <main className="min-h-screen bg-[#efeee9] py-10">
      <div className="container-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="admin-eyebrow">
              Administration / Newsletter
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Newsletter campaigns
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Build, schedule and organize
              issues of The Venuvella Edit.
              Actual email delivery will be
              connected separately.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/newsletter"
              className="admin-secondary"
            >
              Subscribers
            </Link>

            <Link
              href="/admin/newsletter/campaigns/new"
              className="admin-primary"
            >
              New issue
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Confirmed audience"
            value={
              confirmedSubscribers
            }
          />

          <Stat
            label="Drafts"
            value={
              draftCount
            }
          />

          <Stat
            label="Scheduled"
            value={
              scheduledCount
            }
          />

          <Stat
            label="Sent"
            value={
              sentCount
            }
          />
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="admin-eyebrow">
                Issues
              </p>

              <h2 className="display-serif mt-2 text-3xl">
                The Venuvella Edit
              </h2>
            </div>

            <p className="text-sm text-[var(--muted)]">
              {campaigns.length}{" "}
              {campaigns.length === 1
                ? "issue"
                : "issues"}
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {campaigns.length >
            0 ? (
              <div className="divide-y divide-[var(--line)]">
                {campaigns.map(
                  (campaign) => (
                    <Link
                      key={
                        campaign.id
                      }
                      href={`/admin/newsletter/campaigns/${campaign.id}`}
                      className="grid gap-5 p-5 transition hover:bg-[#f7f6f2] lg:grid-cols-[100px_minmax(0,1.5fr)_minmax(180px,0.7fr)_minmax(170px,0.7fr)] lg:items-center"
                    >
                      <div>
                        <p className="admin-eyebrow">
                          Issue
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          #
                          {String(
                            campaign.issueNumber
                          ).padStart(
                            3,
                            "0"
                          )}
                        </p>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-semibold">
                            {
                              campaign.subject
                            }
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses(
                              campaign.status
                            )}`}
                          >
                            {
                              campaign.status
                            }
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[var(--muted)]">
                          {
                            campaign.campaignKey
                          }
                          {" · "}
                          {
                            campaign._count
                              .articles
                          }{" "}
                          articles
                          {" · "}
                          {
                            campaign._count
                              .products
                          }{" "}
                          products
                        </p>

                        {campaign.featuredArticle && (
                          <p className="mt-2 text-xs text-[var(--muted)]">
                            Lead:{" "}
                            {
                              campaign.featuredArticle
                                .title
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="admin-eyebrow">
                          Scheduled
                        </p>

                        <p className="mt-2 text-sm">
                          {formatDate(
                            campaign.scheduledAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="admin-eyebrow">
                          Updated
                        </p>

                        <p className="mt-2 text-sm">
                          {formatDate(
                            campaign.updatedAt
                          )}
                        </p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            ) : (
              <div className="p-10">
                <p className="font-semibold">
                  No newsletter issues yet.
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Create Issue #001 to begin
                  building your first weekly
                  edition.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}


function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
      <p className="admin-eyebrow">
        {label}
      </p>

      <p className="display-serif mt-3 text-4xl">
        {value}
      </p>
    </div>
  );
}
