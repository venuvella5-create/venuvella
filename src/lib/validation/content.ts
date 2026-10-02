import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  featuredImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1),
  authorId: z.string().min(1),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  seoTitle: z.string().trim().max(180).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  blocks: z.string().min(2),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
