"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";

import {
  requireRole,
} from "@/lib/auth/require-admin";


const JOB_NAME =
  "provider-product-sync";


const DEFAULT_SCHEDULE =
  "0 0 * * *";


const ALLOWED_SCHEDULES = [
  "0 */6 * * *",
  "0 */12 * * *",
  "0 0 * * *",
  "0 0 * * 1",
] as const;


function isAllowedSchedule(
  value: string
) {
  return ALLOWED_SCHEDULES.includes(
    value as typeof ALLOWED_SCHEDULES[number]
  );
}


export async function enableProviderSyncAction(): Promise<void> {
  await requireRole([
    "ADMIN",
  ]);


  await prisma.automationJob.upsert({
    where: {
      name:
        JOB_NAME,
    },

    update: {
      enabled:
        true,
    },

    create: {
      name:
        JOB_NAME,

      enabled:
        true,

      schedule:
        DEFAULT_SCHEDULE,
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
  await requireRole([
    "ADMIN",
  ]);


  await prisma.automationJob.upsert({
    where: {
      name:
        JOB_NAME,
    },

    update: {
      enabled:
        false,
    },

    create: {
      name:
        JOB_NAME,

      enabled:
        false,

      schedule:
        DEFAULT_SCHEDULE,
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
  await requireRole([
    "ADMIN",
  ]);


  const rawSchedule =
    formData.get(
      "schedule"
    );


  if (
    typeof rawSchedule !==
    "string"
  ) {
    throw new Error(
      "Schedule is required."
    );
  }


  const schedule =
    rawSchedule.trim();


  if (
    !isAllowedSchedule(
      schedule
    )
  ) {
    throw new Error(
      `Unsupported provider sync schedule: ${schedule}`
    );
  }


  /*
   * Upsert directly with the selected
   * schedule so there is no separate
   * ensure/create operation that can leave
   * the job using an old/default value.
   */

  await prisma.automationJob.upsert({
    where: {
      name:
        JOB_NAME,
    },

    update: {
      schedule,
    },

    create: {
      name:
        JOB_NAME,

      enabled:
        true,

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