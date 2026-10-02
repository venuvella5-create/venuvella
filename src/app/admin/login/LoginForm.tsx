"use client";

import {
  useActionState,
} from "react";

import {
  loginAdminAction,
  type AdminLoginState,
} from "./actions";


export function AdminLoginForm({
  nextPath,
}: {
  nextPath: string;
}) {

  const initialState:
    AdminLoginState = {
      ok: false,
      message: "",
    };


  const [
    state,
    action,
    pending,
  ] = useActionState(
    loginAdminAction,
    initialState
  );


  return (
    <form
      action={action}
      className="mt-8 grid gap-5"
    >

      <input
        type="hidden"
        name="next"
        value={nextPath}
      />


      <div>

        <label
          htmlFor="email"
          className="admin-label"
        >
          Email
        </label>


        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className="admin-input"
          placeholder="admin@example.com"
          required
        />

      </div>


      <div>

        <label
          htmlFor="password"
          className="admin-label"
        >
          Password
        </label>


        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="admin-input"
          placeholder="Your password"
          required
        />

      </div>


      {state.message && (

        <p
          className={
            state.ok
              ? "admin-success"
              : "admin-error"
          }
        >
          {state.message}
        </p>

      )}


      <button
        type="submit"
        disabled={pending}
        className="admin-primary mt-2 w-full justify-center"
      >
        {pending
          ? "Signing in…"
          : "Sign in"}
      </button>

    </form>
  );
}