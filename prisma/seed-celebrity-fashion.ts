/**
 * Creates the "Celebrity Fashion" section with its Women and Men sub-sections.
 *
 *   Celebrity Fashion        -> /celebrity-fashion
 *     Celebrity Women        -> /celebrity-fashion/women
 *     Celebrity Men          -> /celebrity-fashion/men
 *
 * Safe to run more than once: anything that already exists is left untouched.
 *
 * Run with:  npm run db:seed-celebrity
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let parent = await prisma.category.findUnique({
    where: { slug: "celebrity-fashion" },
  });

  if (!parent) {
    parent = await prisma.category.create({
      data: {
        name: "Celebrity Fashion",
        slug: "celebrity-fashion",
        description:
          "Get the look: celebrity-inspired outfits, accessories and beauty picks, with options you can actually shop.",
        sortOrder: 50,
      },
    });
    console.log("Created category: Celebrity Fashion");
  } else {
    console.log("Already exists: Celebrity Fashion");
  }

  const sections = [
    {
      name: "Celebrity Women",
      slug: "celebrity-fashion-women",
      description:
        "Women's celebrity style, broken down piece by piece, with ways to get the look.",
      sortOrder: 51,
    },
    {
      name: "Celebrity Men",
      slug: "celebrity-fashion-men",
      description:
        "Men's celebrity style, broken down piece by piece, with ways to get the look.",
      sortOrder: 52,
    },
  ];

  for (const section of sections) {
    const existing = await prisma.category.findUnique({
      where: { slug: section.slug },
    });

    if (existing) {
      console.log(`Already exists: ${section.name}`);
      continue;
    }

    await prisma.category.create({
      data: { ...section, parentId: parent.id },
    });
    console.log(`Created category: ${section.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
