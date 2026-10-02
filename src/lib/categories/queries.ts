import { prisma } from "@/lib/db/prisma";


export async function getCategories() {

  return prisma.category.findMany({

    where: {
      parentId: null,
    },

    orderBy: {
      sortOrder: "asc",
    },

    select: {
      id: true,
      name: true,
      slug: true,
    },

  });

}