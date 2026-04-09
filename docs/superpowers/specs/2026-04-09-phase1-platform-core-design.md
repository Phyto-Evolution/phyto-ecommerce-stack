# Phase 1: Platform Core — Design Spec

> **Date:** 2026-04-09 | **Status:** Approved | **Repo:** Phyto-Evolution/phyto-ecommerce-stack

---

## Overview

Phase 1 establishes the foundation of PhytoCommerce Stack — a standalone, open-source ecommerce platform for plant retailers. This phase delivers a working single-tenant storefront with product catalog, micro blog, authentication, and seller dashboard.

The architecture is designed for single-tenant launch with a clean upgrade path to DB-per-tenant multi-tenancy. Every table includes `tenantId` from day one; tenant resolution is hardcoded to a default tenant and swappable via middleware later.

---

## Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | RSC by default, Server Actions for mutations |
| Language | TypeScript | Strict mode |
| Database | PostgreSQL | Single instance, tenantId-scoped |
| ORM | Prisma | Single schema file |
| Auth | better-auth | Email/password, role-based, session in DB |
| Styling | Tailwind CSS | Utility-first |
| Images | Sharp | Resize, WebP conversion |
| Email | Nodemailer (SMTP) | Two templates for Phase 1 |
| Events | In-process EventEmitter | Typed events, swap to BullMQ later |

### Deferred (add when needed)

| Tool | Trigger to add |
|------|----------------|
| Meilisearch | Catalog exceeds ~1k–5k SKUs |
| BullMQ + Redis | Async workload becomes noticeable |
| Listmonk | Email volume warrants dedicated service |

---

## Project Structure

```
phyto-ecommerce-stack/
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Product listing
│   │   │   │   └── [slug]/page.tsx     # Product detail
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            # Blog listing
│   │   │   │   ├── [slug]/page.tsx     # Single post + comments
│   │   │   │   └── new/page.tsx        # Write post (owner + subscribers)
│   │   │   └── account/
│   │   │       └── page.tsx            # Profile, order history (stub)
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Product list
│   │   │   │   ├── new/page.tsx        # Create product
│   │   │   │   └── [id]/edit/page.tsx  # Edit product
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            # Manage posts + moderation queue
│   │   │   │   └── subscribers/page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx            # Store settings
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts  # better-auth handler
│   │   │   └── v1/
│   │   │       ├── products/route.ts
│   │   │       └── blog/route.ts
│   │   │
│   │   └── layout.tsx                  # Root layout
│   │
│   ├── lib/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── auth.ts                     # better-auth config
│   │   ├── auth-client.ts              # better-auth client
│   │   ├── tenant.ts                   # getTenantId() — hardcoded default
│   │   ├── events/
│   │   │   ├── emitter.ts              # Typed EventEmitter
│   │   │   └── handlers.ts             # Built-in event handlers
│   │   ├── email/
│   │   │   ├── send.ts                 # SMTP transport
│   │   │   └── templates/
│   │   │       ├── welcome.ts
│   │   │       └── new-post.ts
│   │   └── storage/
│   │       └── images.ts               # Sharp pipeline
│   │
│   ├── components/
│   │   ├── storefront/                 # Storefront-specific components
│   │   ├── dashboard/                  # Dashboard-specific components
│   │   └── ui/                         # Shared primitives (buttons, inputs, etc.)
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
├── docker-compose.yml                  # PostgreSQL for local dev
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Authentication & Authorization

### Provider: better-auth

- Email + password authentication for Phase 1
- Social OAuth (Google) deferred to Phase 2+
- Sessions stored in database (better-auth managed tables)
- `role` and `tenantId` added to user via `additionalFields`

### Roles (Phase 1)

| Role | Access |
|------|--------|
| `OWNER` | Full dashboard, all CRUD, post moderation, settings |
| `BUYER` | Storefront, account, write blog posts (pending review), comment |
| `GUEST` | Browse storefront, read blog, no posting/commenting |

### Route Protection

- `(dashboard)/*` — `OWNER` only (middleware check)
- `(storefront)/blog/new` — `OWNER` or `BUYER` (authenticated)
- `(storefront)/account/*` — any authenticated user
- Everything else — public

---

## Database Schema

### Tenant Context

```prisma
// All models include tenantId for future multi-tenant isolation.
// For Phase 1, getTenantId() returns a hardcoded default value.
// Multi-tenant upgrade: swap to middleware-based tenant resolution,
// then extract to DB-per-tenant when needed.
```

### Store Settings

```prisma
model StoreSetting {
  id       String @id @default(cuid())
  tenantId String
  key      String
  value    Json
  @@unique([tenantId, key])
  @@index([tenantId])
}
```

### Catalog

```prisma
model Category {
  id          String            @id @default(cuid())
  tenantId    String
  name        String
  slug        String
  description String?
  parentId    String?
  parent      Category?         @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[]        @relation("CategoryTree")
  products    ProductCategory[]
  sortOrder   Int               @default(0)
  createdAt   DateTime          @default(now())
  @@unique([tenantId, slug])
  @@index([tenantId])
}

model Product {
  id              String            @id @default(cuid())
  tenantId        String
  name            String
  slug            String
  description     String            @db.Text
  sku             String?
  price           Decimal
  salePrice       Decimal?
  costPrice       Decimal?
  trackStock      Boolean           @default(true)
  stockQty        Int               @default(0)
  allowBackorders Boolean           @default(false)
  status          ProductStatus     @default(DRAFT)
  publishedAt     DateTime?
  genus           String?
  species         String?
  cultivar        String?
  growthStage     GrowthStage?
  careInstructions Json?
  categories      ProductCategory[]
  images          ProductImage[]
  variants        ProductVariant[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  @@unique([tenantId, slug])
  @@unique([tenantId, sku])
  @@index([tenantId])
  @@index([tenantId, status])
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String
  sku       String?
  price     Decimal
  stockQty  Int     @default(0)
  sortOrder Int     @default(0)
  @@unique([productId, sku])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  isCover   Boolean @default(false)
  sortOrder Int     @default(0)
}

model ProductCategory {
  productId  String
  categoryId String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([productId, categoryId])
}
```

### Blog

```prisma
model Post {
  id          String     @id @default(cuid())
  tenantId    String
  authorId    String
  title       String
  slug        String
  body        String     @db.Text
  status      PostStatus @default(DRAFT)
  tags        String[]
  publishedAt DateTime?
  comments    Comment[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([tenantId, status])
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  body      String   @db.Text
  createdAt DateTime @default(now())
  @@index([postId])
}

model Subscriber {
  id           String   @id @default(cuid())
  tenantId     String
  email        String
  confirmed    Boolean  @default(false)
  subscribedAt DateTime @default(now())
  @@unique([tenantId, email])
  @@index([tenantId])
}
```

### Enums

```prisma
enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum GrowthStage {
  SEEDLING
  DEFLASKED
  JUVENILE
  SEMI_MATURE
  MATURE
  SPECIMEN
}

enum PostStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
}

enum UserRole {
  OWNER
  MANAGER
  STAFF
  BUYER
  GUEST
}
```

---

## Event System

In-process typed EventEmitter for Phase 1. Producers emit events; handlers react. When async load grows, swap emitter internals to BullMQ without changing call sites.

### Phase 1 Events

| Event | Trigger | Handler |
|-------|---------|---------|
| `product.created` | Product saved with ACTIVE status | (no handler yet — future: sync to search) |
| `product.updated` | Product modified | (no handler yet) |
| `post.published` | Post status → PUBLISHED | Send email to all confirmed subscribers |

### Interface

```typescript
// lib/events/emitter.ts
type EventMap = {
  'product.created': { productId: string; tenantId: string };
  'product.updated': { productId: string; tenantId: string };
  'post.published':  { postId: string; tenantId: string; title: string; slug: string };
};

export const events = {
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void;
};
```

---

## Email (Phase 1)

Simple SMTP via Nodemailer. Two templates:

1. **Welcome** — sent on subscriber confirmation
2. **New Post** — sent to all confirmed subscribers when a post is published

Templates are plain TypeScript functions returning HTML strings. No template engine needed yet.

---

## Image Processing

Sharp pipeline on upload:
1. Validate MIME (JPEG, PNG, WebP), max 10MB
2. Resize to 1200×1200 (primary) + 400×400 (thumbnail)
3. Convert to WebP (80% quality)
4. Store to local `public/uploads/` (swap to S3 later)
5. Save URL references in `ProductImage`

---

## Storefront Pages (Phase 1)

| Route | Content | Rendering |
|-------|---------|-----------|
| `/` | Homepage — featured products, latest blog posts | RSC |
| `/products` | Product grid with category filter | RSC |
| `/products/[slug]` | Product detail — images, description, plant info, variants | RSC |
| `/blog` | Blog listing — all published posts, tags | RSC |
| `/blog/[slug]` | Single post (rendered markdown) + comments | RSC + client comment form |
| `/blog/new` | Markdown editor for new post (owner + subscribers) | Client component |
| `/account` | Profile, stub for future orders | RSC + client forms |

### Storefront Design Direction

- Clean, plant-focused aesthetic
- Green/earth tone palette
- Responsive, mobile-first
- Product cards with cover image, name, price, growth stage badge
- Markdown rendered with `react-markdown`

---

## Dashboard Pages (Phase 1)

| Route | Content |
|-------|---------|
| `/dashboard` | Overview — product count, recent orders (stub), recent posts |
| `/dashboard/products` | Product table with status filter, search |
| `/dashboard/products/new` | Product create form (all fields, image upload, variants) |
| `/dashboard/products/[id]/edit` | Product edit form |
| `/dashboard/blog` | Post list + moderation queue (pending subscriber posts) |
| `/dashboard/blog/subscribers` | Subscriber list |
| `/dashboard/settings` | Store name, description, logo, contact info |

---

## API Routes (Phase 1 — Minimal)

REST endpoints for future headless/mobile use. Dashboard uses Server Actions directly.

```
GET    /api/v1/products          — List products (public, paginated)
GET    /api/v1/products/:slug    — Single product (public)
GET    /api/v1/blog/posts        — List published posts (public)
POST   /api/auth/[...all]        — better-auth catch-all handler
```

Additional API routes added as needed in later phases.

---

## Multi-Tenant Preparation

### Current State (Phase 1)

```typescript
// lib/tenant.ts
const DEFAULT_TENANT_ID = 'default';

export function getTenantId(): string {
  return DEFAULT_TENANT_ID;
}
```

All database queries include `tenantId: getTenantId()` in their `where` clauses.

### Upgrade Path

1. Add `Tenant` table to schema
2. Replace `getTenantId()` with middleware that extracts tenant from subdomain/domain
3. Seed default tenant record
4. No data migration needed — existing data already has `tenantId`
5. For DB-per-tenant: add connection pooling, swap Prisma client per request

---

## What Phase 1 Does NOT Include

These are explicitly deferred:

- Cart, checkout, payments, orders (Phase 2–3)
- Shipping, tax calculation (Phase 3)
- Plant domain features: batches, lineage, phytosanitary docs, climate zones (Phase 5)
- Loyalty program, subscriptions, bundles (Phase 6)
- Wholesale/B2B portal (Phase 7)
- Analytics, advanced email campaigns (Phase 8)
- Meilisearch, BullMQ, Listmonk (add when needed)
- Social OAuth, 2FA (add incrementally)
