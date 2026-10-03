import Image from "next/image";
import Link from "next/link";


type Article = {
  category:
    string;

  title:
    string;

  excerpt:
    string;

  image:
    string;

  slug:
    string;

  readingTime:
    string;
};


export function ArticleCard({
  article,
  featured = false,
}: {
  article:
    Article;

  featured?:
    boolean;
}) {
  return (
    <article
      className={
        featured
          ? "group md:col-span-2"
          : "group"
      }
    >

      <Link
        href={`/articles/${article.slug}`}
        className="block"
      >

        <div
          className={`relative overflow-hidden bg-[var(--warm)] ${
            featured
              ? "aspect-[16/9]"
              : "aspect-[4/3]"
          }`}
        >

          <Image
            src={
              article.image
            }
            alt={
              article.title
            }
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 70vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />

        </div>


        <div
          className={
            featured
              ? "pt-5 sm:pt-6"
              : "pt-4 sm:pt-5"
          }
        >

          <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[var(--accent)] sm:text-xs">
            {article.category}
          </p>


          <h3
            className={
              featured
                ? "display-serif mt-3 max-w-4xl text-4xl leading-[1.02] tracking-[-0.025em] sm:text-5xl lg:text-6xl"
                : "display-serif mt-3 text-2xl leading-[1.06] tracking-[-0.02em] sm:text-3xl"
            }
          >
            {article.title}
          </h3>


          {article.excerpt && (
            <p
              className={
                featured
                  ? "mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg"
                  : "mt-3 max-w-2xl text-[15px] leading-7 text-[var(--muted)] sm:text-base"
              }
            >
              {article.excerpt}
            </p>
          )}


          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)] sm:text-xs">
            {article.readingTime} read
          </p>

        </div>

      </Link>

    </article>
  );
}