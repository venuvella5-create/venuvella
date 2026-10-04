export type EditorialReadinessBlock = {
  type: string;
  text?: string;
  data?: unknown;
};

export type EditorialReadinessInput = {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  blocks: EditorialReadinessBlock[];
};

export type EditorialReadinessCheck = {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
  blocking: boolean;
};

export type EditorialReadiness = {
  score: number;
  wordCount: number;
  headingCount: number;
  productBlockCount: number;
  checks: EditorialReadinessCheck[];
  blockers: EditorialReadinessCheck[];
};

function getTextFromBlock(
  block: EditorialReadinessBlock
) {
  if (typeof block.text === "string") {
    return block.text;
  }

  if (
    typeof block.data === "object" &&
    block.data !== null &&
    !Array.isArray(block.data) &&
    "text" in block.data
  ) {
    const value = (
      block.data as Record<string, unknown>
    ).text;

    return typeof value === "string"
      ? value
      : "";
  }

  return "";
}

export function slugifyArticleTitle(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEditorialReadiness(
  input: EditorialReadinessInput
): EditorialReadiness {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const excerpt = input.excerpt.trim();
  const featuredImage =
    input.featuredImage.trim();

  const effectiveSeoTitle =
    input.seoTitle.trim() || title;

  const effectiveSeoDescription =
    input.seoDescription.trim() || excerpt;

  const textBlocks =
    input.blocks.filter(
      (block) =>
        block.type !== "PRODUCT" &&
        block.type !== "PRODUCT_GRID"
    );

  const bodyText =
    textBlocks
      .map(getTextFromBlock)
      .join(" ")
      .trim();

  const wordCount =
    bodyText.length > 0
      ? bodyText.split(/\s+/).length
      : 0;

  const headingCount =
    input.blocks.filter(
      (block) =>
        block.type === "HEADING" &&
        getTextFromBlock(block).trim().length >
          0
    ).length;

  const productBlockCount =
    input.blocks.filter(
      (block) =>
        block.type === "PRODUCT" ||
        block.type === "PRODUCT_GRID"
    ).length;

  const emptyTextBlockCount =
    textBlocks.filter(
      (block) =>
        getTextFromBlock(block).trim().length ===
        0
    ).length;

  const checks: EditorialReadinessCheck[] = [
    {
      id: "title",
      label: "Clear article title",
      detail:
        "Use a descriptive title with at least 10 characters.",
      passed: title.length >= 10,
      blocking: true,
    },
    {
      id: "slug",
      label: "Clean URL slug",
      detail:
        "Use lowercase words separated by hyphens.",
      passed:
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
          slug
        ),
      blocking: true,
    },
    {
      id: "excerpt",
      label: "Useful excerpt",
      detail:
        "Aim for at least 60 characters for cards, search and metadata fallback.",
      passed: excerpt.length >= 60,
      blocking: true,
    },
    {
      id: "image",
      label: "Featured image",
      detail:
        "Published stories should include a featured image.",
      passed: featuredImage.length > 0,
      blocking: true,
    },
    {
      id: "body",
      label: "Substantive article body",
      detail:
        "Aim for at least 150 words before publishing.",
      passed: wordCount >= 150,
      blocking: true,
    },
    {
      id: "heading",
      label: "Readable structure",
      detail:
        "Include at least one heading to help readers scan the story.",
      passed: headingCount >= 1,
      blocking: true,
    },
    {
      id: "empty-blocks",
      label: "No empty text blocks",
      detail:
        "Remove or complete empty paragraph, heading, quote or list blocks.",
      passed: emptyTextBlockCount === 0,
      blocking: true,
    },
    {
      id: "seo-title",
      label: "SEO title length",
      detail:
        "Keep the effective SEO title between 20 and 70 characters.",
      passed:
        effectiveSeoTitle.length >= 20 &&
        effectiveSeoTitle.length <= 70,
      blocking: false,
    },
    {
      id: "seo-description",
      label: "SEO description length",
      detail:
        "Keep the effective meta description between 70 and 180 characters.",
      passed:
        effectiveSeoDescription.length >= 70 &&
        effectiveSeoDescription.length <=
          180,
      blocking: false,
    },
  ];

  const passedCount =
    checks.filter((check) => check.passed)
      .length;

  const score = Math.round(
    (passedCount / checks.length) * 100
  );

  return {
    score,
    wordCount,
    headingCount,
    productBlockCount,
    checks,
    blockers: checks.filter(
      (check) =>
        check.blocking && !check.passed
    ),
  };
}

export function getPublishBlockMessage(
  readiness: EditorialReadiness
) {
  if (readiness.blockers.length === 0) {
    return null;
  }

  return `Before publishing, complete: ${readiness.blockers
    .map((check) => check.label)
    .join(", ")}.`;
}
