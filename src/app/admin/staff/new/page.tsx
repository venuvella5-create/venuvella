import Link from "next/link";

import {
  UserRole,
} from "@prisma/client";

import {
  StaffCreateForm,
} from "@/components/admin/StaffCreateForm";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


export default async function NewStaffPage() {
  await requirePageRole([
    "ADMIN",
  ]);


  const availableAuthors =
    await prisma.author.findMany({
      where: {
        userId:
          null,
      },

      orderBy: {
        name:
          "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
      },
    });


  const roles = [
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
    UserRole.ANALYST,
  ];


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/staff"
          className="admin-link"
        >
          â† Staff
        </Link>


        <div className="mt-4">

          <p className="admin-eyebrow">
            Administration / Staff
          </p>


          <h1 className="display-serif mt-2 text-5xl">
            Add staff member
          </h1>


          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Create a secure staff account,
            assign its role, and optionally
            connect AUTHOR accounts to an
            existing author profile.
          </p>

        </div>


        <section className="mt-10 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

          <StaffCreateForm
            roles={
              roles
            }

            authors={
              availableAuthors
            }
          />

        </section>

      </div>

    </main>
  );
}
