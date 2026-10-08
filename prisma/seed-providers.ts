/**
 * Adds popular US retailers / affiliate providers.
 *
 * Safe to run more than once: providers that already exist (matched by
 * name or slug) are left untouched, so nothing is duplicated or overwritten.
 *
 * Run with:  npm run db:seed-providers
 */
import { PrismaClient, ProviderStatus } from "@prisma/client";

const prisma = new PrismaClient();

const providers = [
  { name: "Amazon", slug: "amazon", websiteUrl: "https://www.amazon.com" },
  { name: "Walmart", slug: "walmart", websiteUrl: "https://www.walmart.com" },
  { name: "Target", slug: "target", websiteUrl: "https://www.target.com" },
  { name: "Best Buy", slug: "best-buy", websiteUrl: "https://www.bestbuy.com" },
  { name: "Etsy", slug: "etsy", websiteUrl: "https://www.etsy.com" },
  { name: "eBay", slug: "ebay", websiteUrl: "https://www.ebay.com" },
  { name: "Sephora", slug: "sephora", websiteUrl: "https://www.sephora.com" },
  { name: "Ulta Beauty", slug: "ulta-beauty", websiteUrl: "https://www.ulta.com" },
  { name: "Nordstrom", slug: "nordstrom", websiteUrl: "https://www.nordstrom.com" },
  { name: "Macy's", slug: "macys", websiteUrl: "https://www.macys.com" },
  { name: "Wayfair", slug: "wayfair", websiteUrl: "https://www.wayfair.com" },
  { name: "Home Depot", slug: "home-depot", websiteUrl: "https://www.homedepot.com" },
  { name: "Lowe's", slug: "lowes", websiteUrl: "https://www.lowes.com" },
  { name: "Kohl's", slug: "kohls", websiteUrl: "https://www.kohls.com" },
  { name: "Dick's Sporting Goods", slug: "dicks-sporting-goods", websiteUrl: "https://www.dickssportinggoods.com" },
  { name: "REI", slug: "rei", websiteUrl: "https://www.rei.com" },
  { name: "Costco", slug: "costco", websiteUrl: "https://www.costco.com" },
  { name: "Apple", slug: "apple", websiteUrl: "https://www.apple.com" },
  { name: "Chewy", slug: "chewy", websiteUrl: "https://www.chewy.com" },
  { name: "Bed Bath & Beyond", slug: "bed-bath-and-beyond", websiteUrl: "https://www.bedbathandbeyond.com" },
];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const provider of providers) {
    const existing = await prisma.affiliateProvider.findFirst({
      where: {
        OR: [{ slug: provider.slug }, { name: provider.name }],
      },
      select: { id: true },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.affiliateProvider.create({
      data: { ...provider, status: ProviderStatus.ACTIVE },
    });
    added++;
  }

  console.log(`Providers added: ${added}, already existed: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
