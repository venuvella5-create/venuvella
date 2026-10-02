"use server";

import { revalidatePath } from "next/cache";
import { ProviderStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-admin";


export type ProviderActionState = {
  ok: boolean;
  message: string;
};


function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function optionalString(
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
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}


export async function createProvider(
  _previous: ProviderActionState,
  formData: FormData
): Promise<ProviderActionState> {
  await requireRole([
    "ADMIN",
  ]);


  const name =
    String(
      formData.get("name") ?? ""
    ).trim();


  const rawSlug =
    String(
      formData.get("slug") ?? ""
    ).trim();


  const websiteUrl =
    optionalString(
      formData.get("websiteUrl")
    );


  const rawStatus =
    String(
      formData.get("status") ??
        "CONFIGURED"
    ).trim();


  if (!name) {
    return {
      ok: false,
      message:
        "Provider name is required.",
    };
  }


  const slug =
    normalizeSlug(
      rawSlug || name
    );


  if (!slug) {
    return {
      ok: false,
      message:
        "A valid provider slug is required.",
    };
  }


  if (
    !Object.values(
      ProviderStatus
    ).includes(
      rawStatus as ProviderStatus
    )
  ) {
    return {
      ok: false,
      message:
        "Invalid provider status.",
    };
  }


  if (
    !isValidOptionalUrl(
      websiteUrl
    )
  ) {
    return {
      ok: false,
      message:
        "Website URL must be a valid http or https URL.",
    };
  }


  const duplicate =
    await prisma.affiliateProvider.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },

          {
            slug,
          },
        ],
      },

      select: {
        id: true,
      },
    });


  if (duplicate) {
    return {
      ok: false,
      message:
        "A provider with this name or slug already exists.",
    };
  }


  try {
    const provider =
      await prisma.affiliateProvider.create({
        data: {
          name,
          slug,
          websiteUrl,

          status:
            rawStatus as ProviderStatus,
        },
      });


    revalidatePath(
      "/admin/providers"
    );

    revalidatePath(
      `/admin/providers/${provider.id}`
    );


    return {
      ok: true,
      message:
        `Provider “${provider.name}” created successfully.`,
    };

  } catch (error) {
    console.error(
      "Failed to create provider:",
      error
    );


    return {
      ok: false,
      message:
        "Could not create the provider.",
    };
  }
}


export async function updateProvider(
  _previous: ProviderActionState,
  formData: FormData
): Promise<ProviderActionState> {
  await requireRole([
    "ADMIN",
  ]);


  const id =
    String(
      formData.get("id") ?? ""
    ).trim();


  const name =
    String(
      formData.get("name") ?? ""
    ).trim();


  const rawSlug =
    String(
      formData.get("slug") ?? ""
    ).trim();


  const websiteUrl =
    optionalString(
      formData.get("websiteUrl")
    );


  const rawStatus =
    String(
      formData.get("status") ??
        "CONFIGURED"
    ).trim();


  if (!id) {
    return {
      ok: false,
      message:
        "Missing provider ID.",
    };
  }


  if (!name) {
    return {
      ok: false,
      message:
        "Provider name is required.",
    };
  }


  const slug =
    normalizeSlug(
      rawSlug || name
    );


  if (!slug) {
    return {
      ok: false,
      message:
        "A valid provider slug is required.",
    };
  }


  if (
    !Object.values(
      ProviderStatus
    ).includes(
      rawStatus as ProviderStatus
    )
  ) {
    return {
      ok: false,
      message:
        "Invalid provider status.",
    };
  }


  if (
    !isValidOptionalUrl(
      websiteUrl
    )
  ) {
    return {
      ok: false,
      message:
        "Website URL must be a valid http or https URL.",
    };
  }


  const provider =
    await prisma.affiliateProvider.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });


  if (!provider) {
    return {
      ok: false,
      message:
        "Provider not found.",
    };
  }


  const duplicate =
    await prisma.affiliateProvider.findFirst({
      where: {
        NOT: {
          id,
        },

        OR: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },

          {
            slug,
          },
        ],
      },

      select: {
        id: true,
      },
    });


  if (duplicate) {
    return {
      ok: false,
      message:
        "Another provider already uses this name or slug.",
    };
  }


  try {
    const updated =
      await prisma.affiliateProvider.update({
        where: {
          id,
        },

        data: {
          name,
          slug,
          websiteUrl,

          status:
            rawStatus as ProviderStatus,
        },
      });


    revalidatePath(
      "/admin/providers"
    );

    revalidatePath(
      `/admin/providers/${id}`
    );

    revalidatePath(
      "/admin/products"
    );


    return {
      ok: true,
      message:
        `Provider “${updated.name}” updated successfully.`,
    };

  } catch (error) {
    console.error(
      "Failed to update provider:",
      error
    );


    return {
      ok: false,
      message:
        "Could not update the provider.",
    };
  }
}