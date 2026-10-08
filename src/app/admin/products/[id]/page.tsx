import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  requirePageRole,
} from "@/lib/auth/require-admin";

import {
  deleteProviderMapping,
  setProductStatus,
  addProductImage,
  removeProductImage,
} from "@/app/admin/products/actions";

import {
  ProviderMappingForm,
} from "@/components/admin/ProviderMappingForm";


export const dynamic =
  "force-dynamic";


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


function getExternalIdLabel(
  providerName: string
) {
  const kind =
    getProviderKind(
      providerName
    );


  if (
    kind ===
    "amazon"
  ) {
    return "ASIN";
  }


  if (
    kind ===
    "walmart"
  ) {
    return "Walmart item ID";
  }


  return "External ID";
}


function getSyncStatusLabel(
  status: string
) {
  switch (status) {
    case "SUCCESS":
      return "Ready";

    case "PENDING":
      return "Pending";

    case "STALE":
      return "Needs update";

    case "FAILED":
      return "Failed";

    default:
      return status
        .replaceAll(
          "_",
          " "
        )
        .toLowerCase()
        .replace(
          /^./,
          (character) =>
            character.toUpperCase()
        );
  }
}


function getSyncStatusClasses(
  status: string
) {
  switch (status) {
    case "SUCCESS":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case "FAILED":
      return "border-rose-300 bg-rose-50 text-rose-800";

    case "STALE":
      return "border-orange-300 bg-orange-50 text-orange-800";

    case "PENDING":
    default:
      return "border-amber-300 bg-amber-50 text-amber-800";
  }
}


function getProductStatusClasses(
  status: string
) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";

    case "SYNCED":
      return "border-blue-300 bg-blue-50 text-blue-800";

    case "PENDING_REVIEW":
      return "border-amber-300 bg-amber-50 text-amber-800";

    case "STALE":
      return "border-orange-300 bg-orange-50 text-orange-800";

    case "UNAVAILABLE":
      return "border-rose-300 bg-rose-50 text-rose-800";

    case "ARCHIVED":
      return "border-slate-300 bg-slate-100 text-slate-700";

    default:
      return "border-[var(--line)] bg-white text-[var(--ink)]";
  }
}


function formatLabel(
  value: string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /^./,
      (character) =>
        character.toUpperCase()
    );
}


function formatDateTime(
  value:
    | Date
    | null
    | undefined
) {
  if (!value) {
    return "Never";
  }


  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    value
  );
}


function formatMoney(
  price: unknown,
  currency:
    | string
    | null
    | undefined
) {
  if (
    price === null ||
    price === undefined
  ) {
    return "—";
  }


  const numericValue =
    Number(
      price
    );


  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return String(
      price
    );
  }


  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style:
          "currency",

        currency:
          currency ||
          "USD",
      }
    ).format(
      numericValue
    );
  } catch {
    return `${currency ?? ""} ${numericValue}`.trim();
  }
}


export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
}) {
  await requirePageRole([
    "ADMIN",
    "EDITOR",
  ]);


  const {
    id,
  } = await params;

  const {
    created,
  } = await searchParams;


  const [
    product,
    providers,
  ] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        brand: true,

        category: true,

        images: {
          orderBy: {
            position: "asc",
          },
        },

        providerProducts: {
          include: {
            provider: true,
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
    }),

    prisma.affiliateProvider.findMany({
      orderBy: {
        name:
          "asc",
      },
    }),
  ]);


  if (!product) {
    notFound();
  }


  const providerOptions =
    providers.map(
      (provider) => ({
        id:
          provider.id,

        name:
          provider.name,
      })
    );


  const amazonMappingCount =
    product.providerProducts.filter(
      (mapping) =>
        getProviderKind(
          mapping.provider.name
        ) ===
        "amazon"
    ).length;


  const walmartMappingCount =
    product.providerProducts.filter(
      (mapping) =>
        getProviderKind(
          mapping.provider.name
        ) ===
        "walmart"
    ).length;


  const readyMappingCount =
    product.providerProducts.filter(
      (mapping) =>
        mapping.syncStatus ===
        "SUCCESS"
    ).length;


  const failedMappingCount =
    product.providerProducts.filter(
      (mapping) =>
        mapping.syncStatus ===
        "FAILED"
    ).length;


  const staleMappingCount =
    product.providerProducts.filter(
      (mapping) =>
        mapping.syncStatus ===
        "STALE"
    ).length;


  const pendingMappingCount =
    product.providerProducts.filter(
      (mapping) =>
        mapping.syncStatus ===
        "PENDING"
    ).length;


  const mappingsWithAffiliateLinks =
    product.providerProducts.filter(
      (mapping) =>
        Boolean(
          mapping.affiliateUrl
        )
    ).length;


  const mappingsWithoutAffiliateLinks =
    product.providerProducts.length -
    mappingsWithAffiliateLinks;


  const mostRecentSync =
    product.providerProducts
      .map(
        (mapping) =>
          mapping.lastSyncedAt
      )
      .filter(
        (
          value
        ): value is Date =>
          value instanceof Date
      )
      .sort(
        (a, b) =>
          b.getTime() -
          a.getTime()
      )[0] ??
    null;


  const primaryMapping =
    product.providerProducts[0] ??
    null;


  const requiresAttention =
    failedMappingCount >
      0 ||
    staleMappingCount >
      0 ||
    mappingsWithoutAffiliateLinks >
      0;


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        {created && (
          <p className="admin-success mb-6">
            Product created.
            {product.status === "PUBLISHED"
              ? " It is live on the site."
              : " It is saved as a draft — press Publish to put it on the site."}
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white p-5">
          <div>
            <p className="admin-eyebrow">Visibility</p>
            <p className="mt-1 text-sm font-semibold">
              {product.status === "PUBLISHED"
                ? "Published — visible on the site and in the article editor"
                : `Not published (${formatLabel(product.status)}) — hidden from the site and from articles`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.status === "PUBLISHED" ? (
              <>
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-secondary"
                >
                  View live page
                </Link>

                <form action={setProductStatus}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="status" value="DISCOVERED" />
                  <button type="submit" className="admin-secondary">
                    Unpublish
                  </button>
                </form>
              </>
            ) : (
              <form action={setProductStatus}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="status" value="PUBLISHED" />
                <button type="submit" className="admin-primary">
                  Publish product
                </button>
              </form>
            )}
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-[var(--line)] bg-white p-5">
          <p className="admin-eyebrow">Product images</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Paste a direct link to an image. The first image is the main one.
          </p>

          {product.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {product.images.map((image, index) => (
                <div key={image.id} className="rounded-xl border border-[var(--line)] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.altText ?? product.name}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>{index === 0 ? "Main image" : `Image ${index + 1}`}</span>
                    <form action={removeProductImage}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit" className="underline">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm font-semibold">
              No image yet — add one below.
            </p>
          )}

          <form action={addProductImage} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input
              name="url"
              type="url"
              required
              placeholder="https://…/photo.jpg"
              className="admin-input min-w-[260px] flex-1"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="makeMain" defaultChecked />
              Make main image
            </label>
            <button type="submit" className="admin-primary">
              Add image
            </button>
          </form>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <Link
            href="/admin/products"
            className="admin-link"
          >
            ← Products
          </Link>


          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/provider-sync"
              className="admin-secondary"
            >
              Provider sync
            </Link>


            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className="admin-secondary"
            >
              View product
            </Link>

          </div>

        </div>


        <header className="mt-6">

          <p className="admin-eyebrow">
            Commerce / Product
          </p>


          <div className="mt-2 flex flex-wrap items-start justify-between gap-6">

            <div className="max-w-4xl">

              <h1 className="display-serif text-5xl">
                {product.name}
              </h1>


              <div className="mt-4 flex flex-wrap items-center gap-3">

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getProductStatusClasses(
                    product.status
                  )}`}
                >
                  {formatLabel(
                    product.status
                  )}
                </span>


                <span className="text-sm text-[var(--muted)]">
                  {product.brand?.name ??
                    "Venuvella"}
                </span>


                <span className="text-sm text-[var(--muted)]">
                  {product.category.name}
                </span>

              </div>

            </div>

          </div>

        </header>


        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Destinations
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {product.providerProducts.length}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Total provider mappings
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Ready
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {readyMappingCount}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Active destinations
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Attention
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {failedMappingCount +
                staleMappingCount}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Failed or stale
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Amazon
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {amazonMappingCount}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Amazon mappings
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Walmart
            </p>


            <p className="mt-3 text-3xl font-semibold">
              {walmartMappingCount}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Walmart mappings
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Last sync
            </p>


            <p className="mt-3 text-sm font-semibold">
              {formatDateTime(
                mostRecentSync
              )}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Most recent destination sync
            </p>

          </div>

        </section>


        {requiresAttention && (
          <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

            <p className="font-semibold">
              Product requires attention
            </p>


            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">

              {failedMappingCount >
                0 && (
                <span>
                  {failedMappingCount} failed{" "}
                  {failedMappingCount ===
                  1
                    ? "mapping"
                    : "mappings"}
                </span>
              )}


              {staleMappingCount >
                0 && (
                <span>
                  {staleMappingCount} stale{" "}
                  {staleMappingCount ===
                  1
                    ? "mapping"
                    : "mappings"}
                </span>
              )}


              {mappingsWithoutAffiliateLinks >
                0 && (
                <span>
                  {mappingsWithoutAffiliateLinks} without affiliate{" "}
                  {mappingsWithoutAffiliateLinks ===
                  1
                    ? "link"
                    : "links"}
                </span>
              )}

            </div>

          </section>
        )}


        <section className="mt-8 grid gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Product status
            </p>


            <p className="mt-3 font-semibold">
              {formatLabel(
                product.status
              )}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Current catalog state
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Updated
            </p>


            <p className="mt-3 text-sm font-semibold">
              {formatDateTime(
                product.updatedAt
              )}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Product record
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Affiliate links
            </p>


            <p className="mt-3 text-2xl font-semibold">
              {mappingsWithAffiliateLinks}
              <span className="text-sm font-normal text-[var(--muted)]">
                {" "}
                / {product.providerProducts.length}
              </span>
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Configured destinations
            </p>

          </div>


          <div className="rounded-2xl border border-[var(--line)] bg-white p-5">

            <p className="admin-eyebrow">
              Primary destination
            </p>


            <p className="mt-3 font-semibold">
              {primaryMapping
                ? primaryMapping.provider.name
                : "None"}
            </p>


            <p className="mt-2 text-xs text-[var(--muted)]">
              Lowest priority number
            </p>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Manual affiliate workflow
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Amazon + Walmart
          </h2>


          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Venuvella owns the editorial
            product record. Amazon,
            Walmart, and other merchants
            are maintained as independent
            shopping destinations so one
            product can connect to
            multiple affiliate providers.
          </p>


          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="rounded-xl border border-[var(--line)] bg-[#f4f3ee] p-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold">
                    Amazon Associates
                  </p>


                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Current mode: Manual
                  </p>

                </div>


                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                  Manual
                </span>

              </div>


              <div className="mt-5 space-y-2 text-xs leading-5 text-[var(--muted)]">

                <p>
                  1. Find the product on Amazon.
                </p>


                <p>
                  2. Copy its 10-character ASIN.
                </p>


                <p>
                  3. Generate the approved Amazon Associates affiliate link.
                </p>


                <p>
                  4. Add the ASIN and destination information below.
                </p>


                <p>
                  5. Mark the mapping Ready after verifying the destination.
                </p>

              </div>


              <p className="mt-5 text-xs font-semibold">
                Future:{" "}
                <span className="font-normal text-[var(--muted)]">
                  Creators API adapter
                </span>
              </p>

            </div>


            <div className="rounded-xl border border-[var(--line)] bg-[#f4f3ee] p-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold">
                    Walmart Affiliate
                  </p>


                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Current mode: Manual
                  </p>

                </div>


                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                  Manual
                </span>

              </div>


              <div className="mt-5 space-y-2 text-xs leading-5 text-[var(--muted)]">

                <p>
                  1. Find the product on Walmart.
                </p>


                <p>
                  2. Record its Walmart item or product ID.
                </p>


                <p>
                  3. Generate the approved affiliate tracking link.
                </p>


                <p>
                  4. Add the destination information below.
                </p>


                <p>
                  5. Mark the mapping Ready after verification.
                </p>

              </div>


              <p className="mt-5 text-xs font-semibold">
                Future:{" "}
                <span className="font-normal text-[var(--muted)]">
                  approved affiliate feed / API
                </span>
              </p>

            </div>

          </div>

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="admin-eyebrow">
                Provider mappings
              </p>


              <h2 className="display-serif mt-2 text-3xl">
                Shopping destinations
              </h2>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Manage merchant identifiers,
                product URLs, affiliate URLs,
                pricing, availability,
                priority, and sync health for
                this product.
              </p>

            </div>


            <div className="flex flex-wrap gap-2 text-xs">

              {readyMappingCount >
                0 && (
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                  {readyMappingCount} ready
                </span>
              )}


              {pendingMappingCount >
                0 && (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-semibold text-amber-800">
                  {pendingMappingCount} pending
                </span>
              )}


              {staleMappingCount >
                0 && (
                <span className="rounded-full border border-orange-300 bg-orange-50 px-3 py-1 font-semibold text-orange-800">
                  {staleMappingCount} stale
                </span>
              )}


              {failedMappingCount >
                0 && (
                <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 font-semibold text-rose-800">
                  {failedMappingCount} failed
                </span>
              )}

            </div>

          </div>


          {product.providerProducts.length >
          0 ? (
            <div className="mt-8 space-y-6">

              {product.providerProducts.map(
                (mapping) => {
                  const providerKind =
                    getProviderKind(
                      mapping.provider.name
                    );


                  return (
                    <article
                      key={
                        mapping.id
                      }
                      className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5"
                    >

                      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="admin-eyebrow">
                              Provider mapping
                            </p>


                            {(
                              providerKind ===
                                "amazon" ||
                              providerKind ===
                                "walmart"
                            ) && (
                              <span className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">
                                Manual affiliate
                              </span>
                            )}

                          </div>


                          <h3 className="mt-2 text-xl font-semibold">
                            {mapping.provider.name}
                          </h3>


                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]">

                            <span>
                              {getExternalIdLabel(
                                mapping.provider.name
                              )}
                              :{" "}
                              <span className="font-medium text-[var(--ink)]">
                                {mapping.externalProductId}
                              </span>
                            </span>


                            <span>
                              Priority:{" "}
                              <span className="font-medium text-[var(--ink)]">
                                {mapping.priority}
                              </span>
                            </span>


                            <span>
                              Price:{" "}
                              <span className="font-medium text-[var(--ink)]">
                                {formatMoney(
                                  mapping.price,
                                  mapping.currency
                                )}
                              </span>
                            </span>


                            <span>
                              Last sync:{" "}
                              <span className="font-medium text-[var(--ink)]">
                                {formatDateTime(
                                  mapping.lastSyncedAt
                                )}
                              </span>
                            </span>

                          </div>

                        </div>


                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getSyncStatusClasses(
                              mapping.syncStatus
                            )}`}
                          >
                            {getSyncStatusLabel(
                              mapping.syncStatus
                            )}
                          </span>


                          {mapping.productUrl && (
                            <a
                              href={
                                mapping.productUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-secondary"
                            >
                              Product
                            </a>
                          )}


                          {mapping.affiliateUrl && (
                            <a
                              href={
                                mapping.affiliateUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-secondary"
                            >
                              Test affiliate link
                            </a>
                          )}


                          <form
                            action={
                              deleteProviderMapping
                            }
                          >

                            <input
                              type="hidden"
                              name="mappingId"
                              value={
                                mapping.id
                              }
                            />


                            <input
                              type="hidden"
                              name="productId"
                              value={
                                product.id
                              }
                            />


                            <button
                              type="submit"
                              className="admin-danger"
                            >
                              Remove
                            </button>

                          </form>

                        </div>

                      </div>


                      {!mapping.affiliateUrl && (
                        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">

                          <p className="text-sm font-semibold">
                            Affiliate link missing
                          </p>


                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            This destination does
                            not currently have an
                            affiliate URL. Add and
                            verify one before using
                            this destination for
                            monetized outbound
                            traffic.
                          </p>

                        </div>
                      )}


                      {mapping.syncStatus ===
                        "FAILED" && (
                        <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50 p-4">

                          <p className="text-sm font-semibold">
                            Sync failed
                          </p>


                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            Review this mapping and
                            verify its external ID,
                            URLs, provider
                            configuration, and
                            availability before the
                            next sync.
                          </p>

                        </div>
                      )}


                      {mapping.syncStatus ===
                        "STALE" && (
                        <div className="mb-6 rounded-xl border border-orange-300 bg-orange-50 p-4">

                          <p className="text-sm font-semibold">
                            Mapping needs an update
                          </p>


                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            The provider data has
                            been marked stale.
                            Confirm the current
                            product destination,
                            pricing, and
                            availability.
                          </p>

                        </div>
                      )}


                      <ProviderMappingForm
                        productId={
                          product.id
                        }

                        providers={
                          providerOptions
                        }

                        mapping={{
                          id:
                            mapping.id,

                          providerId:
                            mapping.providerId,

                          externalProductId:
                            mapping.externalProductId,

                          productUrl:
                            mapping.productUrl,

                          affiliateUrl:
                            mapping.affiliateUrl,

                          price:
                            mapping.price?.toString() ??
                            null,

                          currency:
                            mapping.currency,

                          availability:
                            mapping.availability,

                          priority:
                            mapping.priority,

                          syncStatus:
                            mapping.syncStatus,
                        }}
                      />

                    </article>
                  );
                }
              )}

            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-8 text-center">

              <p className="text-sm font-semibold">
                No affiliate destinations yet.
              </p>


              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Connect Amazon, Walmart,
                or another approved
                provider using the form
                below.
              </p>

            </div>
          )}

        </section>


        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Add provider mapping
          </p>


          <h2 className="display-serif mt-2 text-3xl">
            Connect another provider
          </h2>


          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Add another merchant or
            affiliate shopping destination
            for this Venuvella product.
          </p>


          {providers.length >
          0 ? (
            <div className="mt-8">

              <ProviderMappingForm
                productId={
                  product.id
                }

                providers={
                  providerOptions
                }
              />

            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] p-8">

              <p className="text-sm font-semibold">
                No affiliate providers exist yet.
              </p>


              <p className="mt-2 text-sm text-[var(--muted)]">
                Create a provider before
                connecting this product to
                a shopping destination.
              </p>


              <Link
                href="/admin/providers/new"
                className="admin-primary mt-5 inline-flex"
              >
                Create provider
              </Link>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}
