import {
  redirect,
} from "next/navigation";

import {
  logoutAdminAction,
} from "@/app/admin/login/actions";

import {
  changeRequiredPasswordAction,
} from "@/app/admin/change-password/actions";

import {
  requireAdminSession,
} from "@/lib/auth/require-admin";


export const dynamic =
  "force-dynamic";


type ChangePasswordPageProps = {
  searchParams:
    Promise<{
      error?: string;
    }>;
};


function getErrorMessage(
  error:
    | string
    | undefined
) {
  switch (error) {
    case "required":
      return "Enter and confirm your new password.";

    case "length":
      return "Your new password must contain at least 12 characters.";

    case "mismatch":
      return "The two password entries do not match.";

    case "same":
      return "Choose a password different from your temporary password.";

    default:
      return null;
  }
}


export default async function ChangePasswordPage({
  searchParams,
}: ChangePasswordPageProps) {
  const session =
    await requireAdminSession();


  if (
    !session.mustChangePassword
  ) {
    redirect(
      "/admin"
    );
  }


  const params =
    await searchParams;


  const errorMessage =
    getErrorMessage(
      params.error
    );


  return (
    <main className="min-h-screen bg-[#efeee9] py-16">

      <div className="container-shell">

        <section className="mx-auto max-w-xl rounded-2xl border border-[var(--line)] bg-white p-8 md:p-12">

          <p className="admin-eyebrow">
            Account security
          </p>


          <h1 className="display-serif mt-3 text-4xl md:text-5xl">
            Change your password
          </h1>


          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            Your administrator has
            provided a temporary password.
            Create your own password before
            continuing to the Venuvella
            administration workspace.
          </p>


          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Signed in as
            </p>


            <p className="mt-2 font-medium">
              {session.email}
            </p>


            <p className="mt-1 text-sm text-[var(--muted)]">
              Role: {session.role}
            </p>

          </div>


          {errorMessage && (
            <div className="mt-6 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
              {errorMessage}
            </div>
          )}


          <form
            action={
              changeRequiredPasswordAction
            }
            className="mt-8 space-y-6"
          >

            <div>

              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium"
              >
                New password
              </label>


              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className="admin-input w-full"
                placeholder="Minimum 12 characters"
              />


              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Use at least 12 characters
                and choose a password
                different from your
                temporary password.
              </p>

            </div>


            <div>

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirm new password
              </label>


              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className="admin-input w-full"
                placeholder="Enter the new password again"
              />

            </div>


            <button
              type="submit"
              className="admin-primary w-full"
            >
              Change password and continue
            </button>

          </form>


          <div className="mt-8 border-t border-[var(--line)] pt-6">

            <form
              action={
                logoutAdminAction
              }
            >

              <button
                type="submit"
                className="admin-secondary w-full"
              >
                Sign out
              </button>

            </form>

          </div>

        </section>

      </div>

    </main>
  );
}