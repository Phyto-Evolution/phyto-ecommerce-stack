# phyto-ecommerce-stack

A modern ecommerce platform built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL 16 (via Docker)
- **ORM:** Prisma 7 (PostgreSQL)
- **Auth:** better-auth (email/password)

## Project Structure

```
src/
  app/
    (storefront)/
      layout.tsx  # Storefront shell (header + footer)
      page.tsx    # Homepage (hero, products, blog)
    (dashboard)/
      dashboard/
        layout.tsx # Dashboard shell with auth guard (OWNER only)
        page.tsx   # Overview page with stats cards
    api/auth/     # better-auth API route handler
    login/        # Login page
    register/     # Registration page
  components/
    dashboard/
      sidebar.tsx  # Client component with nav links & active state
      topbar.tsx   # Server component showing user info
      stats-card.tsx # Stats display card
    storefront/
      header.tsx  # Server component with nav & auth state
      footer.tsx  # 3-column footer
    ui/           # Shared UI primitives (Button, Card, Badge, etc.)
  lib/
    auth.ts       # better-auth server config
    auth-client.ts # better-auth client (React)
    db.ts         # Prisma client singleton
    tenant.ts     # Multi-tenant helper
prisma/
  schema.prisma   # Database schema (auth, catalog, blog, subscribers)
  migrations/     # Database migrations
public/
  uploads/        # User-uploaded files (gitignored)
docs/
  superpowers/    # Project plans & specs
```

## Database

The Prisma schema includes models for:
- **Auth:** User, Session, Account, Verification (better-auth compatible)
- **Catalog:** Product, ProductVariant, ProductImage, Category, ProductCategory
- **Blog:** Post, Comment
- **Store:** StoreSetting, Subscriber

All tenant-scoped tables include a `tenantId` field for future multi-tenant support.

### Running Migrations

```bash
npx prisma migrate dev
```