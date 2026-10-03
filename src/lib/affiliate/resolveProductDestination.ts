import {
  prisma,
} from "@/lib/db/prisma";


export type ProductDestinationResult =
  | {
      ok:
        true;

      product: {
        id:
          string;

        slug:
          string;

        name:
          string;

        category: {
          id:
            string;

          name:
            string;

          slug:
            string;
        };
      };

      provider: {
        id:
          string;

        name:
          string;

        slug:
          string;
      };

      providerProductId:
        string;

      destination:
        string;
    }
  | {
      ok:
        false;

      reason:
        | "PRODUCT_NOT_FOUND"
        | "NO_PROVIDER"
        | "NO_VALID_DESTINATION";
    };


function isSafeExternalUrl(
  value:
    string |
    null
): value is string {
  if (
    !value
  ) {
    return false;
  }


  try {
    const url =
      new URL(
        value
      );


    return (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    );
  } catch {
    return false;
  }
}


export async function resolveProductDestination(
  slug:
    string,

  preferredProviderSlug?:
    string |
    null
): Promise<ProductDestinationResult> {
  const product =
    await prisma.product.findUnique({
      where: {
        slug,
      },

      select: {
        id:
          true,

        slug:
          true,

        name:
          true,

        status:
          true,

        category: {
          select: {
            id:
              true,

            name:
              true,

            slug:
              true,
          },
        },

        providerProducts: {
          where: {
            provider: {
              status: {
                not:
                  "INACTIVE",
              },
            },
          },

          select: {
            id:
              true,

            affiliateUrl:
              true,

            productUrl:
              true,

            availability:
              true,

            syncStatus:
              true,

            updatedAt:
              true,

            priority:
              true,

            provider: {
              select: {
                id:
                  true,

                name:
                  true,

                slug:
                  true,

                status:
                  true,
              },
            },
          },

          orderBy: [
            {
              priority:
                "asc",
            },

            {
              updatedAt:
                "desc",
            },
          ],
        },
      },
    });


  if (
    !product ||
    product.status !==
      "PUBLISHED"
  ) {
    return {
      ok:
        false,

      reason:
        "PRODUCT_NOT_FOUND",
    };
  }


  if (
    product.providerProducts.length ===
    0
  ) {
    return {
      ok:
        false,

      reason:
        "NO_PROVIDER",
    };
  }


  const requestedProvider =
    preferredProviderSlug
      ?.trim()
      .toLowerCase() ??
    null;


  const candidateOffers =
    requestedProvider
      ? product.providerProducts.filter(
          (
            offer
          ) =>
            offer.provider.slug.toLowerCase() ===
            requestedProvider
        )
      : product.providerProducts;


  if (
    candidateOffers.length ===
    0
  ) {
    return {
      ok:
        false,

      reason:
        "NO_PROVIDER",
    };
  }


  /*
   * Prefer affiliate URLs.
   */

  for (
    const offer of
    candidateOffers
  ) {
    if (
      !isSafeExternalUrl(
        offer.affiliateUrl
      )
    ) {
      continue;
    }


    return {
      ok:
        true,

      product: {
        id:
          product.id,

        slug:
          product.slug,

        name:
          product.name,

        category:
          product.category,
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

      destination:
        offer.affiliateUrl,
    };
  }


  /*
   * Fall back to the normal retailer URL.
   */

  for (
    const offer of
    candidateOffers
  ) {
    if (
      !isSafeExternalUrl(
        offer.productUrl
      )
    ) {
      continue;
    }


    return {
      ok:
        true,

      product: {
        id:
          product.id,

        slug:
          product.slug,

        name:
          product.name,

        category:
          product.category,
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

      destination:
        offer.productUrl,
    };
  }


  return {
    ok:
      false,

    reason:
      "NO_VALID_DESTINATION",
  };
}