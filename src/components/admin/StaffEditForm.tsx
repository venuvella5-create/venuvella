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
  setStaffActiveAction,
  type StaffActionState,
  updateStaffAction,
} from "@/app/admin/staff/actions";


type StaffEditFormProps = {
  staffMember: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    isActive: boolean;
    authorId: string | null;
  };

  roles: UserRole[];

  authors: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  isMasterAdmin: boolean;
  isCurrentUser: boolean;
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


export function StaffEditForm({
  staffMember,
  roles,
  authors,
  isMasterAdmin,
  isCurrentUser,
}: StaffEditFormProps) {
  const [
    updateState,
    updateAction,
    updatePending,
  ] = useActionState(
    updateStaffAction,
    initialState
  );


  const [
    activeState,
    activeAction,
    activePending,
  ] = useActionState(
    setStaffActiveAction,
    initialState
  );


  const [
    selectedRole,
    setSelectedRole,
  ] = useState<UserRole>(
    staffMember.role
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
    <div className="space-y-8">

      <form
        action={updateAction}
        className="space-y-6"
      >

        <input
          type="hidden"
          name="userId"
          value={staffMember.id}
        />


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
            defaultValue={
              staffMember.name ??
              ""
            }
            className="admin-input w-full"
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
            defaultValue={
              staffMember.email
            }
            className="admin-input w-full"
          />

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
                event.target
                  .value as UserRole
              )
            }
            disabled={
              isMasterAdmin
            }
            className="admin-input w-full disabled:cursor-not-allowed disabled:opacity-60"
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


          {isMasterAdmin && (
            <>
              <input
                type="hidden"
                name="role"
                value={
                  UserRole.ADMIN
                }
              />

              <p className="mt-2 text-xs text-[var(--muted)]">
                The master administrator
                must remain ADMIN.
              </p>
            </>
          )}

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
              defaultValue={
                staffMember.authorId ??
                ""
              }
              className="admin-input w-full"
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


            {authorOptions.length ===
              0 && (
              <p className="mt-2 text-xs text-amber-700">
                No author profiles are
                available for this account.
              </p>
            )}

          </div>
        )}


        <div>

          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium"
          >
            Reset password
          </label>


          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            className="admin-input w-full"
            placeholder="Leave blank to keep current password"
          />


          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Enter a new password only when
            you want to reset this account.
            New passwords must contain at
            least 12 characters.
          </p>

        </div>


        {updateState.message && (
          <div
            className={
              updateState.ok
                ? "rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm"
                : "rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm"
            }
          >
            {updateState.message}
          </div>
        )}


        <div className="flex flex-wrap gap-3">

          <button
            type="submit"
            disabled={
              updatePending ||
              (
                isAuthor &&
                authorOptions.length === 0
              )
            }
            className="admin-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updatePending
              ? "Saving..."
              : "Save changes"}
          </button>


          <Link
            href="/admin/staff"
            className="admin-secondary"
          >
            Cancel
          </Link>

        </div>

      </form>


      <div className="border-t border-[var(--line)] pt-8">

        <p className="admin-eyebrow">
          Account status
        </p>


        <h2 className="display-serif mt-2 text-3xl">
          {staffMember.isActive
            ? "Active account"
            : "Inactive account"}
        </h2>


        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          {staffMember.isActive
            ? "This staff member can currently authenticate and use the permissions assigned to their role."
            : "This staff member is blocked from normal database-backed login."}
        </p>


        {activeState.message && (
          <div
            className={
              activeState.ok
                ? "mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm"
                : "mt-5 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm"
            }
          >
            {activeState.message}
          </div>
        )}


        <form
          action={activeAction}
          className="mt-5"
        >

          <input
            type="hidden"
            name="userId"
            value={staffMember.id}
          />


          <input
            type="hidden"
            name="isActive"
            value={
              staffMember.isActive
                ? "false"
                : "true"
            }
          />


          <button
            type="submit"
            disabled={
              activePending ||
              (
                staffMember.isActive &&
                (
                  isMasterAdmin ||
                  isCurrentUser
                )
              )
            }
            className={
              staffMember.isActive
                ? "admin-secondary disabled:cursor-not-allowed disabled:opacity-50"
                : "admin-primary disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            {activePending
              ? "Updating..."
              : staffMember.isActive
                ? "Deactivate account"
                : "Activate account"}
          </button>

        </form>


        {staffMember.isActive &&
          (
            isMasterAdmin ||
            isCurrentUser
          ) && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            This account cannot be
            deactivated from this page.
          </p>
        )}

      </div>

    </div>
  );
}