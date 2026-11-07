"use client";

import { useRef, useState } from "react";

type Props = {
  /** Form field name. Use it inside a normal <form> (uncontrolled). */
  name?: string;
  /** Controlled use: pass value and onChange together. */
  value?: string;
  onChange?: (url: string) => void;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
};

const MAX_SIDE = 1600;

/**
 * Shrinks big photos in the browser before uploading, so pictures from a
 * phone or camera (often 5 MB or more) become a few hundred KB. This also
 * makes pages load faster.
 */
async function prepareImage(file: File): Promise<File> {
  // Keep GIFs as they are, so animations survive.
  if (file.type === "image/gif") {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
  } catch {
    throw new Error(
      "That picture format isn't supported. Use a JPG, PNG or WebP image."
    );
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  // WebP keeps transparency; if the browser can't make WebP, fall back to
  // JPEG on a white background (so see-through areas don't turn black).
  const supportsWebp = canvas
    .toDataURL("image/webp")
    .startsWith("data:image/webp");
  const type = supportsWebp ? "image/webp" : "image/jpeg";

  if (!supportsWebp) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.85)
  );

  if (!blob) {
    return file;
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "image";

  return new File([blob], `${base}.${supportsWebp ? "webp" : "jpg"}`, {
    type,
  });
}

export function ImageUploadField({
  name,
  value,
  onChange,
  defaultValue = "",
  required,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const current = value ?? inner;

  function setCurrent(url: string) {
    if (value === undefined) {
      setInner(url);
    }
    onChange?.(url);
  }

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const chosen = event.target.files?.[0];

    // Allow choosing the same file again later.
    event.target.value = "";

    if (!chosen) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      if (!chosen.type.startsWith("image/")) {
        throw new Error("Please choose an image file.");
      }

      const prepared = await prepareImage(chosen);

      const form = new FormData();
      form.append("file", prepared);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: form,
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        url?: string;
        message?: string;
      } | null;

      if (!response.ok || !data?.ok || !data.url) {
        throw new Error(
          data?.message ?? "The upload failed. Please try again."
        );
      }

      setCurrent(data.url);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "The upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="admin-secondary"
        >
          {uploading
            ? "Uploading…"
            : current
              ? "Replace image"
              : "Upload image"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          className="hidden"
        />

        {current && (
          <button
            type="button"
            onClick={() => setCurrent("")}
            className="text-xs underline"
          >
            Remove
          </button>
        )}
      </div>

      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt=""
          className="h-28 w-28 rounded-lg border border-[var(--line)] object-cover"
        />
      )}

      {error && <p className="admin-error">{error}</p>}

      <input
        name={name}
        type="url"
        value={current}
        required={required}
        onChange={(event) => setCurrent(event.target.value)}
        placeholder={placeholder ?? "…or paste an image link"}
        className="admin-input w-full"
      />
    </div>
  );
}
