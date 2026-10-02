import { Prisma } from "@prisma/client";


export type ProductListItem =
  Prisma.ProductGetPayload<{
    include: {
      brand: true;
      category: true;
      images: true;

      providerProducts: {
        include: {
          provider: true;
        };
      };
    };
  }>;


export type ProductDetail =
  Prisma.ProductGetPayload<{
    include: {
      brand: true;
      category: true;
      images: true;

      features: true;

      variants: true;

      providerProducts: {
        include: {
          provider: true;
        };
      };
    };
  }>;