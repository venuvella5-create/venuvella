import Link from "next/link";

import {
  UserRole,
} from "@prisma/client";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


function getRoleLabel(
  role: UserRole
) {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrator";

    case UserRole.EDITOR:
      return "Editor";

    case UserRole.AUTHOR:
      return "Author";

    case UserRole.ANALYST:
      return "Analyst";

    default:
      return role;
  }
}


export default async function StaffPage() {
  await requirePageRole([
    "ADMIN",
  ]);


  const staff =
    await prisma.user.findMany({
      orderBy: [
        {
          isActive:
            "desc",
        },

        {
          role:
            "asc",
        },

        {
          email:
            "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
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


  const activeCount =
    staff.filter(
      (user) =>
        user.isActive
    ).length;


  const inactiveCount =
    staff.length -
    activeCount;


  const adminCount =
    staff.filter(
      (user) =>
        user.role ===
        UserRole.ADMIN
    ).length;


  const editorCount =
    staff.filter(
      (user) =>
        user.role ===
        UserRole.EDITOR
    ).length;


  const authorCount =
    staff.filter(
      (user) =>
        user.role ===
        UserRole.AUTHOR
    ).length;


  const analystCount =
    staff.filter(
      (user) =>
        user.role ===
        UserRole.ANALYST
    ).length;


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Administration / Staff
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Staff accounts
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Manage administrator, editor,
              author, and analyst access for
              the Venuvella admin workspace.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin"
              className="admin-secondary"
            >
              Back to admin
            </Link>


            <Link
              href="/admin/staff/new"
              className="admin-primary"
            >
              + Add staff member
            </Link>

          </div>

        </div>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <p className="admin-eyebrow">
              Total
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {staff.length}
            </p>
          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <p className="admin-eyebrow">
              Active
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {activeCount}
            </p>
          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <p className="admin-eyebrow">
              Admins
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {adminCount}
            </p>
          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <p className="admin-eyebrow">
              Editors
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {editorCount}
            </p>
          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <p className="admin-eyebrow">
              Authors
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {authorCount}
            </p>
          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <p className="admin-eyebrow">
              Analysts
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {analystCount}
            </p>
          </div>

        </section>


        {inactiveCount > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">

            <p className="text-sm text-[var(--muted)]">
              {inactiveCount} inactive staff{" "}
              {inactiveCount === 1
                ? "account is"
                : "accounts are"}{" "}
              currently blocked from logging in.
            </p>

          </div>
        )}


        <section className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

          {staff.length > 0 ? (

            <div className="divide-y divide-[var(--line)]">

              {staff.map(
                (user) => (

                  <div
                    key={user.id}
                    className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="truncate text-lg font-semibold">
                          {user.name ||
                            user.email}
                        </h2>


                        <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {getRoleLabel(
                            user.role
                          )}
                        </span>


                        <span
                          className={
                            user.isActive
                              ? "rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                              : "rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                          }
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>


                      <p className="mt-2 break-all text-sm text-[var(--muted)]">
                        {user.email}
                      </p>


                      {user.author && (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Author profile:{" "}
                          <span className="font-medium text-[var(--ink)]">
                            {user.author.name}
                          </span>
                        </p>
                      )}


                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--muted)]">

                        <span>
                          Created{" "}
                          {new Intl.DateTimeFormat(
                            "en-US",
                            {
                              dateStyle:
                                "medium",
                            }
                          ).format(
                            user.createdAt
                          )}
                        </span>


                        <span>
                          Last login:{" "}
                          {user.lastLoginAt
                            ? new Intl.DateTimeFormat(
                                "en-US",
                                {
                                  dateStyle:
                                    "medium",

                                  timeStyle:
                                    "short",
                                }
                              ).format(
                                user.lastLoginAt
                              )
                            : "Never"}
                        </span>

                      </div>

                    </div>


                    <Link
                      href={`/admin/staff/${user.id}`}
                      className="admin-secondary shrink-0"
                    >
                      Manage
                    </Link>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="p-10 text-center">

              <p className="text-sm text-[var(--muted)]">
                No staff accounts exist yet.
              </p>


              <Link
                href="/admin/staff/new"
                className="admin-primary mt-6 inline-flex"
              >
                Create first staff account
              </Link>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}
