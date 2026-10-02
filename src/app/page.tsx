import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArticleCard } from "@/components/editorial/ArticleCard";
import { CategoryCard } from "@/components/editorial/CategoryCard";
import { ProductCard } from "@/components/editorial/ProductCard";

import { getPublishedArticles } from "@/lib/content/articles";
import { getPublishedProducts } from "@/lib/content/products";


export const dynamic =
  "force-dynamic";


const articles = [
  {
    category: "Beauty",
    title:
      "10 Beauty Tools Worth Adding to Your Routine",
    excerpt:
      "A considered edit of tools that can make everyday beauty rituals simpler and more intentional.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85",
    slug:
      "beauty-tools-worth-adding-to-your-routine",
    readingTime: "6 min",
  },

  {
    category: "Home",
    title:
      "The Home Appliances We're Watching Right Now",
    excerpt:
      "Practical upgrades that balance useful features with thoughtful design.",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=85",
    slug:
      "home-appliances-were-watching",
    readingTime: "5 min",
  },

  {
    category: "Fitness",
    title:
      "7 Workout Essentials for Your Home Gym",
    excerpt:
      "A streamlined starting point for building a workout space you will actually use.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85",
    slug:
      "workout-essentials-for-your-home-gym",
    readingTime: "7 min",
  },

  {
    category: "Style",
    title:
      "Easy Outfit Ideas for the New Season",
    excerpt:
      "Simple combinations designed to make getting dressed feel easier.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
    slug:
      "easy-outfit-ideas-for-the-new-season",
    readingTime: "4 min",
  },
];


const categories = [
  {
    title: "Beauty",
    description:
      "Beauty finds worth adding to your routine.",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "Skincare",
      "Makeup",
      "Hair",
      "Beauty Tools",
    ],
  },

  {
    title: "Home",
    description:
      "Make your space work beautifully.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "Appliances",
      "Electronics",
      "Kitchen",
      "Organization",
    ],
  },

  {
    title: "Fitness",
    description:
      "Gear for stronger everyday routines.",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "Workout Equipment",
      "Activewear",
      "Recovery",
      "Accessories",
    ],
  },

  {
    title: "Style",
    description:
      "What to wear, season after season.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    subcategories: [
      "Outfits",
      "Shoes",
      "Accessories",
      "Trends",
    ],
  },
];


const products = [
  {
    brand: "The Edit",
    name: "Adjustable Dumbbell",
    summary:
      "A space-conscious pick for versatile strength sessions.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=85",
    slug: "adjustable-dumbbell",
  },

  {
    brand: "The Edit",
    name: "Everyday Hair Tool",
    summary:
      "A practical beauty tool for streamlined styling routines.",
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=85",
    slug: "everyday-hair-tool",
  },

  {
    brand: "The Edit",
    name: "Compact Air Fryer",
    summary:
      "A small-kitchen option for quick everyday cooking.",
    image:
      "https://images.unsplash.com/photo-1648110926147-2e7d4e2f3f4d?auto=format&fit=crop&w=800&q=85",
    slug: "compact-air-fryer",
  },

  {
    brand: "The Edit",
    name: "Minimalist Tote",
    summary:
      "An easy everyday carry with a clean, versatile silhouette.",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85",
    slug: "minimalist-tote",
  },
];


export default async function HomePage() {
  const [
    dbArticles,
    dbProducts,
  ] = await Promise.all([
    getPublishedArticles(4),
    getPublishedProducts(4),
  ]);


  const latestArticles =
    dbArticles.length
      ? dbArticles.map(
          (article) => ({
            category:
              article.category.name,

            title:
              article.title,

            excerpt:
              article.excerpt ?? "",

            image:
              article.featuredImage ??
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",

            slug:
              article.slug,

            readingTime:
              "6 min",
          })
        )
      : articles;


  const shopProducts =
    dbProducts.length
      ? dbProducts.map(
          (product) => ({
            brand:
              product.brand?.name ??
              "The Edit",

            name:
              product.name,

            summary:
              product.editorialSummary ??
              product.description ??
              "A considered product pick from Venuvella.",

            image:
              product.images[0]?.url ??
              "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=85",

            slug:
              product.slug,
          })
        )
      : products;


  return (
    <main>

      {/* HERO */}

      <section className="container-shell grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">

        <div className="max-w-xl py-6">

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Venuvella / The Edit
          </p>


          <h1 className="display-serif text-6xl leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-[88px]">
            Discover what’s worth having.
          </h1>


          <p className="mt-7 max-w-md text-base leading-7 text-[var(--muted)]">
            Beauty, home, fitness and style —
            thoughtfully discovered.
          </p>


          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              href="#latest"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#1f211f] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] !text-white transition hover:opacity-90"
            >
              <span className="text-white">
                Explore the latest
              </span>

              <ArrowRight
                size={15}
                className="text-white"
              />
            </Link>


            <Link
              href="#guides"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--ink)] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-white"
            >
              Browse guides
            </Link>

          </div>

        </div>


        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--warm)] lg:aspect-[5/6]">

          <Image
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=90"
            alt="Editorial lifestyle scene"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />


          <div className="absolute bottom-5 left-5 bg-white/90 px-4 py-3 backdrop-blur">

            <p className="text-[9px] font-semibold uppercase tracking-[0.17em]">
              Thoughtfully discovered
            </p>

          </div>

        </div>

      </section>


      {/* CATEGORIES */}

      <section className="border-y border-[var(--line)] bg-[#efeee9] py-16 sm:py-20">

        <div className="container-shell">

          <SectionHeader
            eyebrow="Explore Venuvella"
            title="Find your next favorite thing."
          />


          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">

            {categories.map(
              (category) => (
                <CategoryCard
                  key={
                    category.title
                  }
                  {...category}
                />
              )
            )}

          </div>

        </div>

      </section>


      {/* LATEST */}

      <section
        id="latest"
        className="container-shell py-16 sm:py-20"
      >

        <SectionHeader
          eyebrow="Latest from Venuvella"
          title="Ideas worth making room for."
          href="/articles"
        />


        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">

          {latestArticles.map(
            (article, i) => (
              <ArticleCard
                key={
                  article.slug
                }
                article={
                  article
                }
                featured={
                  i === 0
                }
              />
            )
          )}

        </div>

      </section>


      {/* PRODUCTS */}

      <section className="bg-[#eae7df] py-16 sm:py-20">

        <div className="container-shell">

          <SectionHeader
            eyebrow="Shop the Edit"
            title="A considered product shortlist."
            href="/deals"
          />


          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">

            {shopProducts.map(
              (product) => (
                <ProductCard
                  key={
                    product.slug
                  }
                  {...product}
                />
              )
            )}

          </div>

        </div>

      </section>


      {/* BUYING GUIDES */}

      <section
        id="guides"
        className="container-shell py-16 sm:py-20"
      >

        <SectionHeader
          eyebrow="Buying Guides"
          title="Helpful before you buy."
          href="/guides"
        />


        <div className="grid gap-5 md:grid-cols-3">

          <Guide
            title="Best Air Fryers for Small Kitchens"
            description="What to consider when counter space is limited."
            image="https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=85"
          />


          <Guide
            title="Best Walking Shoes for Everyday Wear"
            description="Features that matter when comfort is the priority."
            image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85"
          />


          <Guide
            title="Best Makeup Organizers"
            description="Simple storage ideas for a calmer beauty space."
            image="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85"
          />

        </div>

      </section>


      {/* SEASONAL */}

      <section className="border-y border-[var(--line)] bg-[#f0ede6] py-16 sm:py-20">

        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">

          <div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Seasonal Edit
            </p>


            <h2 className="display-serif text-5xl leading-none tracking-[-0.03em] sm:text-6xl">
              What’s in season.
            </h2>


            <p className="mt-5 max-w-md text-sm leading-6 text-[var(--muted)]">
              Fresh ideas for the way the season
              feels — from wardrobe refreshes to
              home updates and everyday routines.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-3">

            <Season
              image="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85"
              title="Seasonal style"
            />


            <Season
              image="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=85"
              title="Home refresh"
            />

          </div>

        </div>

      </section>


      {/* RADAR */}

      <section className="container-shell py-16 sm:py-20">

        <SectionHeader
          eyebrow="What’s on our radar"
          title="Little ideas, useful inspiration."
        />


        <div className="grid gap-4 sm:grid-cols-3">

          <Radar
            number="01"
            title="7 Ways to Refresh Your Bedroom"
          />


          <Radar
            number="02"
            title="The Beauty Tools We’re Watching"
          />


          <Radar
            number="03"
            title="Build a Better Home Workout Space"
          />

        </div>

      </section>


      {/* NEWSLETTER */}

      <section
        id="newsletter"
        className="container-shell pb-20"
      >

        <div className="bg-[var(--ink)] px-6 py-12 text-white sm:px-12 sm:py-16">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c8b29e]">
              The Venuvella Edit
            </p>


            <h2 className="display-serif mt-3 text-4xl sm:text-5xl">
              A little inspiration, delivered.
            </h2>


            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/65">
              Get our latest finds, guides and
              seasonal inspiration delivered to
              your inbox.
            </p>


            <form className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row">

              <label
                htmlFor="email"
                className="sr-only"
              >
                Email address
              </label>


              <input
                id="email"
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-full bg-white px-5 py-3 text-sm text-[var(--ink)] outline-none"
              />


              <button
                type="submit"
                className="rounded-full bg-[#d8c8ba] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]"
              >
                Get the Edit
              </button>

            </form>


            <p className="mt-3 text-[10px] text-white/40">
              No noise. Just thoughtful finds
              and ideas.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}


function Guide({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <Link
      href="#"
      className="group grid grid-cols-[110px_1fr] gap-4 border-t border-[var(--line)] pt-4 sm:block"
    >

      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--warm)]">

        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 110px, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />

      </div>


      <div className="pt-1 sm:pt-4">

        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
          Buying guide
        </p>


        <h3 className="display-serif mt-1 text-xl leading-tight sm:text-2xl">
          {title}
        </h3>


        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          {description}
        </p>

      </div>

    </Link>
  );
}


function Season({
  image,
  title,
}: {
  image: string;
  title: string;
}) {
  return (
    <Link
      href="/seasonal"
      className="group relative aspect-[4/5] overflow-hidden"
    >

      <Image
        src={image}
        alt=""
        fill
        sizes="50vw"
        className="object-cover transition duration-700 group-hover:scale-[1.03]"
      />


      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />


      <h3 className="display-serif absolute bottom-4 left-4 text-2xl text-white">
        {title}
      </h3>

    </Link>
  );
}


function Radar({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <Link
      href="#"
      className="border-t border-[var(--line)] py-5 transition hover:border-[var(--ink)]"
    >

      <span className="text-[10px] font-semibold tracking-[0.15em] text-[var(--accent)]">
        {number}
      </span>


      <h3 className="display-serif mt-8 text-2xl leading-tight">
        {title}
      </h3>


      <span className="mt-5 inline-block text-[10px] font-semibold uppercase tracking-[0.13em]">
        Explore →
      </span>

    </Link>
  );
}