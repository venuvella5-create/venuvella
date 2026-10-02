"use server";

import { revalidatePath } from "next/cache";

import {
  runProviderSync,
} from "@/lib/affiliate/provider-sync/runProviderSync";

import {
  requireAdminSession,
} from "@/lib/auth/require-admin";


export async function runProviderSyncAction(): Promise<void> {
  await requireAdminSession();

  try {
    await runProviderSync();
  } catch (error) {
    console.error(
      "Provider synchronization failed:",
      error
    );
  }


  revalidatePath(
    "/admin/provider-sync"
  );

  revalidatePath(
    "/admin/affiliate-ops"
  );

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    "/admin/providers"
  );
}