"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(
  formData: FormData
) {
  await requireRole([
    "ADMIN",
    "EDITOR",
  ]);

  const name = String(
    formData.get("name") ?? ""
  ).trim();

  const rawSlug = String(
    formData.get("slug") ?? ""
  ).trim();

  const categoryId = String(
    formData.get("categoryId") ?? ""
  ).trim();

  const brandId = String(
    formData.get("brandId") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const editorialSummary = String(
    formData.get("editorialSummary") ?? ""
  ).trim();

  if (!name) {
    throw new Error(
      "Product name is required."
    );
  }

  if (!categoryId) {
    throw new Error(
      "Category is required."
    );
  }

  const slug = slugify(
    rawSlug || name
  );

  const existing =
    await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

  if (existing) {
    throw new Error(
      "A product with this slug already exists."
    );
  }

  const product =
    await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,

        brandId:
          brandId.length > 0
            ? brandId
            : null,

        description:
          description.length > 0
            ? description
            : null,

        editorialSummary:
          editorialSummary.length > 0
            ? editorialSummary
            : null,

        status:
          "DISCOVERED",
      },
    });

  revalidatePath(
    "/admin/products"
  );

  redirect(
    `/admin/products/${product.id}`
  );
}