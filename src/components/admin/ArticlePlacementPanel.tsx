"use client";

type PlacementSignal = {
  title: string;
  detail: string;
  tone: "positive" | "watch" | "neutral";
};

export function ArticlePlacementPanel({
  productBlockCount,
  distinctProductCount,
  wordCount,
  firstProductIndex,
  blockCount,
}: {
  productBlockCount: number;
  distinctProductCount: number;
  wordCount: number;
  firstProductIndex: number | null;
  blockCount: number;
}) {
  const density =
    wordCount > 0
      ? productBlockCount / Math.max(wordCount / 500, 1)
      : productBlockCount;

  const signals: PlacementSignal[] = [];

  if (productBlockCount === 0) {
    signals.push({
      title: "No product placement yet",
      detail:
        "That can be right for purely editorial stories. For buying guides or product-led articles, consider adding one relevant recommendation after the reader has enough context.",
      tone: "neutral",
    });
  } else {
    signals.push({
      title: "Product placement is active",
      detail:
        `${productBlockCount} product block${productBlockCount === 1 ? "" : "s"} currently feature ${distinctProductCount} distinct product${distinctProductCount === 1 ? "" : "s"}.`,
      tone: "positive",
    });
  }

  if (
    firstProductIndex !== null &&
    blockCount > 2 &&
    firstProductIndex <= 1
  ) {
    signals.push({
      title: "First product appears very early",
      detail:
        "Consider giving readers a little more editorial context before the first recommendation unless the article is explicitly a buying guide.",
      tone: "watch",
    });
  }

  if (density > 3) {
    signals.push({
      title: "Product density looks high",
      detail:
        "There are more than three product blocks per roughly 500 words. Consider reducing repetition so the article remains useful rather than feeling over-monetized.",
      tone: "watch",
    });
  } else if (
    productBlockCount > 0 &&
    wordCount >= 300
  ) {
    signals.push({
      title: "Product density looks balanced",
      detail:
        "The current article has enough editorial text around its product placements for a trust-first reading experience.",
      tone: "positive",
    });
  }

  if (
    distinctProductCount >
      0 &&
    distinctProductCount <= 2 &&
    productBlockCount >= 3
  ) {
    signals.push({
      title: "Repeated product exposure",
      detail:
        "A small number of products appear across several blocks. Repetition can be useful, but only keep it when each placement serves a different editorial purpose.",
      tone: "watch",
    });
  }

  const visibleSignals =
    signals.slice(0, 4);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
      <p className="admin-eyebrow">
        Monetization review
      </p>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="display-serif text-3xl">
            Product placement
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Use these signals as editorial guidance only. A strong article does not need a product block in every section.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric
            label="Blocks"
            value={productBlockCount}
          />
          <Metric
            label="Products"
            value={distinctProductCount}
          />
          <Metric
            label="Words"
            value={wordCount}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleSignals.map(
          (signal) => (
            <div
              key={signal.title}
              className={`rounded-xl border p-5 ${
                signal.tone === "positive"
                  ? "border-emerald-200 bg-emerald-50"
                  : signal.tone === "watch"
                    ? "border-amber-300 bg-amber-50"
                    : "border-[var(--line)] bg-[var(--paper)]"
              }`}
            >
              <p className="font-semibold">
                {signal.title}
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {signal.detail}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-20 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}
