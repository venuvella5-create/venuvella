"use client";

import {
  useActionState,
  useMemo,
  useState,
} from "react";

type ArticleOption = {
  id: string;
  title: string;
  slug: string;
  category: {
    name: string;
  };
};

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  brand: {
    name: string;
  } | null;
  category: {
    name: string;
  };
};

type CampaignInitial = {
  id?: string;
  issueNumber: number;
  subject: string;
  previewText: string;
  editorialIntro: string;
  status: string;
  scheduledAt: string;
  featuredArticleId: string;
  articleIds: string[];
  productIds: string[];
};

type ActionState = {
  ok: boolean;
  message: string;
};

export function NewsletterCampaignEditor({
  mode,
  initial,
  articles,
  products,
  action,
}: {
  mode: "create" | "edit";
  initial: CampaignInitial;
  articles: ArticleOption[];
  products: ProductOption[];
  action: (
    previousState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
}) {
  const [state, formAction, pending] =
    useActionState(action, {
      ok: false,
      message: "",
    });

  const [issueNumber, setIssueNumber] =
    useState(initial.issueNumber);

  const [subject, setSubject] =
    useState(initial.subject);

  const [previewText, setPreviewText] =
    useState(initial.previewText);

  const [editorialIntro, setEditorialIntro] =
    useState(initial.editorialIntro);

  const [status, setStatus] =
    useState(initial.status);

  const [scheduledAt, setScheduledAt] =
    useState(initial.scheduledAt);

  const [
    featuredArticleId,
    setFeaturedArticleId,
  ] = useState(
    initial.featuredArticleId
  );

  const [
    selectedArticleIds,
    setSelectedArticleIds,
  ] = useState<string[]>(
    initial.articleIds
  );

  const [
    selectedProductIds,
    setSelectedProductIds,
  ] = useState<string[]>(
    initial.productIds
  );

  const [articleSearch, setArticleSearch] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const campaignKey =
    `edit-${String(
      Math.max(
        1,
        Number.isFinite(issueNumber)
          ? issueNumber
          : 1
      )
    ).padStart(3, "0")}`;

  const slug =
    `venuvella-edit-${String(
      Math.max(
        1,
        Number.isFinite(issueNumber)
          ? issueNumber
          : 1
      )
    ).padStart(3, "0")}`;

  const filteredArticles = useMemo(
    () => {
      const query =
        articleSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return articles;
      }

      return articles.filter(
        (article) =>
          article.title
            .toLowerCase()
            .includes(query) ||
          article.category.name
            .toLowerCase()
            .includes(query)
      );
    },
    [
      articles,
      articleSearch,
    ]
  );

  const filteredProducts = useMemo(
    () => {
      const query =
        productSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.brand?.name
            .toLowerCase()
            .includes(query) ||
          product.category.name
            .toLowerCase()
            .includes(query)
      );
    },
    [
      products,
      productSearch,
    ]
  );

  function toggleArticle(
    articleId: string
  ) {
    setSelectedArticleIds(
      (current) =>
        current.includes(articleId)
          ? current.filter(
              (id) =>
                id !== articleId
            )
          : [
              ...current,
              articleId,
            ]
    );
  }

  function toggleProduct(
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

  return (
    <form
      action={formAction}
      className="space-y-8"
    >
      {initial.id && (
        <input
          type="hidden"
          name="id"
          value={initial.id}
          readOnly
        />
      )}

      <input
        type="hidden"
        name="articleIds"
        value={JSON.stringify(
          selectedArticleIds
        )}
        readOnly
      />

      <input
        type="hidden"
        name="productIds"
        value={JSON.stringify(
          selectedProductIds
        )}
        readOnly
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5 rounded-2xl border border-[var(--line)] bg-white p-6">
          <div>
            <label className="admin-label">
              Issue number
            </label>

            <input
              name="issueNumber"
              type="number"
              min="1"
              required
              value={issueNumber}
              onChange={(event) =>
                setIssueNumber(
                  Number(
                    event.target.value
                  )
                )
              }
              className="admin-input"
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              Campaign key:{" "}
              <span className="font-medium text-[var(--ink)]">
                {campaignKey}
              </span>
              {" · "}
              Slug:{" "}
              <span className="font-medium text-[var(--ink)]">
                {slug}
              </span>
            </p>
          </div>

          <div>
            <label className="admin-label">
              Subject line
            </label>

            <input
              name="subject"
              required
              value={subject}
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
              className="admin-input"
              placeholder="A sharper home edit for the week"
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              {subject.length} characters ·
              aim for roughly 35–60.
            </p>
          </div>

          <div>
            <label className="admin-label">
              Preview text
            </label>

            <textarea
              name="previewText"
              value={previewText}
              onChange={(event) =>
                setPreviewText(
                  event.target.value
                )
              }
              className="admin-input min-h-20"
              placeholder="A short inbox preview that supports the subject line."
            />

            <p className="mt-2 text-xs text-[var(--muted)]">
              {previewText.length} characters.
            </p>
          </div>

          <div>
            <label className="admin-label">
              Editorial introduction
            </label>

            <textarea
              name="editorialIntro"
              value={editorialIntro}
              onChange={(event) =>
                setEditorialIntro(
                  event.target.value
                )
              }
              className="admin-input min-h-40"
              placeholder="Write the opening note for this issue."
            />
          </div>
        </section>

        <aside className="space-y-5 rounded-2xl border border-[var(--line)] bg-[#efeee9] p-6">
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

              <option value="SCHEDULED">
                Scheduled
              </option>

              {mode === "edit" &&
                initial.status ===
                  "SENT" && (
                  <option value="SENT">
                    Sent
                  </option>
                )}

              <option value="ARCHIVED">
                Archived
              </option>
            </select>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              “Sent” is intentionally not
              available for new issues until
              the email delivery provider is
              connected in Phase 9.4B.
            </p>
          </div>

          {status === "SCHEDULED" && (
            <div>
              <label className="admin-label">
                Scheduled time
              </label>

              <input
                name="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) =>
                  setScheduledAt(
                    event.target.value
                  )
                }
                required
                className="admin-input"
              />

              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                This records the planned send
                time only. Automatic delivery
                will be connected in Phase
                9.4B.
              </p>
            </div>
          )}

          <div>
            <label className="admin-label">
              Featured article
            </label>

            <select
              name="featuredArticleId"
              value={featuredArticleId}
              onChange={(event) =>
                setFeaturedArticleId(
                  event.target.value
                )
              }
              className="admin-input"
            >
              <option value="">
                No featured article
              </option>

              {articles.map(
                (article) => (
                  <option
                    key={article.id}
                    value={article.id}
                  >
                    {article.title}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="admin-eyebrow">
              Issue summary
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <p>
                Supporting articles:{" "}
                <strong>
                  {
                    selectedArticleIds.length
                  }
                </strong>
              </p>

              <p>
                Products:{" "}
                <strong>
                  {
                    selectedProductIds.length
                  }
                </strong>
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <p className="admin-eyebrow">
          Worth reading
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display-serif text-3xl">
              Supporting articles
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Select the stories that should
              appear below the lead article.
              Their order follows the order in
              which you select them.
            </p>
          </div>

          <input
            type="search"
            value={articleSearch}
            onChange={(event) =>
              setArticleSearch(
                event.target.value
              )
            }
            placeholder="Search articles..."
            className="admin-input max-w-sm"
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {filteredArticles.map(
            (article) => {
              const selected =
                selectedArticleIds.includes(
                  article.id
                );

              return (
                <button
                  key={article.id}
                  type="button"
                  onClick={() =>
                    toggleArticle(
                      article.id
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-[var(--ink)] bg-[#efeee9]"
                      : "border-[var(--line)] bg-white hover:border-[var(--ink)]"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                    {
                      article.category
                        .name
                    }
                  </p>

                  <p className="mt-2 font-semibold">
                    {article.title}
                  </p>

                  <p className="mt-3 text-xs font-medium">
                    {selected
                      ? "Selected"
                      : "Add to issue"}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <p className="admin-eyebrow">
          The edit
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display-serif text-3xl">
              Product selections
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Choose a small, useful set of
              products. These will later carry
              newsletter campaign attribution
              through your existing product and
              retailer flow.
            </p>
          </div>

          <input
            type="search"
            value={productSearch}
            onChange={(event) =>
              setProductSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="admin-input max-w-sm"
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {filteredProducts.map(
            (product) => {
              const selected =
                selectedProductIds.includes(
                  product.id
                );

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    toggleProduct(
                      product.id
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-[var(--ink)] bg-[#efeee9]"
                      : "border-[var(--line)] bg-white hover:border-[var(--ink)]"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">
                    {product.brand
                      ?.name ??
                      "Venuvella"}
                    {" · "}
                    {
                      product.category
                        .name
                    }
                  </p>

                  <p className="mt-2 font-semibold">
                    {product.name}
                  </p>

                  <p className="mt-3 text-xs font-medium">
                    {selected
                      ? "Selected"
                      : "Add to issue"}
                  </p>
                </button>
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
          className="admin-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create issue"
              : "Save issue"}
        </button>
      </div>
    </form>
  );
}
