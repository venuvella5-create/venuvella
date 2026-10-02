# Venuvella

Premium U.S.-focused editorial lifestyle and affiliate-commerce platform.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma 6
- Zod

## Phase 2 setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a PostgreSQL database from Supabase, Neon or local PostgreSQL.
3. Install dependencies with `npm install`.
4. Generate Prisma Client: `npm run db:generate`.
5. Create the development schema: `npm run db:migrate -- --name init`.
6. Seed demo content: `npm run db:seed`.
7. Start the app: `npm run dev`.

Admin development URLs:

- `/admin`
- `/admin/articles`
- `/admin/articles/new`

Public CMS URLs:

- `/articles`
- `/articles/[slug]`
- `/guides`
- `/guides/[slug]`
- `/beauty`, `/home`, `/fitness`, `/style`, `/seasonal`, `/deals`

## Important

The seeded data is development content. Replace it with original editorial content before launch. Amazon integration is not implemented in Phase 2; it belongs to the provider/affiliate phase and must use official Amazon mechanisms only.
