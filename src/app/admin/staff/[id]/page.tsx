import Link from "next/link";
import { notFound } from "next/navigation";

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


  const availableAuthors =
    await prisma.author.findMany({
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
    });


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
          â† Staff
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
              Update account details, role,
              author access, password, and
              account status.
            </p>

          </div>


          <div className="text-sm text-[var(--muted)]">

            <p>
              Created{" "}
              {new Intl.DateTimeFormat(
                "en-US",
                {
                  dateStyle:
                    "medium",
                }
              ).format(
                staffMember.createdAt
              )}
            </p>


            <p className="mt-1">
              Last login:{" "}
              {staffMember.lastLoginAt
                ? new Intl.DateTimeFormat(
                    "en-US",
                    {
                      dateStyle:
                        "medium",

                      timeStyle:
                        "short",
                    }
                  ).format(
                    staffMember.lastLoginAt
                  )
                : "Never"}
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


        <section className="mt-10 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

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

      </div>

    </main>
  );
}
