"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";


const JOB_NAME =
  "provider-product-sync";


const ALLOWED_SCHEDULES = {
  "0 */6 * * *":
    "Every 6 hours",

  "0 */12 * * *":
    "Every 12 hours",

  "0 0 * * *":
    "Once daily",

  "0 0 * * 1":
    "Once weekly",
} as const;


async function ensureJob() {
  return prisma.automationJob.upsert({
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
        "0 */6 * * *",
    },
  });
}


export async function enableProviderSyncAction(): Promise<void> {
  await ensureJob();


  await prisma.automationJob.update({
    where: {
      name:
        JOB_NAME,
    },

    data: {
      enabled:
        true,
    },
  });


  revalidatePath(
    "/admin/provider-sync"
  );

  revalidatePath(
    "/admin/provider-sync/scheduler"
  );
}


export async function disableProviderSyncAction(): Promise<void> {
  await ensureJob();


  await prisma.automationJob.update({
    where: {
      name:
        JOB_NAME,
    },

    data: {
      enabled:
        false,
    },
  });


  revalidatePath(
    "/admin/provider-sync"
  );

  revalidatePath(
    "/admin/provider-sync/scheduler"
  );
}


export async function updateProviderSyncScheduleAction(
  formData: FormData
): Promise<void> {
  const schedule =
    formData
      .get("schedule")
      ?.toString()
      .trim();


  if (!schedule) {
    return;
  }


  if (
    !Object.prototype.hasOwnProperty.call(
      ALLOWED_SCHEDULES,
      schedule
    )
  ) {
    throw new Error(
      "Unsupported provider sync schedule."
    );
  }


  await ensureJob();


  await prisma.automationJob.update({
    where: {
      name:
        JOB_NAME,
    },

    data: {
      schedule,
    },
  });


  revalidatePath(
    "/admin/provider-sync"
  );

  revalidatePath(
    "/admin/provider-sync/scheduler"
  );
}