"use server";







import { revalidatePath } from "next/cache";







import {



  Prisma,



  SyncStatus,



} from "@prisma/client";







import { prisma } from "@/lib/db/prisma";

import { requireRole } from "@/lib/auth/require-admin";











export type ProviderMappingActionState = {



  ok: boolean;



  message: string;



};











function emptyToNull(



  value: FormDataEntryValue | null



) {



  if (typeof value !== "string") {



    return null;



  }







  const trimmed = value.trim();







  return trimmed.length > 0



    ? trimmed



    : null;



}











function isValidOptionalUrl(



  value: string | null



) {



  if (!value) {



    return true;



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











function isSecureUrl(



  value: string



) {



  try {



    const url = new URL(value);







    return url.protocol === "https:";



  } catch {



    return false;



  }



}











function getProviderKind(



  providerName: string



) {



  const normalized =



    providerName



      .trim()



      .toLowerCase();







  if (



    normalized.includes(



      "amazon"



    )



  ) {



    return "amazon";



  }







  if (



    normalized.includes(



      "walmart"



    )



  ) {



    return "walmart";



  }







  return "generic";



}











function normalizeExternalProductId(



  providerKind:



    | "amazon"



    | "walmart"



    | "generic",



  value: string



) {



  const normalized =



    value.trim();







  if (



    providerKind ===



    "amazon"



  ) {



    return normalized.toUpperCase();



  }







  return normalized;



}











function isValidAmazonAsin(



  value: string



) {



  return /^[A-Z0-9]{10}$/.test(



    value



  );



}











async function revalidateProductPaths(



  productId: string



) {



  const product =



    await prisma.product.findUnique({



      where: {



        id: productId,



      },







      select: {



        id: true,



        slug: true,



      },



    });











  if (!product) {



    return;



  }











  revalidatePath(



    "/admin/products"



  );







  revalidatePath(



    `/admin/products/${product.id}`



  );







  revalidatePath(



    "/admin/provider-sync"



  );







  revalidatePath(



    "/admin/affiliate-ops"



  );







  revalidatePath(



    `/products/${product.slug}`



  );







  revalidatePath(



    `/go/${product.slug}`



  );



}











export async function saveProviderMapping(



  _previous: ProviderMappingActionState,



  formData: FormData



): Promise<ProviderMappingActionState> {







    await requireRole([
    "ADMIN",
    "EDITOR",
  ]);



const mappingId =



    String(



      formData.get("mappingId") ?? ""



    ).trim();











  const productId =



    String(



      formData.get("productId") ?? ""



    ).trim();











  const providerId =



    String(



      formData.get("providerId") ?? ""



    ).trim();











  const rawExternalProductId =



    String(



      formData.get(



        "externalProductId"



      ) ?? ""



    ).trim();











  const productUrl =



    emptyToNull(



      formData.get("productUrl")



    );











  const affiliateUrl =



    emptyToNull(



      formData.get("affiliateUrl")



    );











  const availability =



    emptyToNull(



      formData.get("availability")



    );











  const rawPrice =



    emptyToNull(



      formData.get("price")



    );











  const rawCurrency =



    emptyToNull(



      formData.get("currency")



    );











  const rawSyncStatus =



    String(



      formData.get(



        "syncStatus"



      ) ?? "SUCCESS"



    ).trim();











  const rawPriority =



    String(



      formData.get(



        "priority"



      ) ?? "100"



    ).trim();











  /*



   * BASIC REQUIRED FIELDS



   */







  if (



    !productId ||



    !providerId ||



    !rawExternalProductId



  ) {



    return {



      ok: false,







      message:



        "Product, provider and external product ID are required.",



    };



  }











  /*



   * GENERAL URL VALIDATION



   */







  if (



    !isValidOptionalUrl(



      productUrl



    )



  ) {



    return {



      ok: false,







      message:



        "Product URL must be a valid http or https URL.",



    };



  }











  if (



    !isValidOptionalUrl(



      affiliateUrl



    )



  ) {



    return {



      ok: false,







      message:



        "Affiliate URL must be a valid http or https URL.",



    };



  }











  /*



   * PRICE



   */







  let price:



    | Prisma.Decimal



    | null = null;











  if (rawPrice) {



    const parsedPrice =



      Number(rawPrice);











    if (



      !Number.isFinite(



        parsedPrice



      ) ||



      parsedPrice < 0



    ) {



      return {



        ok: false,







        message:



          "Price must be a valid non-negative number.",



      };



    }











    price =



      new Prisma.Decimal(



        rawPrice



      );



  }











  /*



   * CURRENCY



   */







  let currency:



    | string



    | null = null;











  if (rawCurrency) {



    const normalized =



      rawCurrency.toUpperCase();











    if (



      !/^[A-Z]{3}$/.test(



        normalized



      )



    ) {



      return {



        ok: false,







        message:



          "Currency must use a 3-letter code such as USD.",



      };



    }











    currency =



      normalized;



  }











  /*



   * SYNC STATUS



   */







  if (



    !Object.values(



      SyncStatus



    ).includes(



      rawSyncStatus as SyncStatus



    )



  ) {



    return {



      ok: false,







      message:



        "Invalid sync status.",



    };



  }











  /*



   * PRIORITY



   */







  const priority =



    Number(



      rawPriority



    );











  if (



    !Number.isInteger(



      priority



    ) ||



    priority < 0 ||



    priority > 9999



  ) {



    return {



      ok: false,







      message:



        "Priority must be a whole number between 0 and 9999.",



    };



  }











  /*



   * PRODUCT



   */







  const product =



    await prisma.product.findUnique({



      where: {



        id: productId,



      },







      select: {



        id: true,



      },



    });











  if (!product) {



    return {



      ok: false,







      message:



        "Product not found.",



    };



  }











  /*



   * PROVIDER



   */







  const provider =



    await prisma.affiliateProvider.findUnique({



      where: {



        id: providerId,



      },







      select: {



        id: true,



        name: true,



        active: true,



      },



    });











  if (!provider) {



    return {



      ok: false,







      message:



        "Affiliate provider not found.",



    };



  }











  const providerKind =



    getProviderKind(



      provider.name



    );











  const externalProductId =



    normalizeExternalProductId(



      providerKind,



      rawExternalProductId



    );











  /*



   * AMAZON MANUAL VALIDATION



   */







  if (



    providerKind ===



    "amazon"



  ) {







    if (



      !isValidAmazonAsin(



        externalProductId



      )



    ) {



      return {



        ok: false,







        message:



          "Amazon mappings require a valid 10-character ASIN.",



      };



    }











    if (!affiliateUrl) {



      return {



        ok: false,







        message:



          "Amazon requires an affiliate URL before the mapping can be saved.",



      };



    }











    if (



      !isSecureUrl(



        affiliateUrl



      )



    ) {



      return {



        ok: false,







        message:



          "Amazon affiliate URLs must use HTTPS.",



      };



    }











    if (



      productUrl &&



      !isSecureUrl(



        productUrl



      )



    ) {



      return {



        ok: false,







        message:



          "Amazon product URLs must use HTTPS.",



      };



    }











    if (



      price &&



      !currency



    ) {



      currency =



        "USD";



    }



  }











  /*



   * WALMART MANUAL VALIDATION



   */







  if (



    providerKind ===



    "walmart"



  ) {







    if (



      externalProductId.length <



      2



    ) {



      return {



        ok: false,







        message:



          "Enter a valid Walmart item or product ID.",



      };



    }











    if (!affiliateUrl) {



      return {



        ok: false,







        message:



          "Walmart requires an affiliate URL before the mapping can be saved.",



      };



    }











    if (



      !isSecureUrl(



        affiliateUrl



      )



    ) {



      return {



        ok: false,







        message:



          "Walmart affiliate URLs must use HTTPS.",



      };



    }











    if (



      productUrl &&



      !isSecureUrl(



        productUrl



      )



    ) {



      return {



        ok: false,







        message:



          "Walmart product URLs must use HTTPS.",



      };



    }











    if (



      price &&



      !currency



    ) {



      currency =



        "USD";



    }



  }











  /*



   * DUPLICATE MAPPING



   */







  const duplicate =



    await prisma.providerProduct.findFirst({



      where: {



        providerId,



        externalProductId,







        ...(mappingId



          ? {



              NOT: {



                id:



                  mappingId,



              },



            }



          : {}),



      },







      select: {



        id: true,



      },



    });











  if (duplicate) {



    return {



      ok: false,







      message:



        "This provider already has a mapping with that external product ID.",



    };



  }











  try {







    /*



     * UPDATE MAPPING



     */







    if (mappingId) {







      const existing =



        await prisma.providerProduct.findUnique({



          where: {



            id:



              mappingId,



          },







          select: {



            id: true,



            productId: true,



          },



        });











      if (!existing) {



        return {



          ok: false,







          message:



            "Provider mapping not found.",



        };



      }











      if (



        existing.productId !==



        productId



      ) {



        return {



          ok: false,







          message:



            "This mapping does not belong to this product.",



        };



      }











      await prisma.providerProduct.update({



        where: {



          id:



            mappingId,



        },







        data: {



          providerId,







          externalProductId,







          productUrl,







          affiliateUrl,







          price,







          currency,







          availability,







          priority,







          syncStatus:



            rawSyncStatus as SyncStatus,







          lastSyncedAt:



            rawSyncStatus ===



            "SUCCESS"



              ? new Date()



              : null,



        },



      });







    } else {







      /*



       * CREATE MAPPING



       */







      await prisma.providerProduct.create({



        data: {



          productId,







          providerId,







          externalProductId,







          productUrl,







          affiliateUrl,







          price,







          currency,







          availability,







          priority,







          syncStatus:



            rawSyncStatus as SyncStatus,







          lastSyncedAt:



            rawSyncStatus ===



            "SUCCESS"



              ? new Date()



              : null,



        },



      });



    }







  } catch (error) {







    console.error(



      "Failed to save provider mapping:",



      error



    );











    return {



      ok: false,







      message:



        "Could not save the provider mapping.",



    };



  }











  await revalidateProductPaths(



    productId



  );











  return {



    ok: true,







    message:



      mappingId



        ? `${provider.name} mapping updated successfully.`



        : `${provider.name} mapping created successfully.`,



  };



}











export async function deleteProviderMapping(



  formData: FormData



) {







    await requireRole([
    "ADMIN",
    "EDITOR",
  ]);



const mappingId =



    String(



      formData.get(



        "mappingId"



      ) ?? ""



    ).trim();











  const productId =



    String(



      formData.get(



        "productId"



      ) ?? ""



    ).trim();











  if (



    !mappingId ||



    !productId



  ) {



    return;



  }











  const mapping =



    await prisma.providerProduct.findUnique({



      where: {



        id:



          mappingId,



      },







      select: {



        id: true,



        productId: true,



      },



    });











  if (!mapping) {



    return;



  }











  if (



    mapping.productId !==



    productId



  ) {



    return;



  }











  try {







    await prisma.providerProduct.delete({



      where: {



        id:



          mappingId,



      },



    });







  } catch (error) {







    console.error(



      "Failed to delete provider mapping:",



      error



    );







    return;



  }











  await revalidateProductPaths(



    productId



  );



}