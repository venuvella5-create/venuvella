import { prisma } from "@/lib/db/prisma";


export async function getBrands() {

  return prisma.brand.findMany({

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      slug: true,
    },

  });

}