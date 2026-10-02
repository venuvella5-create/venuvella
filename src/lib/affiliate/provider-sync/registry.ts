import type {
  ProviderAdapter,
  ProviderSyncInput,
  ProviderSyncResult,
} from "./types";


function isValidHttpUrl(
  value: string | null
) {
  if (!value) {
    return false;
  }


  try {
    const url =
      new URL(value);


    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );

  } catch {
    return false;
  }
}


function validatePrice(
  value: string | null
) {
  if (
    value === null ||
    value.trim() === ""
  ) {
    return {
      valid: true,
      price: null,
    };
  }


  const numeric =
    Number(value);


  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric < 0
  ) {
    return {
      valid: false,
      price: null,
    };
  }


  return {
    valid: true,
    price:
      numeric.toFixed(2),
  };
}


function validateCurrency(
  value: string | null
) {
  if (!value) {
    return null;
  }


  const normalized =
    value
      .trim()
      .toUpperCase();


  if (
    !/^[A-Z]{3}$/.test(
      normalized
    )
  ) {
    return null;
  }


  return normalized;
}


/*
 * Manual provider adapter
 *
 * Manual mappings are maintained by an
 * administrator rather than synchronized
 * from an external merchant API.
 *
 * The adapter validates the stored data,
 * but does NOT invent or fetch:
 *
 * - price
 * - availability
 * - affiliate URLs
 * - product metadata
 *
 * Existing manually entered values remain
 * the source of truth.
 */

const manualAdapter:
  ProviderAdapter = {

  slug:
    "manual",

  name:
    "Manual provider",


  async syncProduct(
    input: ProviderSyncInput
  ): Promise<ProviderSyncResult> {

    /*
     * Validate destination.
     *
     * At least one usable destination is
     * required.
     */

    const hasAffiliateUrl =
      isValidHttpUrl(
        input.affiliateUrl
      );


    const hasProductUrl =
      isValidHttpUrl(
        input.productUrl
      );


    if (
      !hasAffiliateUrl &&
      !hasProductUrl
    ) {
      return {
        status:
          "FAILED",

        message:
          `Manual mapping for "${input.product.name}" has no valid affiliate or product URL.`,
      };
    }


    /*
     * Validate stored price.
     */

    const priceValidation =
      validatePrice(
        input.currentPrice
      );


    if (
      !priceValidation.valid
    ) {
      return {
        status:
          "FAILED",

        message:
          `Manual mapping for "${input.product.name}" contains an invalid price.`,
      };
    }


    /*
     * When a price exists, require a valid
     * ISO-style three-letter currency code.
     */

    let normalizedCurrency:
      string | null = null;


    if (
      priceValidation.price !==
      null
    ) {
      normalizedCurrency =
        validateCurrency(
          input.currentCurrency
        );


      if (
        !normalizedCurrency
      ) {
        return {
          status:
            "FAILED",

          message:
            `Manual mapping for "${input.product.name}" has a price but no valid three-letter currency code.`,
        };
      }
    }


    /*
     * Mapping is internally valid.
     *
     * We return SUCCESS because the manual
     * record has passed Venuvella validation.
     *
     * This does NOT mean the merchant supplied
     * fresh external data. It only confirms
     * that the manually maintained mapping is
     * usable by Venuvella.
     */

    return {
      status:
        "SUCCESS",

      message:
        `Manual mapping for "${input.product.name}" passed validation.`,

      data: {
        /*
         * Price and currency are returned only
         * so they can be normalized.
         */

        ...(priceValidation.price !==
        null
          ? {
              price:
                priceValidation.price,

              currency:
                normalizedCurrency,
            }
          : {}),

        /*
         * We intentionally do not overwrite:
         *
         * availability
         * affiliateUrl
         * productUrl
         * providerMetadata
         *
         * They remain exactly as maintained
         * by the administrator.
         */
      },
    };
  },
};


/*
 * Provider adapter registry.
 *
 * External provider adapters will be added
 * here later.
 */

const adapters =
  new Map<
    string,
    ProviderAdapter
  >([
    [
      manualAdapter.slug,
      manualAdapter,
    ],
  ]);


export function getProviderAdapter(
  providerSlug: string
) {
  return adapters.get(
    providerSlug
      .trim()
      .toLowerCase()
  );
}


export function hasProviderAdapter(
  providerSlug: string
) {
  return adapters.has(
    providerSlug
      .trim()
      .toLowerCase()
  );
}


export function getRegisteredProviderAdapters() {
  return Array.from(
    adapters.values()
  );
}