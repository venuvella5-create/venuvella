import { prisma } from "@/lib/db/prisma";


export type ProductDestinationResult =
  | {
      ok: true;

      product: {
        id: string;
        slug: string;
        name: string;
      };

      provider: {
        id: string;
        name: string;
        slug: string;
      };

      providerProductId: string;

      destination: string;
    }
  | {
      ok: false;

      reason:
        | "PRODUCT_NOT_FOUND"
        | "NO_PROVIDER"
        | "NO_VALID_DESTINATION";
    };


function isSafeExternalUrl(
  value: string | null
): value is string {
  if (!value) {
    return false;
  }


  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}


export async function resolveProductDestination(
  slug: string
): Promise<ProductDestinationResult> {
  const product =
    await prisma.product.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
        slug: true,
        name: true,
        status: true,

        providerProducts: {
          where: {
            provider: {
              status: {
                not: "INACTIVE",
              },
            },
          },

          select: {
            id: true,

            affiliateUrl: true,
            productUrl: true,

            availability: true,
            syncStatus: true,
            updatedAt: true,

            provider: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },

          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });


  /*
   * Product unavailable
   */

  if (
    !product ||
    product.status !== "PUBLISHED"
  ) {
    return {
      ok: false,
      reason: "PRODUCT_NOT_FOUND",
    };
  }


  /*
   * No provider mappings
   */

  if (
    product.providerProducts.length === 0
  ) {
    return {
      ok: false,
      reason: "NO_PROVIDER",
    };
  }


  /*
   * Prefer affiliate URL
   */

  for (const offer of product.providerProducts) {
    const destination =
      offer.affiliateUrl;


    if (
      !isSafeExternalUrl(
        destination
      )
    ) {
      continue;
    }


    return {
      ok: true,

      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
      },

      provider: {
        id:
          offer.provider.id,

        name:
          offer.provider.name,

        slug:
          offer.provider.slug,
      },

      providerProductId:
        offer.id,

      destination,
    };
  }


  /*
   * Fall back to normal provider product URL
   */

  for (const offer of product.providerProducts) {
    const destination =
      offer.productUrl;


    if (
      !isSafeExternalUrl(
        destination
      )
    ) {
      continue;
    }


    return {
      ok: true,

      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
      },

      provider: {
        id:
          offer.provider.id,

        name:
          offer.provider.name,

        slug:
          offer.provider.slug,
      },

      providerProductId:
        offer.id,

      destination,
    };
  }


  /*
   * Provider exists, but no valid destination
   */

  return {
    ok: false,
    reason: "NO_VALID_DESTINATION",
  };
}