"use client";

import { useActionState } from "react";

import {
  saveProviderMapping,
  type ProviderMappingActionState,
} from "@/app/admin/products/actions";


type ProviderOption = {
  id: string;
  name: string;
};


type ExistingMapping = {
  id: string;

  providerId: string;

  externalProductId: string;

  productUrl:
    | string
    | null;

  affiliateUrl:
    | string
    | null;

  price:
    | string
    | null;

  currency:
    | string
    | null;

  availability:
    | string
    | null;

  priority: number;

  syncStatus: string;
};


export function ProviderMappingForm({
  productId,
  providers,
  mapping,
}: {
  productId: string;

  providers: ProviderOption[];

  mapping?: ExistingMapping;
}) {
  const editing =
    Boolean(mapping);


  const initialState:
    ProviderMappingActionState = {
      ok: false,
      message: "",
    };


  const [
    state,
    action,
    pending,
  ] = useActionState(
    saveProviderMapping,
    initialState
  );


  return (
    <form
      action={action}
      className="grid gap-5"
    >

      <input
        type="hidden"
        name="productId"
        value={productId}
      />


      {mapping && (
        <input
          type="hidden"
          name="mappingId"
          value={mapping.id}
        />
      )}


      <div>

        <label className="admin-label">
          Provider
        </label>


        <select
          name="providerId"
          defaultValue={
            mapping?.providerId ??
            providers[0]?.id
          }
          className="admin-input"
          required
        >

          {providers.map(
            (provider) => (

              <option
                key={provider.id}
                value={provider.id}
              >
                {provider.name}
              </option>

            )
          )}

        </select>

      </div>


      <div>

        <label className="admin-label">
          External Product ID
        </label>


        <input
          name="externalProductId"
          defaultValue={
            mapping?.externalProductId ??
            ""
          }
          className="admin-input"
          placeholder="Provider product ID / ASIN / SKU"
          required
        />

      </div>


      <div>

        <label className="admin-label">
          Product URL
        </label>


        <input
          name="productUrl"
          type="url"
          defaultValue={
            mapping?.productUrl ??
            ""
          }
          className="admin-input"
          placeholder="https://..."
        />

      </div>


      <div>

        <label className="admin-label">
          Affiliate URL
        </label>


        <input
          name="affiliateUrl"
          type="url"
          defaultValue={
            mapping?.affiliateUrl ??
            ""
          }
          className="admin-input"
          placeholder="https://..."
        />

      </div>


      <div className="grid gap-5 md:grid-cols-2">

        <div>

          <label className="admin-label">
            Price
          </label>


          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              mapping?.price ??
              ""
            }
            className="admin-input"
            placeholder="0.00"
          />

        </div>


        <div>

          <label className="admin-label">
            Currency
          </label>


          <input
            name="currency"
            maxLength={3}
            defaultValue={
              mapping?.currency ??
              ""
            }
            className="admin-input uppercase"
            placeholder="USD"
          />

        </div>

      </div>


      <div>

        <label className="admin-label">
          Availability
        </label>


        <input
          name="availability"
          defaultValue={
            mapping?.availability ??
            ""
          }
          className="admin-input"
          placeholder="In stock"
        />

      </div>


      <div>

        <label className="admin-label">
          Provider priority
        </label>


        <input
          name="priority"
          type="number"
          min="0"
          max="9999"
          step="1"
          defaultValue={
            mapping?.priority ??
            100
          }
          className="admin-input"
        />


        <p className="mt-2 text-xs text-[var(--muted)]">
          Lower numbers are preferred.
          For example, priority 10 is chosen before priority 20.
        </p>

      </div>


      <div>

        <label className="admin-label">
          Sync status
        </label>


        <select
          name="syncStatus"
          defaultValue={
            mapping?.syncStatus ??
            "PENDING"
          }
          className="admin-input"
        >

          <option value="PENDING">
            Pending
          </option>

          <option value="SUCCESS">
            Success
          </option>

          <option value="FAILED">
            Failed
          </option>

          <option value="STALE">
            Stale
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
              ? "Save changes"
              : "Add provider mapping"}
        </button>

      </div>

    </form>
  );
}