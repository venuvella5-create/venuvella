"use client";

import { useActionState } from "react";

import {
  createProvider,
  updateProvider,
  type ProviderActionState,
} from "@/app/admin/providers/actions";


type ProviderFormData = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string | null;
  status: string;
};


export function AffiliateProviderForm({
  provider,
}: {
  provider?: ProviderFormData;
}) {
  const editing = Boolean(provider);

  const initialState: ProviderActionState = {
    ok: false,
    message: "",
  };


  const [state, action, pending] =
    useActionState(
      editing
        ? updateProvider
        : createProvider,
      initialState
    );


  return (
    <form
      action={action}
      className="mt-8 space-y-5"
    >

      {provider && (
        <input
          type="hidden"
          name="id"
          value={provider.id}
        />
      )}


      <div>
        <label className="admin-label">
          Provider name
        </label>

        <input
          name="name"
          required
          defaultValue={
            provider?.name ?? ""
          }
          className="admin-input"
          placeholder="Amazon"
        />
      </div>


      <div>
        <label className="admin-label">
          Slug
        </label>

        <input
          name="slug"
          defaultValue={
            provider?.slug ?? ""
          }
          className="admin-input"
          placeholder="amazon"
        />

        <p className="mt-2 text-xs text-[var(--muted)]">
          Leave blank when creating and Venuvella will generate the slug
          from the provider name.
        </p>
      </div>


      <div>
        <label className="admin-label">
          Website URL
        </label>

        <input
          name="websiteUrl"
          type="url"
          defaultValue={
            provider?.websiteUrl ?? ""
          }
          className="admin-input"
          placeholder="https://www.amazon.com"
        />
      </div>


      <div>
        <label className="admin-label">
          Provider status
        </label>

        <select
          name="status"
          defaultValue={
            provider?.status ??
            "CONFIGURED"
          }
          className="admin-input"
        >
          <option value="CONFIGURED">
            Configured
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>
        </select>
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


      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="admin-primary"
        >
          {pending
            ? "Saving…"
            : editing
              ? "Save provider"
              : "Create provider"}
        </button>
      </div>

    </form>
  );
}