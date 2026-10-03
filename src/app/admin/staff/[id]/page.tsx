import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  UserRole,
} from "@prisma/client";

import {
  StaffEditForm,
} from "@/components/admin/StaffEditForm";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


function formatDateTime(
  value: Date | null
) {
  if (!value) {
    return "Never";
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


function getAuditLabel(
  action: string
) {
  switch (action) {
    case "ADMIN_LOGIN_SUCCESS":
      return "Successful login";

    case "ADMIN_PASSWORD_CHANGED":
      return "Password changed";

    case "ADMIN_SESSIONS_REVOKED":
      return "Sessions revoked";

    case "ADMIN_LOGIN_FAILED":
      return "Failed login";

    default:
      return action
        .replaceAll(
          "_",
          " "
        )
        .toLowerCase()
        .replace(
          /^./,
          (character) =>
            character.toUpperCase()
        );
  }
}


export default async function EditStaffPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session =
    await requirePageRole([
      "ADMIN",
    ]);


  const {
    id,
  } = await params;


  const staffMember =
    await prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        mustChangePassword: true,
        sessionVersion: true,
        createdAt: true,

        author: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });


  if (!staffMember) {
    notFound();
  }


  const [
    availableAuthors,
    recentSecurityEvents,
  ] = await Promise.all([
    prisma.author.findMany({
      where: {
        OR: [
          {
            userId:
              null,
          },

          {
            userId:
              staffMember.id,
          },
        ],
      },

      orderBy: {
        name:
          "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        userId: true,
      },
    }),

    prisma.auditLog.findMany({
      where: {
        OR: [
          {
            userId:
              staffMember.id,
          },

          {
            entity:
              "USER",

            entityId:
              staffMember.id,
          },
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take:
        10,

      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
      },
    }),
  ]);


  const roles = [
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
    UserRole.ANALYST,
  ];


  const masterAdminEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase() ??
    null;


  const isMasterAdmin =
    masterAdminEmail !==
      null &&
    staffMember.email
      .trim()
      .toLowerCase() ===
      masterAdminEmail;


  const isCurrentUser =
    session.userId ===
    staffMember.id;


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/staff"
          className="admin-link"
        >
          ← Staff
        </Link>


        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Administration / Staff
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Manage staff member
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Update account details,
              permissions, password security,
              sessions, and account status.
            </p>

          </div>


          <div className="text-sm text-[var(--muted)]">

            <p>
              Created{" "}
              {formatDateTime(
                staffMember.createdAt
              )}
            </p>


            <p className="mt-1">
              Last login:{" "}
              {formatDateTime(
                staffMember.lastLoginAt
              )}
            </p>

          </div>

        </div>


        {isMasterAdmin && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">

            <p className="text-sm leading-6 text-[var(--muted)]">
              This is the environment-backed
              master administrator. Its ADMIN
              role cannot be removed and the
              account cannot be deactivated.
            </p>

          </div>
        )}


        {isCurrentUser && (
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-4">

            <p className="text-sm leading-6 text-[var(--muted)]">
              This is your current account.
              You cannot remove your own
              administrator role or deactivate
              yourself.
            </p>

          </div>
        )}


        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Account status
            </p>


            <p className="mt-3 text-lg font-semibold">
              {staffMember.isActive
                ? "Active"
                : "Inactive"}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Password change
            </p>


            <p className="mt-3 text-lg font-semibold">
              {staffMember.mustChangePassword
                ? "Required"
                : "Not required"}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Password changed
            </p>


            <p className="mt-3 text-sm font-medium leading-6">
              {formatDateTime(
                staffMember.passwordChangedAt
              )}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Last login
            </p>


            <p className="mt-3 text-sm font-medium leading-6">
              {formatDateTime(
                staffMember.lastLoginAt
              )}
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Session version
            </p>


            <p className="mt-3 text-lg font-semibold">
              {staffMember.sessionVersion}
            </p>

          </div>

        </section>


        <section className="mt-8 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

          <StaffEditForm
            staffMember={{
              id:
                staffMember.id,

              name:
                staffMember.name,

              email:
                staffMember.email,

              role:
                staffMember.role,

              isActive:
                staffMember.isActive,

              authorId:
                staffMember.author?.id ??
                null,
            }}

            roles={
              roles
            }

            authors={
              availableAuthors.map(
                (author) => ({
                  id:
                    author.id,

                  name:
                    author.name,

                  slug:
                    author.slug,
                })
              )
            }

            isMasterAdmin={
              isMasterAdmin
            }

            isCurrentUser={
              isCurrentUser
            }
          />

        </section>


        <section className="mt-8 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Security history
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Recent security events
          </h2>


          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Recent authentication, password,
            and session activity associated
            with this staff account.
          </p>


          {recentSecurityEvents.length ===
          0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] p-5">

              <p className="text-sm text-[var(--muted)]">
                No security events have been
                recorded for this account yet.
              </p>

            </div>
          ) : (
            <div className="mt-6 divide-y divide-[var(--line)]">

              {recentSecurityEvents.map(
                (event) => (

                  <div
                    key={event.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-4"
                  >

                    <div>

                      <p className="font-medium">
                        {getAuditLabel(
                          event.action
                        )}
                      </p>


                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                        {event.entity}
                      </p>

                    </div>


                    <div className="text-right">

                      <p className="text-sm text-[var(--muted)]">
                        {formatDateTime(
                          event.createdAt
                        )}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}