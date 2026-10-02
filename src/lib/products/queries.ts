import { prisma } from "@/lib/db/prisma";
import type {
    
  ProductDetail,
  ProductListItem,
} from "./types";


export async function getProducts({
  limit,
  categorySlug,
  brandSlug,
  search,
}: {
  limit?: number;
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
} = {}): Promise<ProductListItem[]> {

  return prisma.product.findMany({

    where: {

  status: "PUBLISHED",

  ...(categorySlug && {
    category: {
      slug: categorySlug,
    },
  }),


  ...(brandSlug && {
    brand: {
      slug: brandSlug,
    },
  }),


  ...(search && {
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        editorialSummary: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        brand: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ],
  }),

},

    include: {
      brand: true,

      category: true,

      images: {
        orderBy: {
          position: "asc",
        },
      },

      providerProducts: {
        include: {
          provider: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },

    ...(limit && {
      take: limit,
    }),

  });

}



export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {

  return prisma.product.findUnique({

    where: {
      slug,
    },

    include: {
  brand: true,

  category: true,

  images: {
    orderBy: {
      position: "asc",
    },
  },

  features: {
    orderBy: {
      position: "asc",
    },
  },

  variants: {
    where: {
      status: "ACTIVE",
    },

    orderBy: {
      position: "asc",
    },
  },

  providerProducts: {
    include: {
      provider: true,
    },
  },
},

  });

}



export async function getRelatedProducts(
  productId: string,
  categoryId: string
): Promise<ProductListItem[]> {

  return prisma.product.findMany({

    where: {
      categoryId,

      NOT: {
        id: productId,
      },

      status: "PUBLISHED",
    },

    include: {
      brand: true,

      category: true,

      images: {
        orderBy: {
          position: "asc",
        },
      },

      providerProducts: {
        include: {
          provider: true,
        },
      },

    },

    orderBy: {
      updatedAt: "desc",
    },

    take: 4,

  });

}