export type ProviderSyncStatus =
  | "SUCCESS"
  | "FAILED"
  | "STALE"
  | "SKIPPED";


export type ProviderSyncInput = {
  providerProductId: string;

  provider: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };

  product: {
    id: string;
    name: string;
    slug: string;
  };

  externalProductId: string;

  productUrl: string | null;

  affiliateUrl: string | null;

  providerMetadata: unknown;

  currentPrice: string | null;

  currentCurrency: string | null;

  currentAvailability: string | null;
};


export type ProviderSyncResult = {
  status: ProviderSyncStatus;

  message: string;

  data?: {
    price?: string | null;

    currency?: string | null;

    availability?: string | null;

    productUrl?: string | null;

    affiliateUrl?: string | null;

    providerMetadata?: unknown;
  };
};


export interface ProviderAdapter {
  slug: string;

  name: string;

  syncProduct(
    input: ProviderSyncInput
  ): Promise<ProviderSyncResult>;
}