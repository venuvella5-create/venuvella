"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import {
  NewsletterCampaignStatus,
} from "@prisma/client";

import {
  requireRole,
} from "@/lib/auth/require-admin";
import {
  prisma,
} from "@/lib/db/prisma";


export type NewsletterCampaignActionState = {
  ok: boolean;
  message: string;
};


function parseIdList(
  raw: FormDataEntryValue | null
) {
  if (
    typeof raw !== "string" ||
    !raw
  ) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return Array.from(
      new Set(
        parsed.filter(
          (
            value
          ): value is string =>
            typeof value ===
              "string" &&
            value.length >
              0
        )
      )
    );
  } catch {
    return [];
  }
}


function parseStatus(
  value: FormDataEntryValue | null
) {
  if (
    value === "DRAFT" ||
    value === "SCHEDULED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }

  return "DRAFT";
}


function normalizeText(
  value: FormDataEntryValue | null,
  maxLength: number
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      maxLength
    );
}


function campaignIdentity(
  issueNumber: number
) {
  const padded =
    String(issueNumber).padStart(
      3,
      "0"
    );

  return {
    campaignKey:
      `edit-${padded}`,

    slug:
      `venuvella-edit-${padded}`,
  };
}


async function validateRelations({
  articleIds,
  productIds,
  featuredArticleId,
}: {
  articleIds: string[];
  productIds: string[];
  featuredArticleId: string;
}) {
  const allArticleIds =
    Array.from(
      new Set([
        ...articleIds,
        ...(featuredArticleId
          ? [
              featuredArticleId,
            ]
          : []),
      ])
    );

  if (
    allArticleIds.length >
    0
  ) {
    const articleCount =
      await prisma.article.count({
        where: {
          id: {
            in:
              allArticleIds,
          },

          status:
            "PUBLISHED",

          publishedAt: {
            lte:
              new Date(),
          },
        },
      });

    if (
      articleCount !==
      allArticleIds.length
    ) {
      return "One or more selected articles are no longer published.";
    }
  }

  if (
    productIds.length >
    0
  ) {
    const productCount =
      await prisma.product.count({
        where: {
          id: {
            in:
              productIds,
          },

          status:
            "PUBLISHED",
        },
      });

    if (
      productCount !==
      productIds.length
    ) {
      return "One or more selected products are no longer published.";
    }
  }

  return null;
}


export async function createNewsletterCampaign(
  _previous:
    NewsletterCampaignActionState,
  formData:
    FormData
): Promise<NewsletterCampaignActionState> {
  await requireRole([
    "ADMIN",
  ]);

  const issueNumber =
    Number.parseInt(
      String(
        formData.get(
          "issueNumber"
        ) ?? ""
      ),
      10
    );

  const subject =
    normalizeText(
      formData.get(
        "subject"
      ),
      160
    );

  const previewText =
    normalizeText(
      formData.get(
        "previewText"
      ),
      240
    );

  const editorialIntro =
    normalizeText(
      formData.get(
        "editorialIntro"
      ),
      4000
    );

  const status =
    parseStatus(
      formData.get(
        "status"
      )
    );

  const featuredArticleId =
    normalizeText(
      formData.get(
        "featuredArticleId"
      ),
      200
    );

  const articleIds =
    parseIdList(
      formData.get(
        "articleIds"
      )
    );

  const productIds =
    parseIdList(
      formData.get(
        "productIds"
      )
    );

  const scheduledRaw =
    normalizeText(
      formData.get(
        "scheduledAt"
      ),
      100
    );

  if (
    !Number.isInteger(
      issueNumber
    ) ||
    issueNumber <
      1
  ) {
    return {
      ok: false,
      message:
        "Enter a valid issue number.",
    };
  }

  if (
    subject.length <
    5
  ) {
    return {
      ok: false,
      message:
        "Add a newsletter subject line.",
    };
  }

  let scheduledAt:
    Date |
    null =
      null;

  if (
    status ===
    "SCHEDULED"
  ) {
    if (
      !scheduledRaw
    ) {
      return {
        ok: false,
        message:
          "Choose a scheduled date and time.",
      };
    }

    scheduledAt =
      new Date(
        scheduledRaw
      );

    if (
      Number.isNaN(
        scheduledAt.getTime()
      )
    ) {
      return {
        ok: false,
        message:
          "The scheduled date is invalid.",
      };
    }
  }

  const relationError =
    await validateRelations({
      articleIds,
      productIds,
      featuredArticleId,
    });

  if (
    relationError
  ) {
    return {
      ok: false,
      message:
        relationError,
    };
  }

  const {
    campaignKey,
    slug,
  } =
    campaignIdentity(
      issueNumber
    );

  const duplicate =
    await prisma.newsletterCampaign.findFirst({
      where: {
        OR: [
          {
            issueNumber,
          },
          {
            campaignKey,
          },
          {
            slug,
          },
        ],
      },

      select: {
        id:
          true,
      },
    });

  if (
    duplicate
  ) {
    return {
      ok: false,
      message:
        "That issue number is already in use.",
    };
  }

  const campaign =
    await prisma.newsletterCampaign.create({
      data: {
        issueNumber,
        campaignKey,
        slug,
        subject,
        previewText:
          previewText ||
          null,
        editorialIntro:
          editorialIntro ||
          null,
        status:
          status as NewsletterCampaignStatus,
        featuredArticleId:
          featuredArticleId ||
          null,
        scheduledAt,

        articles: {
          create:
            articleIds.map(
              (
                articleId,
                position
              ) => ({
                articleId,
                position,
              })
            ),
        },

        products: {
          create:
            productIds.map(
              (
                productId,
                position
              ) => ({
                productId,
                position,
              })
            ),
        },
      },
    });

  revalidatePath(
    "/admin/newsletter"
  );

  revalidatePath(
    "/admin/newsletter/campaigns"
  );

  redirect(
    `/admin/newsletter/campaigns/${campaign.id}`
  );
}


export async function updateNewsletterCampaign(
  _previous:
    NewsletterCampaignActionState,
  formData:
    FormData
): Promise<NewsletterCampaignActionState> {
  await requireRole([
    "ADMIN",
  ]);

  const id =
    normalizeText(
      formData.get(
        "id"
      ),
      200
    );

  if (!id) {
    return {
      ok: false,
      message:
        "Missing campaign ID.",
    };
  }

  const campaign =
    await prisma.newsletterCampaign.findUnique({
      where: {
        id,
      },

      select: {
        id:
          true,
        status:
          true,
        sentAt:
          true,
      },
    });

  if (!campaign) {
    return {
      ok: false,
      message:
        "Newsletter campaign not found.",
    };
  }

  if (
    campaign.status ===
      NewsletterCampaignStatus.SENT ||
    campaign.sentAt
  ) {
    return {
      ok: false,
      message:
        "Sent newsletter issues are locked and cannot be edited.",
    };
  }

  const issueNumber =
    Number.parseInt(
      String(
        formData.get(
          "issueNumber"
        ) ?? ""
      ),
      10
    );

  const subject =
    normalizeText(
      formData.get(
        "subject"
      ),
      160
    );

  const previewText =
    normalizeText(
      formData.get(
        "previewText"
      ),
      240
    );

  const editorialIntro =
    normalizeText(
      formData.get(
        "editorialIntro"
      ),
      4000
    );

  const status =
    parseStatus(
      formData.get(
        "status"
      )
    );

  const featuredArticleId =
    normalizeText(
      formData.get(
        "featuredArticleId"
      ),
      200
    );

  const articleIds =
    parseIdList(
      formData.get(
        "articleIds"
      )
    );

  const productIds =
    parseIdList(
      formData.get(
        "productIds"
      )
    );

  const scheduledRaw =
    normalizeText(
      formData.get(
        "scheduledAt"
      ),
      100
    );

  if (
    !Number.isInteger(
      issueNumber
    ) ||
    issueNumber <
      1
  ) {
    return {
      ok: false,
      message:
        "Enter a valid issue number.",
    };
  }

  if (
    subject.length <
    5
  ) {
    return {
      ok: false,
      message:
        "Add a newsletter subject line.",
    };
  }

  let scheduledAt:
    Date |
    null =
      null;

  if (
    status ===
    "SCHEDULED"
  ) {
    if (
      !scheduledRaw
    ) {
      return {
        ok: false,
        message:
          "Choose a scheduled date and time.",
      };
    }

    scheduledAt =
      new Date(
        scheduledRaw
      );

    if (
      Number.isNaN(
        scheduledAt.getTime()
      )
    ) {
      return {
        ok: false,
        message:
          "The scheduled date is invalid.",
      };
    }
  }

  const relationError =
    await validateRelations({
      articleIds,
      productIds,
      featuredArticleId,
    });

  if (
    relationError
  ) {
    return {
      ok: false,
      message:
        relationError,
    };
  }

  const {
    campaignKey,
    slug,
  } =
    campaignIdentity(
      issueNumber
    );

  const duplicate =
    await prisma.newsletterCampaign.findFirst({
      where: {
        NOT: {
          id,
        },

        OR: [
          {
            issueNumber,
          },
          {
            campaignKey,
          },
          {
            slug,
          },
        ],
      },

      select: {
        id:
          true,
      },
    });

  if (
    duplicate
  ) {
    return {
      ok: false,
      message:
        "That issue number is already in use.",
    };
  }

  await prisma.$transaction(
    async (
      tx
    ) => {
      await tx.newsletterCampaignArticle.deleteMany({
        where: {
          campaignId:
            id,
        },
      });

      await tx.newsletterCampaignProduct.deleteMany({
        where: {
          campaignId:
            id,
        },
      });

      await tx.newsletterCampaign.update({
        where: {
          id,
        },

        data: {
          issueNumber,
          campaignKey,
          slug,
          subject,
          previewText:
            previewText ||
            null,
          editorialIntro:
            editorialIntro ||
            null,
          status:
            status as NewsletterCampaignStatus,
          featuredArticleId:
            featuredArticleId ||
            null,
          scheduledAt,

          articles: {
            create:
              articleIds.map(
                (
                  articleId,
                  position
                ) => ({
                  articleId,
                  position,
                })
              ),
          },

          products: {
            create:
              productIds.map(
                (
                  productId,
                  position
                ) => ({
                  productId,
                  position,
                })
              ),
          },
        },
      });
    }
  );

  revalidatePath(
    "/admin/newsletter"
  );

  revalidatePath(
    "/admin/newsletter/campaigns"
  );

  revalidatePath(
    `/admin/newsletter/campaigns/${id}`
  );

  return {
    ok: true,
    message:
      "Newsletter issue saved.",
  };
}
