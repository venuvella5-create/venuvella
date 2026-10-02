"use client";

import Link from "next/link";

import {
  useActionState,
  useMemo,
  useState,
} from "react";

import {
  UserRole,
} from "@prisma/client";

import {
  createStaffAction,
  type StaffActionState,
} from "@/app/admin/staff/actions";


type StaffCreateFormProps = {
  roles: UserRole[];

  authors: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};


const initialState: StaffActionState = {
  ok: false,
  message: "",
};


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


export function StaffCreateForm({
  roles,
  authors,
}: StaffCreateFormProps) {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    createStaffAction,
    initialState
  );


  const [
    selectedRole,
    setSelectedRole,
  ] = useState<UserRole>(
    UserRole.EDITOR
  );


  const isAuthor =
    selectedRole ===
    UserRole.AUTHOR;


  const authorOptions =
    useMemo(
      () =>
        authors.map(
          (author) => ({
            ...author,

            label:
              `${author.name} (${author.slug})`,
          })
        ),
      [
        authors,
      ]
    );


  return (
    <form
      action={formAction}
      className="space-y-6"
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
          autoComplete="name"
          className="admin-input w-full"
          placeholder="Jane Smith"
        />

      </div>


      <div>

        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>


        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="admin-input w-full"
          placeholder="jane@venuvella.com"
        />

      </div>


      <div>

        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium"
        >
          Temporary password
        </label>


        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="admin-input w-full"
          placeholder="Minimum 12 characters"
        />


        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          The password is hashed before
          storage. Use at least 12
          characters.
        </p>

      </div>


      <div>

        <label
          htmlFor="role"
          className="mb-2 block text-sm font-medium"
        >
          Role
        </label>


        <select
          id="role"
          name="role"
          value={selectedRole}
          onChange={(event) =>
            setSelectedRole(
              event.target.value as UserRole
            )
          }
          className="admin-input w-full"
        >

          {roles.map(
            (role) => (

              <option
                key={role}
                value={role}
              >
                {getRoleLabel(
                  role
                )}
              </option>

            )
          )}

        </select>

      </div>


      {isAuthor && (
        <div>

          <label
            htmlFor="authorId"
            className="mb-2 block text-sm font-medium"
          >
            Author profile
          </label>


          <select
            id="authorId"
            name="authorId"
            required
            className="admin-input w-full"
            defaultValue=""
          >

            <option
              value=""
              disabled
            >
              Select author profile
            </option>


            {authorOptions.map(
              (author) => (

                <option
                  key={author.id}
                  value={author.id}
                >
                  {author.label}
                </option>

              )
            )}

          </select>


          {authorOptions.length === 0 && (
            <p className="mt-2 text-xs leading-5 text-amber-700">
              No unlinked author profiles
              are currently available.
            </p>
          )}

        </div>
      )}


      {state.message && (
        <div
          className={
            state.ok
              ? "rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm"
              : "rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm"
          }
        >
          {state.message}
        </div>
      )}


      <div className="flex flex-wrap gap-3">

        <button
          type="submit"
          disabled={
            pending ||
            (
              isAuthor &&
              authorOptions.length === 0
            )
          }
          className="admin-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Creating..."
            : "Create staff account"}
        </button>


        <Link
          href="/admin/staff"
          className="admin-secondary"
        >
          Cancel
        </Link>

      </div>

    </form>
  );
}