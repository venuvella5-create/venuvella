"use client";

import {
  useActionState,
  useMemo,
  useState,
  useTransition,
} from "react";

import { updateArticle } from "@/app/admin/articles/edit-actions";
import { quickCreateProduct } from "@/app/admin/articles/quick-product";

import { ArticleReadinessPanel } from "@/components/admin/ArticleReadinessPanel";
import { ArticlePlacementPanel } from "@/components/admin/ArticlePlacementPanel";
import {
  getEditorialReadiness,
} from "@/lib/content/editorial-readiness";


const textBlockOptions = [
  "PARAGRAPH",
  "HEADING",
  "QUOTE",
  "BULLET_LIST",
  "NUMBERED_LIST",
] as const;


type TextBlockType =
  (typeof textBlockOptions)[number];


type TextBlock = {
  type: TextBlockType;
  text: string;
};


type ProductBlock = {
  type: "PRODUCT";
  productId: string;
};


type ProductGridBlock = {
  type: "PRODUCT_GRID";
  productIds: string[];
};


type Block =
  | TextBlock
  | ProductBlock
  | ProductGridBlock;


type ProductOption = {
  id: string;
  name: string;
  slug: string;
  editorialSummary: string | null;

  brand: {
    name: string;
  } | null;

  category: {
    name: string;
  };
};


type InitialArticle = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  featuredImage: string | null;
  categoryId: string;
  authorId: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
};


type PickerMode =
  | "single"
  | "grid"
  | null;


export function EditArticleEditor({
  article,
  categories,
  authors,
  products,
  providers = [],
}: {
  article: InitialArticle;

  categories: {
    id: string;
    name: string;
  }[];

  authors: {
    id: string;
    name: string;
  }[];

  products: ProductOption[];
  providers?: {
    id: string;
    name: string;
  }[];
}) {
  const [blocks, setBlocks] =
    useState<Block[]>(
      article.blocks.length
        ? article.blocks
        : [
            {
              type: "PARAGRAPH",
              text: "",
            },
          ]
    );


  const [title, setTitle] =
    useState(article.title);

  const [slug, setSlug] =
    useState(article.slug);

  const [excerpt, setExcerpt] =
    useState(
      article.excerpt ?? ""
    );

  const [
    featuredImage,
    setFeaturedImage,
  ] = useState(
    article.featuredImage ?? ""
  );

  const [seoTitle, setSeoTitle] =
    useState(article.seoTitle);

  const [
    seoDescription,
    setSeoDescription,
  ] = useState(
    article.seoDescription
  );

  const [status, setStatus] =
    useState(article.status);


  const [pickerMode, setPickerMode] =
    useState<PickerMode>(null);

  const [productSearch, setProductSearch] =
    useState("");

  const [
    selectedProductIds,
    setSelectedProductIds,
  ] = useState<string[]>([]);

  // ── Quick-create a product from inside the editor ──────────────
  const [showQuick, setShowQuick] =
    useState(false);
  const [quickName, setQuickName] =
    useState("");
  const [quickCategoryId, setQuickCategoryId] =
    useState(article.categoryId);
  const [quickImage, setQuickImage] =
    useState("");
  const [quickBuyUrl, setQuickBuyUrl] =
    useState("");
  const [quickProviderId, setQuickProviderId] =
    useState("");
  const [quickPrice, setQuickPrice] =
    useState("");
  const [quickSummary, setQuickSummary] =
    useState("");
  const [quickError, setQuickError] =
    useState("");
  const [quickPending, startQuick] =
    useTransition();
  const [extraProducts, setExtraProducts] =
    useState<ProductOption[]>([]);

  const allProducts = useMemo(
    () => [...extraProducts, ...products],
    [extraProducts, products]
  );

  function handleQuickCreate() {
    setQuickError("");

    startQuick(async () => {
      const result = await quickCreateProduct({
        name: quickName,
        categoryId: quickCategoryId,
        imageUrl: quickImage,
        buyUrl: quickBuyUrl,
        providerId: quickProviderId,
        price: quickPrice,
        summary: quickSummary,
      });

      if (!result.ok) {
        setQuickError(result.message);
        return;
      }

      setExtraProducts((current) => [
        result.product,
        ...current,
      ]);

      setQuickName("");
      setQuickImage("");
      setQuickBuyUrl("");
      setQuickPrice("");
      setQuickSummary("");
      setShowQuick(false);

      if (pickerMode === "grid") {
        setSelectedProductIds((current) => [
          ...current,
          result.product.id,
        ]);
      } else {
        insertSingleProduct(result.product.id);
      }
    });
  }

  function quickEnter(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleQuickCreate();
    }
  }


  const [state, action, pending] =
    useActionState(updateArticle, {
      ok: false,
      message: "",
    });


  const readiness = useMemo(
    () =>
      getEditorialReadiness({
        title,
        slug,
        excerpt,
        featuredImage,
        seoTitle,
        seoDescription,
        blocks,
      }),
    [
      title,
      slug,
      excerpt,
      featuredImage,
      seoTitle,
      seoDescription,
      blocks,
    ]
  );


  const placement = useMemo(() => {
    const productBlocks =
      blocks.filter(
        (block) =>
          block.type === "PRODUCT" ||
          block.type === "PRODUCT_GRID"
      );

    const productIds =
      productBlocks.flatMap(
        (block) =>
          block.type === "PRODUCT"
            ? [block.productId]
            : block.productIds
      );

    const distinctProductCount =
      new Set(productIds).size;

    const firstProductIndex =
      blocks.findIndex(
        (block) =>
          block.type === "PRODUCT" ||
          block.type === "PRODUCT_GRID"
      );

    return {
      productBlockCount:
        productBlocks.length,

      distinctProductCount,

      firstProductIndex:
        firstProductIndex === -1
          ? null
          : firstProductIndex,
    };
  }, [blocks]);


  const serialized = useMemo(() => {
    return JSON.stringify(
      blocks.map((block) => {

        if (
          block.type === "PRODUCT"
        ) {
          return {
            type: "PRODUCT",

            data: {
              productId:
                block.productId,
            },
          };
        }


        if (
          block.type ===
          "PRODUCT_GRID"
        ) {
          return {
            type:
              "PRODUCT_GRID",

            data: {
              productIds:
                block.productIds,
            },
          };
        }


        return {
          type: block.type,

          data: {
            text: block.text,
          },
        };
      })
    );
  }, [blocks]);


  const filteredProducts =
    useMemo(() => {
      const search =
        productSearch
          .trim()
          .toLowerCase();


      if (!search) {
        return allProducts;
      }


      return allProducts.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(search) ||

          product.brand?.name
            .toLowerCase()
            .includes(search) ||

          product.category.name
            .toLowerCase()
            .includes(search)
      );
    }, [
      allProducts,
      productSearch,
    ]);


  function closePicker() {
    setPickerMode(null);
    setShowQuick(false);
    setQuickError("");
    setProductSearch("");
    setSelectedProductIds([]);
  }


  function updateTextBlock(
    index: number,
    patch: Partial<TextBlock>
  ) {
    setBlocks((current) =>
      current.map(
        (
          block,
          currentIndex
        ) => {

          if (
            currentIndex !== index ||
            block.type ===
              "PRODUCT" ||
            block.type ===
              "PRODUCT_GRID"
          ) {
            return block;
          }


          return {
            ...block,
            ...patch,
          };
        }
      )
    );
  }


  function removeBlock(
    index: number
  ) {
    setBlocks((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }


  function addTextBlock() {
    setBlocks((current) => [
      ...current,

      {
        type: "PARAGRAPH",
        text: "",
      },
    ]);
  }


  function insertSingleProduct(
    productId: string
  ) {
    setBlocks((current) => [
      ...current,

      {
        type: "PRODUCT",
        productId,
      },
    ]);

    closePicker();
  }


  function toggleGridProduct(
    productId: string
  ) {
    setSelectedProductIds(
      (current) =>
        current.includes(productId)
          ? current.filter(
              (id) =>
                id !== productId
            )
          : [
              ...current,
              productId,
            ]
    );
  }


  function insertProductGrid() {
    if (
      selectedProductIds.length ===
      0
    ) {
      return;
    }


    setBlocks((current) => [
      ...current,

      {
        type:
          "PRODUCT_GRID",

        productIds:
          selectedProductIds,
      },
    ]);

    closePicker();
  }


  function getProduct(
    productId: string
  ) {
    return allProducts.find(
      (product) =>
        product.id === productId
    );
  }


  return (
    <form
      action={action}
      className="space-y-8"
    >

      <input
        type="hidden"
        name="id"
        value={article.id}
        readOnly
      />


      <input
        type="hidden"
        name="blocks"
        value={serialized}
        readOnly
      />


      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

        <section className="space-y-5 rounded-2xl border border-[var(--line)] bg-white p-6">

          <div>
            <label className="admin-label">
              Title
            </label>

            <input
              name="title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              required
              className="admin-input text-2xl font-serif"
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              {title.length} characters.
            </p>
          </div>


          <div>
            <label className="admin-label">
              Slug
            </label>

            <input
              name="slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                )
              }
              required
              className="admin-input"
            />
          </div>


          <div>
            <label className="admin-label">
              Subtitle
            </label>

            <textarea
              name="subtitle"
              defaultValue={
                article.subtitle ??
                ""
              }
              className="admin-input min-h-20"
            />
          </div>


          <div>
            <label className="admin-label">
              Excerpt
            </label>

            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(event) =>
                setExcerpt(
                  event.target.value
                )
              }
              className="admin-input min-h-24"
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              {excerpt.length} characters ·
              aim for 60–180.
            </p>
          </div>


          <div>
            <label className="admin-label">
              Featured image URL
            </label>

            <input
              name="featuredImage"
              type="url"
              value={featuredImage}
              onChange={(event) =>
                setFeaturedImage(
                  event.target.value
                )
              }
              className="admin-input"
            />
          </div>

        </section>


        <aside className="space-y-5 rounded-2xl border border-[var(--line)] bg-[#efeee9] p-6">

          <div>
            <label className="admin-label">
              Category
            </label>

            <select
              name="categoryId"
              defaultValue={
                article.categoryId
              }
              className="admin-input"
            >
              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label className="admin-label">
              Author
            </label>

            <select
              name="authorId"
              defaultValue={
                article.authorId
              }
              className="admin-input"
            >
              {authors.map(
                (author) => (
                  <option
                    key={author.id}
                    value={author.id}
                  >
                    {author.name}
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label className="admin-label">
              Status
            </label>

            <select
              name="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="admin-input"
            >
              <option value="DRAFT">
                Draft
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </div>


          <div>
            <label className="admin-label">
              SEO title
            </label>

            <input
              name="seoTitle"
              value={seoTitle}
              onChange={(event) =>
                setSeoTitle(
                  event.target.value
                )
              }
              className="admin-input"
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              {(seoTitle || title).length}
              {" "}characters effective.
            </p>
          </div>


          <div>
            <label className="admin-label">
              SEO description
            </label>

            <textarea
              name="seoDescription"
              value={seoDescription}
              onChange={(event) =>
                setSeoDescription(
                  event.target.value
                )
              }
              className="admin-input min-h-24"
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              {(seoDescription || excerpt).length}
              {" "}characters effective.
            </p>
          </div>

        </aside>

      </div>


      <section className="rounded-2xl border border-[var(--line)] bg-white p-6">

        <div className="flex flex-wrap items-end justify-between gap-3">

          <div>
            <p className="admin-eyebrow">
              Article body
            </p>

            <h2 className="display-serif text-3xl">
              Edit the story
            </h2>
          </div>




        </div>


        <div className="sticky top-[88px] z-30 mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-white/95 p-3 shadow-sm backdrop-blur">
          <p className="admin-eyebrow px-1">Add to story</p>
          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={
                addTextBlock
              }
              className="admin-secondary"
            >
              + Add text block
            </button>


            <button
              type="button"
              onClick={() => {
                setPickerMode(
                  "single"
                );

                setSelectedProductIds(
                  []
                );
              }}
              className="admin-secondary"
            >
              + Insert product
            </button>


            <button
              type="button"
              onClick={() => {
                setPickerMode(
                  "grid"
                );

                setSelectedProductIds(
                  []
                );
              }}
              className="admin-secondary"
            >
              + Insert product grid
            </button>

            <button
              type="button"
              onClick={() => {
                setPickerMode("single");
                setSelectedProductIds([]);
                setShowQuick(true);
              }}
              className="admin-secondary"
            >
              + New product
            </button>
          </div>
        </div>

        {pickerMode && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[70] overflow-y-auto bg-black/40 px-4 py-10 sm:py-16"
          >
          <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--line)] bg-[#efeee9] p-5 shadow-2xl">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <p className="admin-eyebrow">
                  Product database
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  {pickerMode ===
                  "grid"
                    ? "Build a product grid"
                    : "Insert a product"}
                </h3>
              </div>


              <button
                type="button"
                onClick={
                  closePicker
                }
                className="admin-secondary"
              >
                Close
              </button>

            </div>


            <div className="mt-5 rounded-xl border border-[var(--line)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    Product not in the list yet?
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Create it here with its image and affiliate link. It is
                    published and added to this article straight away.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShowQuick((current) => !current)
                  }
                  className="admin-secondary"
                >
                  {showQuick
                    ? "Hide form"
                    : "+ Create a new product"}
                </button>
              </div>

              {showQuick && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium">
                      Product name *
                    </label>
                    <input
                      value={quickName}
                      onChange={(event) =>
                        setQuickName(event.target.value)
                      }
                      onKeyDown={quickEnter}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Category *
                    </label>
                    <select
                      value={quickCategoryId}
                      onChange={(event) =>
                        setQuickCategoryId(event.target.value)
                      }
                      className="admin-input w-full"
                    >
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Image URL (shows in the article)
                    </label>
                    <input
                      value={quickImage}
                      onChange={(event) =>
                        setQuickImage(event.target.value)
                      }
                      onKeyDown={quickEnter}
                      placeholder="https://…/photo.jpg"
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Store
                    </label>
                    <select
                      value={quickProviderId}
                      onChange={(event) =>
                        setQuickProviderId(event.target.value)
                      }
                      className="admin-input w-full"
                    >
                      <option value="">
                        Other / direct link
                      </option>
                      {providers.map((provider) => (
                        <option
                          key={provider.id}
                          value={provider.id}
                        >
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Your affiliate link
                    </label>
                    <input
                      value={quickBuyUrl}
                      onChange={(event) =>
                        setQuickBuyUrl(event.target.value)
                      }
                      onKeyDown={quickEnter}
                      placeholder="https://…"
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Price (USD, optional)
                    </label>
                    <input
                      value={quickPrice}
                      onChange={(event) =>
                        setQuickPrice(event.target.value)
                      }
                      onKeyDown={quickEnter}
                      inputMode="decimal"
                      placeholder="29.99"
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Short summary (optional)
                    </label>
                    <input
                      value={quickSummary}
                      onChange={(event) =>
                        setQuickSummary(event.target.value)
                      }
                      onKeyDown={quickEnter}
                      className="admin-input w-full"
                    />
                  </div>

                  {quickError && (
                    <p className="admin-error md:col-span-2">
                      {quickError}
                    </p>
                  )}

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleQuickCreate}
                      disabled={quickPending}
                      className="admin-primary"
                    >
                      {quickPending
                        ? "Creating…"
                        : pickerMode === "grid"
                          ? "Create and select"
                          : "Create and insert into article"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              type="search"
              value={
                productSearch
              }
              onChange={(
                event
              ) =>
                setProductSearch(
                  event.target.value
                )
              }
              className="admin-input mt-5"
              placeholder="Search by product, brand or category..."
            />


            {pickerMode ===
              "grid" && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                <p className="text-sm text-[var(--muted)]">
                  {
                    selectedProductIds.length
                  }{" "}
                  product
                  {selectedProductIds.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  selected
                </p>


                <button
                  type="button"
                  onClick={
                    insertProductGrid
                  }
                  disabled={
                    selectedProductIds.length ===
                    0
                  }
                  className="admin-primary"
                >
                  Insert{" "}
                  {
                    selectedProductIds.length
                  }{" "}
                  product
                  {selectedProductIds.length ===
                  1
                    ? ""
                    : "s"}
                </button>

              </div>
            )}


            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">

              {filteredProducts.length >
              0 ? (
                filteredProducts.map(
                  (product) => {

                    const selected =
                      selectedProductIds.includes(
                        product.id
                      );


                    return (
                      <div
                        key={
                          product.id
                        }
                        className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center"
                      >

                        <div>

                          <p className="font-medium">
                            {
                              product.name
                            }
                          </p>


                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {product
                              .brand
                              ?.name ??
                              "Venuvella"}
                            {" · "}
                            {
                              product
                                .category
                                .name
                            }
                          </p>


                          {product.editorialSummary && (
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                              {
                                product.editorialSummary
                              }
                            </p>
                          )}

                        </div>


                        {pickerMode ===
                        "single" ? (

                          <button
                            type="button"
                            onClick={() =>
                              insertSingleProduct(
                                product.id
                              )
                            }
                            className="admin-primary shrink-0"
                          >
                            Insert
                          </button>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              toggleGridProduct(
                                product.id
                              )
                            }
                            className={
                              selected
                                ? "admin-primary shrink-0"
                                : "admin-secondary shrink-0"
                            }
                          >
                            {selected
                              ? "Selected"
                              : "Select"}
                          </button>

                        )}

                      </div>
                    );
                  }
                )
              ) : (
                <p className="py-8 text-center text-sm text-[var(--muted)]">
                  No published products found.
                </p>
              )}

            </div>

          </div>
        </div>
        )}


        <div className="mt-6 space-y-4">

          {blocks.map(
            (block, index) => {

              if (
                block.type ===
                "PRODUCT"
              ) {
                const product =
                  getProduct(
                    block.productId
                  );


                return (
                  <div
                    key={`product-${block.productId}-${index}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div>

                        <p className="admin-eyebrow">
                          Product
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {product
                            ?.name ??
                            "Product unavailable"}
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          removeBlock(
                            index
                          )
                        }
                        className="admin-danger"
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                );
              }


              if (
                block.type ===
                "PRODUCT_GRID"
              ) {
                return (
                  <div
                    key={`grid-${index}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div>
                        <p className="admin-eyebrow">
                          Product grid
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {
                            block
                              .productIds
                              .length
                          }{" "}
                          products
                        </p>
                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          removeBlock(
                            index
                          )
                        }
                        className="admin-danger"
                      >
                        Remove
                      </button>

                    </div>


                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                      {block.productIds.map(
                        (
                          productId
                        ) => {

                          const product =
                            getProduct(
                              productId
                            );


                          return (
                            <div
                              key={
                                productId
                              }
                              className="rounded-lg border border-[var(--line)] bg-white p-3"
                            >
                              <p className="text-sm font-medium">
                                {product
                                  ?.name ??
                                  "Product unavailable"}
                              </p>

                              {product && (
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                  {product
                                    .brand
                                    ?.name ??
                                    "Venuvella"}
                                </p>
                              )}
                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                );
              }


              return (
                <div
                  key={`text-${index}`}
                  className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4"
                >

                  <div className="mb-3 flex flex-wrap gap-2">

                    <select
                      value={
                        block.type
                      }
                      onChange={(
                        event
                      ) =>
                        updateTextBlock(
                          index,
                          {
                            type:
                              event
                                .target
                                .value as TextBlockType,
                          }
                        )
                      }
                      className="admin-input max-w-52"
                    >
                      {textBlockOptions.map(
                        (option) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {option.replaceAll(
                              "_",
                              " "
                            )}
                          </option>
                        )
                      )}
                    </select>


                    <button
                      type="button"
                      onClick={() =>
                        removeBlock(
                          index
                        )
                      }
                      className="admin-danger"
                    >
                      Remove
                    </button>

                  </div>


                  <textarea
                    value={
                      block.text
                    }
                    onChange={(
                      event
                    ) =>
                      updateTextBlock(
                        index,
                        {
                          text:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                    className="admin-input min-h-28"
                  />

                </div>
              );
            }
          )}

        </div>

      </section>


      <ArticlePlacementPanel
        productBlockCount={
          placement.productBlockCount
        }
        distinctProductCount={
          placement.distinctProductCount
        }
        wordCount={
          readiness.wordCount
        }
        firstProductIndex={
          placement.firstProductIndex
        }
        blockCount={
          blocks.length
        }
      />


      <ArticleReadinessPanel
        readiness={readiness}
        status={status}
      />


      {state.message && (
        <p
          className={
            state.ok
              ? "admin-success"
              : "admin-error"
          }
        >
          {state.message}
        </p>
      )}


      <div className="flex justify-end">

        <button
          disabled={
            pending ||
            (status === "PUBLISHED" &&
              readiness.blockers.length > 0)
          }
          className="admin-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : status === "PUBLISHED"
              ? "Save & publish"
              : "Save changes"}
        </button>

      </div>

    </form>
  );
}