import { prisma } from "@/lib/db/prisma";

import {
  getProviderAdapter,
} from "./registry";

import type {
  ProviderSyncInput,
  ProviderSyncResult,
} from "./types";


const JOB_NAME =
  "provider-product-sync";


type SyncSummary = {
  processed: number;
  succeeded: number;
  failed: number;
  stale: number;
  skipped: number;
};


function decimalToString(
  value: {
    toString(): string;
  } | null
) {
  return value
    ? value.toString()
    : null;
}


function normalizeCurrency(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }


  const currency =
    value
      .trim()
      .toUpperCase();


  if (
    currency.length !== 3
  ) {
    return null;
  }


  return currency;
}


function normalizePrice(
  value:
    | string
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined ||
    value.trim() === ""
  ) {
    return null;
  }


  const numeric =
    Number(value);


  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric < 0
  ) {
    return null;
  }


  return numeric.toFixed(
    2
  );
}


async function applySyncResult(
  providerProductId: string,
  result: ProviderSyncResult
) {
  const now =
    new Date();


  /*
   * SKIPPED means no actual provider
   * synchronization occurred.
   */

  if (
    result.status ===
    "SKIPPED"
  ) {
    return;
  }


  if (
    result.status ===
    "FAILED"
  ) {
    await prisma.providerProduct.update({
      where: {
        id:
          providerProductId,
      },

      data: {
        syncStatus:
          "FAILED",

        lastSyncedAt:
          now,
      },
    });

    return;
  }


  if (
    result.status ===
    "STALE"
  ) {
    await prisma.providerProduct.update({
      where: {
        id:
          providerProductId,
      },

      data: {
        syncStatus:
          "STALE",

        lastSyncedAt:
          now,
      },
    });

    return;
  }


  const price =
    normalizePrice(
      result.data?.price
    );


  const currency =
    normalizeCurrency(
      result.data?.currency
    );


  await prisma.providerProduct.update({
    where: {
      id:
        providerProductId,
    },

    data: {
      syncStatus:
        "SUCCESS",

      lastSyncedAt:
        now,

      ...(result.data?.price !==
      undefined
        ? {
            price,
          }
        : {}),

      ...(result.data?.currency !==
      undefined
        ? {
            currency,
          }
        : {}),

      ...(result.data?.availability !==
      undefined
        ? {
            availability:
              result.data
                .availability,
          }
        : {}),

      ...(result.data?.productUrl !==
      undefined
        ? {
            productUrl:
              result.data
                .productUrl,
          }
        : {}),

      ...(result.data?.affiliateUrl !==
      undefined
        ? {
            affiliateUrl:
              result.data
                .affiliateUrl,
          }
        : {}),

      ...(result.data?.providerMetadata !==
      undefined
        ? {
            providerMetadata:
              result.data
                .providerMetadata as object,
          }
        : {}),
    },
  });
}


export async function runProviderSync(): Promise<SyncSummary> {
  const startedAt =
    new Date();


  /*
   * Ensure automation job exists.
   */

  await prisma.automationJob.upsert({
    where: {
      name:
        JOB_NAME,
    },

    update: {},

    create: {
      name:
        JOB_NAME,

      enabled:
        true,

      schedule:
        null,
    },
  });


  /*
   * Create run log.
   */

  const log =
    await prisma.automationLog.create({
      data: {
        jobName:
          JOB_NAME,

        status:
          "RUNNING",

        startedAt,
      },
    });


  const summary:
    SyncSummary = {
      processed:
        0,

      succeeded:
        0,

      failed:
        0,

      stale:
        0,

      skipped:
        0,
    };


  try {
    const mappings =
      await prisma.providerProduct.findMany({
        where: {
          provider: {
            status: {
              not:
                "INACTIVE",
            },
          },
        },

        include: {
          provider: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },

          product: {
            select: {
              id: true,
              name: true,
              slug: true,
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
              "asc",
          },
        ],
      });


    for (
      const mapping
      of mappings
    ) {
      summary.processed +=
        1;


      const itemStartedAt =
        Date.now();


      const adapter =
        getProviderAdapter(
          mapping.provider.slug
        );


      /*
       * No registered adapter.
       */

      if (!adapter) {
        summary.skipped +=
          1;


        await prisma.automationLogItem.create({
          data: {
            automationLogId:
              log.id,

            providerProductId:
              mapping.id,

            providerId:
              mapping.provider.id,

            providerName:
              mapping.provider.name,

            providerSlug:
              mapping.provider.slug,

            productId:
              mapping.product.id,

            productName:
              mapping.product.name,

            productSlug:
              mapping.product.slug,

            externalProductId:
              mapping.externalProductId,

            status:
              "SKIPPED",

            message:
              `No provider adapter is registered for "${mapping.provider.slug}".`,

            durationMs:
              Date.now() -
              itemStartedAt,
          },
        });


        continue;
      }


      const input:
        ProviderSyncInput = {
          providerProductId:
            mapping.id,

          provider: {
            id:
              mapping.provider.id,

            name:
              mapping.provider.name,

            slug:
              mapping.provider.slug,

            status:
              mapping.provider.status,
          },

          product: {
            id:
              mapping.product.id,

            name:
              mapping.product.name,

            slug:
              mapping.product.slug,
          },

          externalProductId:
            mapping.externalProductId,

          productUrl:
            mapping.productUrl,

          affiliateUrl:
            mapping.affiliateUrl,

          providerMetadata:
            mapping.providerMetadata,

          currentPrice:
            decimalToString(
              mapping.price
            ),

          currentCurrency:
            mapping.currency,

          currentAvailability:
            mapping.availability,
        };


      try {
        const result =
          await adapter.syncProduct(
            input
          );


        await applySyncResult(
          mapping.id,
          result
        );


        if (
          result.status ===
          "SUCCESS"
        ) {
          summary.succeeded +=
            1;
        }


        if (
          result.status ===
          "FAILED"
        ) {
          summary.failed +=
            1;
        }


        if (
          result.status ===
          "STALE"
        ) {
          summary.stale +=
            1;
        }


        if (
          result.status ===
          "SKIPPED"
        ) {
          summary.skipped +=
            1;
        }


        await prisma.automationLogItem.create({
          data: {
            automationLogId:
              log.id,

            providerProductId:
              mapping.id,

            providerId:
              mapping.provider.id,

            providerName:
              mapping.provider.name,

            providerSlug:
              mapping.provider.slug,

            productId:
              mapping.product.id,

            productName:
              mapping.product.name,

            productSlug:
              mapping.product.slug,

            externalProductId:
              mapping.externalProductId,

            status:
              result.status,

            message:
              result.message,

            durationMs:
              Date.now() -
              itemStartedAt,
          },
        });

      } catch (error) {

        summary.failed +=
          1;


        const message =
          error instanceof Error
            ? error.message
            : "Unknown provider sync error";


        await prisma.providerProduct.update({
          where: {
            id:
              mapping.id,
          },

          data: {
            syncStatus:
              "FAILED",

            lastSyncedAt:
              new Date(),
          },
        });


        await prisma.automationLogItem.create({
          data: {
            automationLogId:
              log.id,

            providerProductId:
              mapping.id,

            providerId:
              mapping.provider.id,

            providerName:
              mapping.provider.name,

            providerSlug:
              mapping.provider.slug,

            productId:
              mapping.product.id,

            productName:
              mapping.product.name,

            productSlug:
              mapping.product.slug,

            externalProductId:
              mapping.externalProductId,

            status:
              "FAILED",

            message:
              message.slice(
                0,
                2000
              ),

            durationMs:
              Date.now() -
              itemStartedAt,
          },
        });


        console.error(
          `Provider sync failed for ${mapping.provider.slug}/${mapping.externalProductId}:`,
          error
        );
      }
    }


    const finishedAt =
      new Date();


    await prisma.automationLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          summary.failed > 0
            ? "COMPLETED_WITH_ERRORS"
            : "SUCCESS",

        finishedAt,

        processed:
          summary.processed,

        failed:
          summary.failed,
      },
    });


    await prisma.automationJob.update({
      where: {
        name:
          JOB_NAME,
      },

      data: {
        lastRunAt:
          finishedAt,
      },
    });


    return summary;

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Unknown provider sync error";


    await prisma.automationLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        finishedAt:
          new Date(),

        processed:
          summary.processed,

        failed:
          summary.failed + 1,

        error:
          message.slice(
            0,
            2000
          ),
      },
    });


    throw error;
  }
}