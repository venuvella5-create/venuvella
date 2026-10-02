import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { AffiliateProviderForm } from "@/components/admin/AffiliateProviderForm";


export const dynamic =
  "force-dynamic";


export default async function EditProviderPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;


  const provider =
    await prisma.affiliateProvider.findUnique({
      where: {
        id,
      },

      include: {
        _count: {
          select: {
            providerProducts: true,
            clicks: true,
            redirects: true,
          },
        },
      },
    });


  if (!provider) {
    notFound();
  }


  return (
    <main className="min-h-screen bg-[#efeee9] py-10">

      <div className="container-shell">

        <Link
          href="/admin/providers"
          className="admin-link"
        >
          ← Providers
        </Link>


        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">

          <div>

            <p className="admin-eyebrow">
              Commerce / Provider
            </p>

            <h1 className="display-serif mt-2 text-5xl">
              {provider.name}
            </h1>


            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">

              <span>
                Mappings:{" "}
                {
                  provider._count
                    .providerProducts
                }
              </span>

              <span>
                Clicks:{" "}
                {
                  provider._count
                    .clicks
                }
              </span>

              <span>
                Redirects:{" "}
                {
                  provider._count
                    .redirects
                }
              </span>

            </div>

          </div>


          <Link
            href="/admin/products"
            className="admin-secondary"
          >
            Product mappings
          </Link>

        </div>


        <section className="mt-10 max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-6">

          <p className="admin-eyebrow">
            Provider settings
          </p>

          <h2 className="display-serif mt-2 text-3xl">
            Configuration
          </h2>


          <AffiliateProviderForm
            provider={{
              id: provider.id,
              name: provider.name,
              slug: provider.slug,
              websiteUrl:
                provider.websiteUrl,
              status:
                provider.status,
            }}
          />

        </section>

      </div>

    </main>
  );
}