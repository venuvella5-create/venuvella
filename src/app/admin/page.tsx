import Link from "next/link";
import {
  logoutAdminAction,
} from "@/app/admin/login/actions";
import {
  requirePageRole,
} from "@/lib/auth/require-admin";
import {
  prisma,
} from "@/lib/db/prisma";

export const dynamic =

  "force-dynamic";
function getRoleLabel(
  role:
    | "ADMIN"
    | "EDITOR"
    | "AUTHOR"
    | "ANALYST"
) {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "EDITOR":
      return "Editor";
    case "AUTHOR":
      return "Author";
    case "ANALYST":
      return "Analyst";
    default:
      return role;
  }

}
function formatDateTime(
  value: Date
) {

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

function DashboardCard({
  href,
  eyebrow,
  title,
  description,
  value,

}: {
  href?: string;
  eyebrow: string;
  title: string;
  description: string;
  value?: number | null;
}) {

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="admin-eyebrow">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            {title}
          </h3>
        </div>

        {value !==
          undefined &&
          value !==
            null && (
          <p className="text-3xl font-semibold">
            {value}
          </p>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>

      {href && (
        <p className="mt-5 text-sm font-medium">
          Open →
        </p>
      )}
    </>
  );


  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
      >

        {content}
      </Link>
    );
  }


  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      {content}
    </div>
  );
}

export default async function AdminDashboardPage() {

  const session =
    await requirePageRole([
      "ADMIN",
      "EDITOR",
      "AUTHOR",
      "ANALYST",

    ]);

  const isAdmin =
    session.role ===
    "ADMIN";

  const isEditor =
    session.role ===
    "EDITOR";

  const isAuthor =
    session.role ===
    "AUTHOR";

  const isAnalyst =
    session.role ===
    "ANALYST";

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

  const articleWhere =
    isAuthor
      ? ownAuthor
        ? {
            authorId:
            ownAuthor.id,
          }

        : {
            id: {
              equals:
                "__no_article__",
            },
          }
      : undefined;

  const [
    articleCount,
    recentArticles,
    productCount,
    clickCount,
    providerCount,
    staffCount,
    authorCount,
    newsletterSubscriberCount,
  ] = await Promise.all([
    prisma.article.count({
      where:
        articleWhere,

    }),

    prisma.article.findMany({
      where:
        articleWhere,
      orderBy: {
        updatedAt:
          "desc",
      },

      take:
        5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        author: {
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

    isAdmin ||
    isEditor
      ? prisma.product.count()
      : Promise.resolve(
          null
        ),
    isAdmin ||
    isAnalyst
      ? prisma.affiliateClick.count()
      : Promise.resolve(
          null
        ),

    isAdmin
      ? prisma.affiliateProvider.count()
      : Promise.resolve(
          null
        ),


    isAdmin
      ? prisma.user.count()
      : Promise.resolve(
          null
        ),


    isAdmin
      ? prisma.author.count()
      : Promise.resolve(
          null
        ),

    isAdmin
      ? prisma.newsletterSubscriber.count()
      : Promise.resolve(
          null
        ),
  ]);


  const canManageContent =
    isAdmin ||
    isEditor ||
    isAuthor;


  const canManageProducts =
    isAdmin ||
    isEditor;


  const canViewAnalytics =
    isAdmin ||
    isAnalyst;

  return (
    <main className="min-h-screen bg-[#efeee9] py-10">
      <div className="container-shell">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="admin-eyebrow">
              Venuvella administration
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              Dashboard
            </h1>


            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <span>
                Signed in as
              </span>
              <span className="font-medium text-[var(--ink)]">
                {session.email}
              </span>
              <span>
                ·
              </span>

              <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                {getRoleLabel(
                  session.role
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="admin-secondary"
            >
              View site
            </Link>
            <form
              action={
                logoutAdminAction
              }
            >
              <button
                type="submit"
                className="admin-secondary"
              >
                Log out
              </button>
            </form>
          </div>
        </header>
        {isAuthor &&
          !ownAuthor && (

          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <p className="font-semibold">
              Author profile required
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Your account is not linked
              to an author profile yet.
              An administrator must link
              your account before you can
              create or edit articles.
            </p>
          </div>
        )}


        <section className="mt-10">
          <div>
            <p className="admin-eyebrow">
              Overview
            </p>
            <h2 className="display-serif mt-2 text-3xl">
              Workspace summary
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <DashboardCard
              eyebrow={
                isAuthor
                  ? "Your content"
                  : "Editorial"
              }

              title="Articles"
              description={
                isAuthor
                  ? "Articles assigned to your author profile."
                  : "Editorial content currently stored in Venuvella."
              }

              value={
                articleCount
              }

              href={
                canManageContent
                  ? "/admin/articles"
                  : undefined
              }

            />

            {productCount !==
              null && (
              <DashboardCard
                eyebrow="Commerce"
                title="Products"
                description="Products available in the central editorial catalog."
                value={
                  productCount
                }
                href="/admin/products"
              />
            )}

            {clickCount !==
              null && (
              <DashboardCard
                eyebrow="Performance"
                title="Affiliate clicks"
                description="Tracked affiliate click activity across Venuvella."
                value={
                  clickCount
                }
                href="/admin/analytics"
              />
            )}

            {providerCount !==

              null && (
              <DashboardCard
                eyebrow="Infrastructure"
                title="Providers"
                description="Configured affiliate and commerce providers."
                value={
                  providerCount
                }
                href="/admin/providers"

              />

            )}


            {staffCount !==
              null && (
              <DashboardCard
                eyebrow="Access"
                title="Staff"
                description="Administrator, editor, author, and analyst accounts."
                value={
                  staffCount
                }
                href="/admin/staff"
              />

            )}

            {newsletterSubscriberCount !==
              null && (
              <DashboardCard
                eyebrow="Audience"
                title="Newsletter"
                description="Subscribers currently captured through the Venuvella newsletter."
                value={
                  newsletterSubscriberCount
                }
                href="/admin/newsletter"
              />
            )}


          </div>
        </section>
        <section className="mt-12">
          <div>

            <p className="admin-eyebrow">
              Workspace
            </p>
            <h2 className="display-serif mt-2 text-3xl">
              Your tools
            </h2>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              The tools below are shown
              according to your current
              staff role and permissions.
            </p>

          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {canManageContent && (
              <DashboardCard
                eyebrow="Editorial"
                title="Articles"
                description={
                  isAuthor
                    ? "Create and manage articles assigned to your author profile."
                    : "Create, review, publish, and manage editorial content."
                }
                href="/admin/articles"
              />
            )}


            {canManageProducts && (
              <DashboardCard
                eyebrow="Catalog"
                title="Products"
                description="Manage the central product catalog, product data, and commerce relationships."
                href="/admin/products"
              />

            )}

            {canViewAnalytics && (
              <DashboardCard
                eyebrow="Reporting"
                title="Analytics"
                description="Review affiliate click activity, traffic data, and performance signals."
                href="/admin/analytics"
              />

            )}

            {isAdmin && (
              <>
                <DashboardCard
                  eyebrow="Team"
                  title="Staff"
                  description="Manage staff accounts, roles, passwords, access, and security."
                  value={
                    staffCount
                  }
                  href="/admin/staff"
                />

                <DashboardCard
                  eyebrow="Editorial"
                  title="Authors"
                  description="Manage author profiles and connect authors to staff accounts."
                  value={
                    authorCount
                  }
                  href="/admin/authors"

                />

                <DashboardCard
                  eyebrow="Audience"
                  title="Newsletter"
                  description="Review subscribers, filter confirmation status, and export the newsletter audience."
                  value={
                    newsletterSubscriberCount
                  }
                  href="/admin/newsletter"
                />

                <DashboardCard
                  eyebrow="Commerce"
                  title="Providers"
                  description="Configure affiliate providers and their integration settings."
                  value={
                    providerCount
                  }
                  href="/admin/providers"
                />

                <DashboardCard
                  eyebrow="Automation"
                  title="Provider sync"
                  description="Run provider synchronization and review recent synchronization activity."
                  href="/admin/provider-sync"
                />

                <DashboardCard
                  eyebrow="Automation"
                  title="Scheduler"
                  description="Manage automatic provider synchronization schedules and jobs."
                  href="/admin/provider-sync/scheduler"
                />

                <DashboardCard
                  eyebrow="Infrastructure"
                  title="Affiliate operations"
                  description="Monitor affiliate infrastructure, redirects, provider health, and operations."
                  href="/admin/affiliate-ops"
                />
              </>
            )}

          </div>
        </section>

        {isAdmin && (

          <section className="mt-12">
            <div>
              <p className="admin-eyebrow">
                Quick actions
              </p>

              <h2 className="display-serif mt-2 text-3xl">
                Common tasks
              </h2>
            </div>


            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/admin/articles/new"
                className="admin-primary"
              >

                + New article
              </Link>

              <Link
                href="/admin/staff/new"
                className="admin-secondary"
              >

                + Add staff
              </Link>

              <Link
                href="/admin/authors"
                className="admin-secondary"
              >
                Manage authors
              </Link>

              <Link
                href="/admin/newsletter"
                className="admin-secondary"
              >
                Manage newsletter
              </Link>

              <Link
                href="/admin/provider-sync"
                className="admin-secondary"
              >
                Run provider sync
              </Link>

            </div>

          </section>

        )}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="admin-eyebrow">
                Content
              </p>

              <h2 className="display-serif mt-2 text-3xl">
                Recent articles
              </h2>
            </div>

            {canManageContent && (
              <Link
                href="/admin/articles"
                className="admin-link"
              >
                View all articles →
              </Link>
            )}

          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {recentArticles.length >
            0 ? (
              <div className="divide-y divide-[var(--line)]">
                {recentArticles.map(

                  (article) => (
                    <Link
                      key={
                        article.id
                      }
                      href={`/admin/articles/${article.id}`}
                      className="block p-5 transition hover:bg-[var(--paper)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {article.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            {article.author.name}
                            {" · "}
                            {article.category.name}
                          </p>

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Updated{" "}
                            {formatDateTime(
                              article.updatedAt
                            )}
                          </p>

                        </div>

                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {article.status}
                        </span>
                      </div>
                    </Link>

                  )
                )}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-[var(--muted)]">
                  No articles are available
                  for this account yet.
                </p>

                {canManageContent &&
                  (
                    !isAuthor ||
                    ownAuthor
                  ) && (
                  <Link
                    href="/admin/articles/new"
                    className="admin-primary mt-6 inline-flex"
                  >
                    Create an article
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}