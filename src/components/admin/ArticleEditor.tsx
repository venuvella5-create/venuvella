"use client";

import {
  useActionState,
  useMemo,
  useState,
} from "react";

import { createArticle } from "@/app/admin/articles/actions";


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


type PickerMode =
  | "single"
  | "grid"
  | null;


export function ArticleEditor({
  categories,
  authors,
  products,
}: {
  categories: {
    id: string;
    name: string;
  }[];

  authors: {
    id: string;
    name: string;
  }[];

  products: ProductOption[];
}) {
  const [blocks, setBlocks] =
    useState<Block[]>([
      {
        type: "PARAGRAPH",
        text: "",
      },
    ]);


  const [pickerMode, setPickerMode] =
    useState<PickerMode>(null);

  const [productSearch, setProductSearch] =
    useState("");

  const [
    selectedProductIds,
    setSelectedProductIds,
  ] = useState<string[]>([]);


  const [state, action, pending] =
    useActionState(createArticle, {
      ok: false,
      message: "",
    });


  const serialized = useMemo(() => {
    return JSON.stringify(
      blocks.map((block) => {
        if (block.type === "PRODUCT") {
          return {
            type: "PRODUCT",

            data: {
              productId: block.productId,
            },
          };
        }


        if (
          block.type ===
          "PRODUCT_GRID"
        ) {
          return {
            type: "PRODUCT_GRID",

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


  const filteredProducts = useMemo(() => {
    const search =
      productSearch
        .trim()
        .toLowerCase();


    if (!search) {
      return products;
    }


    return products.filter(
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
  }, [products, productSearch]);


  function closePicker() {
    setPickerMode(null);
    setProductSearch("");
    setSelectedProductIds([]);
  }


  function updateTextBlock(
    index: number,
    patch: Partial<TextBlock>
  ) {
    setBlocks((current) =>
      current.map(
        (block, currentIndex) => {
          if (
            currentIndex !== index ||
            block.type === "PRODUCT" ||
            block.type === "PRODUCT_GRID"
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
          : [...current, productId]
    );
  }


  function insertProductGrid() {
    if (
      selectedProductIds.length === 0
    ) {
      return;
    }


    setBlocks((current) => [
      ...current,

      {
        type: "PRODUCT_GRID",
        productIds:
          selectedProductIds,
      },
    ]);

    closePicker();
  }


  function getProduct(
    productId: string
  ) {
    return products.find(
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
              required
              className="admin-input text-2xl font-serif"
              placeholder="Article title"
            />
          </div>


          <div>
            <label className="admin-label">
              Slug
            </label>

            <input
              name="slug"
              required
              className="admin-input"
              placeholder="article-title"
            />
          </div>


          <div>
            <label className="admin-label">
              Subtitle
            </label>

            <textarea
              name="subtitle"
              className="admin-input min-h-20"
              placeholder="A short editorial subtitle"
            />
          </div>


          <div>
            <label className="admin-label">
              Excerpt
            </label>

            <textarea
              name="excerpt"
              className="admin-input min-h-24"
              placeholder="A concise description for cards and search."
            />
          </div>


          <div>
            <label className="admin-label">
              Featured image URL
            </label>

            <input
              name="featuredImage"
              type="url"
              className="admin-input"
              placeholder="https://..."
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
              required
              className="admin-input"
            >
              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
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
              required
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
              defaultValue="DRAFT"
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
              className="admin-input"
              placeholder="Optional SEO title"
            />
          </div>


          <div>
            <label className="admin-label">
              SEO description
            </label>

            <textarea
              name="seoDescription"
              className="admin-input min-h-24"
              placeholder="Optional meta description"
            />
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
              Build the story
            </h2>
          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={addTextBlock}
              className="admin-secondary"
            >
              + Add text block
            </button>


            <button
              type="button"
              onClick={() => {
                setPickerMode("single");
                setSelectedProductIds([]);
              }}
              className="admin-secondary"
            >
              + Insert product
            </button>


            <button
              type="button"
              onClick={() => {
                setPickerMode("grid");
                setSelectedProductIds([]);
              }}
              className="admin-secondary"
            >
              + Insert product grid
            </button>

          </div>

        </div>


        {pickerMode && (
          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[#efeee9] p-5">

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
                onClick={closePicker}
                className="admin-secondary"
              >
                Close
              </button>

            </div>


            <input
              type="search"
              value={productSearch}
              onChange={(event) =>
                setProductSearch(
                  event.target.value
                )
              }
              className="admin-input mt-5"
              placeholder="Search by product, brand or category..."
            />


            {pickerMode === "grid" && (
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
                        key={product.id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center"
                      >

                        <div>

                          <p className="font-medium">
                            {
                              product.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {product.brand
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
        )}


        <div className="mt-6 space-y-4">

          {blocks.map(
            (block, index) => {

              /*
               * SINGLE PRODUCT
               */

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

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                      <div>

                        <p className="admin-eyebrow">
                          Product
                        </p>

                        <p className="mt-2 text-lg font-medium">
                          {product?.name ??
                            "Product unavailable"}
                        </p>


                        {product && (
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
                        )}

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


              /*
               * PRODUCT GRID
               */

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
                        (productId) => {

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


              /*
               * TEXT BLOCK
               */

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
                            key={option}
                            value={option}
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
                    value={block.text}
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
                    placeholder="Write this block..."
                  />

                </div>
              );
            }
          )}

        </div>

      </section>


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
          disabled={pending}
          className="admin-primary"
        >
          {pending
            ? "Saving…"
            : "Create article"}
        </button>

      </div>

    </form>
  );
}