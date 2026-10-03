import Link from "next/link";

import {
  Prisma,
} from "@prisma/client";

import {
  revalidatePath,
} from "next/cache";

import {
  requirePageRole,
  requireRole,
} from "@/lib/auth/require-admin";

import {
  prisma,
} from "@/lib/db/prisma";


export const dynamic =
  "force-dynamic";


function normalizeSlug(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


async function createAuthorAction(
  formData: FormData
) {
  "use server";


  await requireRole([
    "ADMIN",
  ]);


  const name =
    String(
      formData.get(
        "name"
      ) ?? ""
    ).trim();


  const rawSlug =
    String(
      formData.get(
        "slug"
      ) ?? ""
    );


  const slug =
    normalizeSlug(
      rawSlug ||
      name
    );


  const bio =
    String(
      formData.get(
        "bio"
      ) ?? ""
    ).trim();


  if (
    !name ||
    !slug
  ) {
    return;
  }


  try {
    await prisma.author.create({
      data: {
        name,
        slug,

        bio:
          bio ||
          null,
      },
    });
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2002"
    ) {
      throw new Error(
        "An author with this slug already exists."
      );
    }


    throw error;
  }


  revalidatePath(
    "/admin/authors"
  );

  revalidatePath(
    "/admin/staff/new"
  );
}


export default async function AuthorsPage() {
  await requirePageRole([
    "ADMIN",
  ]);


  const authors =
    await prisma.author.findMany({
      orderBy: {
        name:
          "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        userId: true,

        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },

        _count: {
          select: {
            articles:
              true,
          },
        },
      },
    });


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Administration / Authors
            </p>


            <h1 className="display-serif mt-2 text-5xl">
              Author profiles
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Create and review editorial
              author profiles. Unlinked
              profiles can be assigned to
              AUTHOR staff accounts.
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
              href="/admin/staff"
              className="admin-secondary"
            >
              Staff
            </Link>

          </div>

        </div>


        <section className="mt-10 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            New author
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Create author profile
          </h2>


          <form
            action={
              createAuthorAction
            }
            className="mt-6 space-y-6"
          >

            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Name
              </label>


              <input
                id="name"
                name="name"
                type="text"
                required
                className="admin-input w-full"
                placeholder="Test Author"
              />

            </div>


            <div>

              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium"
              >
                Slug
              </label>


              <input
                id="slug"
                name="slug"
                type="text"
                className="admin-input w-full"
                placeholder="test-author"
              />


              <p className="mt-2 text-xs text-[var(--muted)]">
                Leave blank to generate it
                automatically from the name.
              </p>

            </div>


            <div>

              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium"
              >
                Bio
              </label>


              <textarea
                id="bio"
                name="bio"
                rows={5}
                className="admin-input w-full"
                placeholder="Optional author biography"
              />

            </div>


            <button
              type="submit"
              className="admin-primary"
            >
              Create author profile
            </button>

          </form>

        </section>


        <section className="mt-10">

          <div>

            <p className="admin-eyebrow">
              Directory
            </p>


            <h2 className="display-serif mt-2 text-3xl">
              Existing authors
            </h2>

          </div>


          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">

            {authors.length > 0 ? (

              <div className="divide-y divide-[var(--line)]">

                {authors.map(
                  (author) => (

                    <div
                      key={author.id}
                      className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-semibold">
                            {author.name}
                          </h3>


                          <span
                            className={
                              author.user
                                ? "rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                                : "rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                            }
                          >
                            {author.user
                              ? "Linked"
                              : "Available"}
                          </span>

                        </div>


                        <p className="mt-2 text-sm text-[var(--muted)]">
                          /{author.slug}
                        </p>


                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Articles:{" "}
                          {
                            author._count
                              .articles
                          }
                        </p>


                        {author.user && (
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            Staff account:{" "}
                            <span className="font-medium text-[var(--ink)]">
                              {author.user.email}
                            </span>
                          </p>
                        )}

                      </div>


                      {author.user ? (
                        <Link
                          href={`/admin/staff/${author.user.id}`}
                          className="admin-secondary shrink-0"
                        >
                          Manage staff link
                        </Link>
                      ) : (
                        <Link
                          href="/admin/staff/new"
                          className="admin-primary shrink-0"
                        >
                          Assign to staff
                        </Link>
                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="p-10 text-sm text-[var(--muted)]">
                No author profiles exist yet.
              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}