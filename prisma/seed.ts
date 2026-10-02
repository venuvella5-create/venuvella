import { PrismaClient, ContentStatus, ProductStatus, ProviderStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const image = (id: string, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

async function main() {
  const categories = [
    { name: "Beauty", slug: "beauty", description: "Beauty finds worth adding to your routine.", imageUrl: image("photo-1612817288484-6f916006741a"), sortOrder: 1 },
    { name: "Home", slug: "home", description: "Make your space work beautifully.", imageUrl: image("photo-1616486338812-3dadae4b4ace"), sortOrder: 2 },
    { name: "Fitness", slug: "fitness", description: "Gear for stronger everyday routines.", imageUrl: image("photo-1581009146145-b5ef050c2e1e"), sortOrder: 3 },
    { name: "Style", slug: "style", description: "What to wear, season after season.", imageUrl: image("photo-1483985988355-763728e1935b"), sortOrder: 4 },
    { name: "Seasonal", slug: "seasonal", description: "Timely ideas for every season.", imageUrl: image("photo-1509631179647-0177331693ae"), sortOrder: 5 },
    { name: "Guides", slug: "guides", description: "Useful before-you-buy advice.", sortOrder: 6 },
    { name: "Deals", slug: "deals", description: "A considered edit of timely offers.", sortOrder: 7 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }

  const subcategories: Record<string, string[]> = {
    beauty: ["Skincare", "Makeup", "Hair", "Beauty Tools"],
    home: ["Appliances", "Electronics", "Kitchen", "Organization"],
    fitness: ["Workout Equipment", "Activewear", "Recovery", "Accessories"],
    style: ["Outfits", "Shoes", "Accessories", "Trends"],
  };

  for (const [categorySlug, names] of Object.entries(subcategories)) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    for (const name of names) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: name.toLowerCase().replace(/\s+/g, "-") } },
        update: { name },
        create: { name, slug: name.toLowerCase().replace(/\s+/g, "-"), categoryId: category.id },
      });
    }
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@venuvella.local" },
    update: { name: "Venuvella Admin", role: UserRole.ADMIN },
    create: { email: "admin@venuvella.local", name: "Venuvella Admin", role: UserRole.ADMIN },
  });

  const author = await prisma.author.upsert({
    where: { slug: "venuvella-edit" },
    update: { name: "The Venuvella Edit", userId: admin.id, bio: "The Venuvella editorial team." },
    create: { name: "The Venuvella Edit", slug: "venuvella-edit", userId: admin.id, bio: "The Venuvella editorial team." },
  });

  const beauty = await prisma.category.findUniqueOrThrow({ where: { slug: "beauty" } });
  const home = await prisma.category.findUniqueOrThrow({ where: { slug: "home" } });
  const fitness = await prisma.category.findUniqueOrThrow({ where: { slug: "fitness" } });
  const style = await prisma.category.findUniqueOrThrow({ where: { slug: "style" } });

  const tagNames = ["edit", "buying-guide", "everyday", "home", "beauty", "fitness", "style"];
  for (const name of tagNames) {
    await prisma.tag.upsert({ where: { slug: name }, update: { name }, create: { name, slug: name } });
  }

  const articles = [
    { categoryId: beauty.id, title: "10 Beauty Tools Worth Adding to Your Routine", slug: "beauty-tools-worth-adding-to-your-routine", excerpt: "A considered edit of tools that can make everyday beauty rituals simpler and more intentional.", image: image("photo-1596462502278-27bfdc403348"), tags: ["edit", "beauty", "everyday"] },
    { categoryId: home.id, title: "The Home Appliances We're Watching Right Now", slug: "home-appliances-were-watching", excerpt: "Practical upgrades that balance useful features with thoughtful design.", image: image("photo-1556911220-bff31c812dba"), tags: ["edit", "home"] },
    { categoryId: fitness.id, title: "7 Workout Essentials for Your Home Gym", slug: "workout-essentials-for-your-home-gym", excerpt: "A streamlined starting point for building a workout space you will actually use.", image: image("photo-1517836357463-d25dfeac3438"), tags: ["fitness", "everyday"] },
    { categoryId: style.id, title: "Easy Outfit Ideas for the New Season", slug: "easy-outfit-ideas-for-the-new-season", excerpt: "Simple combinations designed to make getting dressed feel easier.", image: image("photo-1490481651871-ab68de25d43d"), tags: ["style", "edit"] },
    { categoryId: home.id, title: "Easy Ways to Refresh Your Bedroom", slug: "easy-ways-to-refresh-your-bedroom", excerpt: "Small, considered changes that can make an everyday space feel new again.", image: image("photo-1600566753086-00f18fb6b3ea"), tags: ["home", "everyday"] },
    { categoryId: fitness.id, title: "How to Build a Better Home Workout Space", slug: "build-a-better-home-workout-space", excerpt: "A practical framework for choosing equipment without overwhelming your space.", image: image("photo-1581009146145-b5ef050c2e1e"), tags: ["fitness", "everyday"] },
  ];

  for (const item of articles) {
    const article = await prisma.article.upsert({
      where: { slug: item.slug },
      update: { title: item.title, excerpt: item.excerpt, featuredImage: item.image, categoryId: item.categoryId, authorId: author.id, status: ContentStatus.PUBLISHED, publishedAt: new Date() },
      create: { title: item.title, slug: item.slug, excerpt: item.excerpt, featuredImage: item.image, categoryId: item.categoryId, authorId: author.id, status: ContentStatus.PUBLISHED, publishedAt: new Date() },
    });
    await prisma.articleBlock.deleteMany({ where: { articleId: article.id } });
    await prisma.articleBlock.createMany({ data: [
      { articleId: article.id, type: "PARAGRAPH", position: 0, data: { text: item.excerpt } },
      { articleId: article.id, type: "HEADING", position: 1, data: { text: "What to consider" } },
      { articleId: article.id, type: "PARAGRAPH", position: 2, data: { text: "This demo article is seeded content for the Venuvella editorial workflow. Replace it with original reporting, buying advice and product research before publication." } },
      { articleId: article.id, type: "AFFILIATE_DISCLOSURE", position: 3, data: { text: "Disclosure: Venuvella may earn a commission when you purchase through links on our site, at no additional cost to you." } },
    ] });
    for (const tagSlug of item.tags) {
      const tag = await prisma.tag.findUniqueOrThrow({ where: { slug: tagSlug } });
      await prisma.articleTag.upsert({ where: { articleId_tagId: { articleId: article.id, tagId: tag.id } }, update: {}, create: { articleId: article.id, tagId: tag.id } });
    }
    await prisma.sEOData.upsert({ where: { articleId: article.id }, update: { title: item.title, description: item.excerpt }, create: { articleId: article.id, title: item.title, description: item.excerpt } });
  }

  const brand = await prisma.brand.upsert({ where: { slug: "venuvella-demo" }, update: { name: "Venuvella Demo" }, create: { name: "Venuvella Demo", slug: "venuvella-demo", description: "Seed/demo brand used during development." } });
  const products = [
    { name: "Adjustable Dumbbell", slug: "adjustable-dumbbell", categoryId: fitness.id, summary: "A space-conscious pick for versatile strength sessions.", image: image("photo-1583454110551-21f2fa2afe61", 800) },
    { name: "Everyday Hair Tool", slug: "everyday-hair-tool", categoryId: beauty.id, summary: "A demo beauty tool record for testing editorial product insertion.", image: image("photo-1522338242992-e1a54906a8da", 800) },
    { name: "Compact Air Fryer", slug: "compact-air-fryer", categoryId: home.id, summary: "A demo small-kitchen product record.", image: image("photo-1585515320310-259814833e62", 800) },
    { name: "Minimalist Tote", slug: "minimalist-tote", categoryId: style.id, summary: "An easy everyday carry with a clean, versatile silhouette.", image: image("photo-1590874103328-eac38a683ce7", 800) },
  ];
  for (const item of products) {
    const product = await prisma.product.upsert({ where: { slug: item.slug }, update: { name: item.name, categoryId: item.categoryId, editorialSummary: item.summary, brandId: brand.id, status: ProductStatus.PENDING_REVIEW }, create: { name: item.name, slug: item.slug, categoryId: item.categoryId, editorialSummary: item.summary, brandId: brand.id, status: ProductStatus.PENDING_REVIEW } });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({ data: { productId: product.id, url: item.image, altText: item.name, position: 0 } });
  }

  const guides = [
    { title: "Best Air Fryers for Small Kitchens", slug: "best-air-fryers-small-kitchens", categoryId: home.id, excerpt: "What to consider when counter space is limited.", introduction: "A practical starting point for choosing a compact air fryer without sacrificing the features you actually use." },
    { title: "Best Walking Shoes for Everyday Wear", slug: "best-walking-shoes-everyday-wear", categoryId: fitness.id, excerpt: "Features that matter when comfort is the priority.", introduction: "A useful framework for comparing everyday walking shoes, from fit and cushioning to weight and versatility." },
    { title: "Best Makeup Organizers", slug: "best-makeup-organizers", categoryId: beauty.id, excerpt: "Simple storage ideas for a calmer beauty space.", introduction: "How to choose makeup storage that keeps frequently used products visible without making your space feel cluttered." },
  ];
  for (const item of guides) {
    const guide = await prisma.buyingGuide.upsert({ where: { slug: item.slug }, update: { title: item.title, categoryId: item.categoryId, excerpt: item.excerpt, introduction: item.introduction, status: ContentStatus.PUBLISHED, publishedAt: new Date() }, create: { title: item.title, slug: item.slug, categoryId: item.categoryId, excerpt: item.excerpt, introduction: item.introduction, status: ContentStatus.PUBLISHED, publishedAt: new Date() } });
    await prisma.guideBlock.deleteMany({ where: { guideId: guide.id } });
    await prisma.guideBlock.createMany({ data: [
      { guideId: guide.id, type: "HEADING", position: 0, data: { text: "What to consider" } },
      { guideId: guide.id, type: "PARAGRAPH", position: 1, data: { text: "This is development seed content. Replace it with original Venuvella research and verified product information before publication." } },
      { guideId: guide.id, type: "AFFILIATE_DISCLOSURE", position: 2, data: { text: "Disclosure: Venuvella may earn a commission when you purchase through links on our site, at no additional cost to you." } },
    ] });
    await prisma.sEOData.upsert({ where: { guideId: guide.id }, update: { title: item.title, description: item.excerpt }, create: { guideId: guide.id, title: item.title, description: item.excerpt } });
  }

  await prisma.affiliateProvider.upsert({ where: { slug: "amazon" }, update: { name: "Amazon", status: ProviderStatus.CONFIGURED }, create: { name: "Amazon", slug: "amazon", status: ProviderStatus.CONFIGURED } });
  await prisma.sEOSettings.upsert({ where: { id: "default-seo" }, update: {}, create: { id: "default-seo", siteName: "Venuvella", defaultTitle: "Venuvella — Discover what’s worth having.", defaultDescription: "Beauty, home, fitness and style — thoughtfully discovered." } });

  console.log("Venuvella demo database seeded.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
