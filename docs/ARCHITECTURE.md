# Venuvella Architecture

Venuvella is split into four primary data concerns:

- **Editorial** — articles, blocks, authors, categories, tags, guides and SEO metadata.
- **Commerce** — products, brands, provider mappings and future affiliate redirects.
- **Analytics** — affiliate clicks and future content/product performance aggregates.
- **System** — users, settings, automation and audit logs.

The application uses Next.js App Router with server components by default. Prisma is the persistence boundary. Client components are reserved for interactive editor controls and other browser-only interactions.

## Key principle

A Venuvella `Product` is not an Amazon product. Provider-specific records live in `ProviderProduct`, allowing the same product to map to Amazon, Walmart, Target, Impact, CJ, Awin or a direct merchant later.

## Phase 2 boundary

The current CMS supports article creation, structured article blocks, categories, authors, tags, SEO metadata and public article rendering. Product insertion into the editor is intentionally reserved for Phase 3 when the product search interface exists.

Admin authentication and role enforcement are represented in the data model but must be hardened in the production security phase.
