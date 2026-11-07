import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel accepts request bodies up to about 4.5 MB. The editor shrinks
// pictures to well under this before uploading.
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

type StorageConfig = {
  url: string;
  key: string;
  bucket: string;
};

function getConfig(): StorageConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || "venuvella-images";

  if (!url || !key) {
    return null;
  }

  return { url, key, bucket };
}

/** Checks the file's first bytes, so a renamed non-image can't be uploaded. */
async function looksLikeImage(file: File, type: string) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  const starts = (...bytes: number[]) =>
    bytes.every((byte, index) => head[index] === byte);

  switch (type) {
    case "image/jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "image/png":
      return starts(0x89, 0x50, 0x4e, 0x47);
    case "image/gif":
      return starts(0x47, 0x49, 0x46, 0x38);
    case "image/webp":
      return (
        starts(0x52, 0x49, 0x46, 0x46) &&
        head[8] === 0x57 &&
        head[9] === 0x45 &&
        head[10] === 0x42 &&
        head[11] === 0x50
      );
    default:
      return false;
  }
}

function putObject(config: StorageConfig, path: string, file: File) {
  return fetch(
    `${config.url}/storage/v1/object/${config.bucket}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
        "Content-Type": file.type,
        "Cache-Control": "max-age=31536000",
        "x-upsert": "false",
      },
      body: file,
    }
  );
}

async function createBucket(config: StorageConfig) {
  return fetch(`${config.url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      apikey: config.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: true,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: Object.keys(ALLOWED_TYPES),
    }),
  });
}

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  // Only signed-in admins and editors may upload.
  try {
    await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return fail("Please sign in again to upload images.", 401);
  }

  const config = getConfig();

  if (!config) {
    return fail(
      "Image uploads are not set up yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment settings.",
      503
    );
  }

  let file: FormDataEntryValue | null;

  try {
    const form = await request.formData();
    file = form.get("file");
  } catch {
    return fail("The upload could not be read. Please try again.", 400);
  }

  if (!(file instanceof File) || file.size === 0) {
    return fail("Choose an image to upload.", 400);
  }

  const extension = ALLOWED_TYPES[file.type];

  if (!extension) {
    return fail("Use a JPG, PNG, WebP or GIF image.", 400);
  }

  if (file.size > MAX_BYTES) {
    return fail("That image is too large. Choose one under 4 MB.", 413);
  }

  if (!(await looksLikeImage(file, file.type))) {
    return fail("That file doesn't look like a real image.", 400);
  }

  const now = new Date();
  const path = [
    "uploads",
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.${extension}`,
  ].join("/");

  try {
    let response = await putObject(config, path, file);

    // First upload ever: the storage bucket doesn't exist yet, so create it.
    if (response.status === 404 || response.status === 400) {
      const text = await response.clone().text();

      if (/bucket not found/i.test(text)) {
        await createBucket(config);
        response = await putObject(config, path, file);
      }
    }

    if (!response.ok) {
      console.error(
        "Image upload failed:",
        response.status,
        await response.text()
      );

      return fail(
        "The image could not be saved. Please try again in a moment.",
        502
      );
    }
  } catch (error) {
    console.error("Image upload error:", error);

    return fail(
      "Could not reach image storage. Please try again in a moment.",
      502
    );
  }

  return NextResponse.json({
    ok: true,
    url: `${config.url}/storage/v1/object/public/${config.bucket}/${path}`,
  });
}
