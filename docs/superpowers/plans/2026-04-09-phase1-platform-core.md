# Phase 1: Platform Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working single-tenant plant ecommerce platform with product catalog, micro blog, authentication, and seller dashboard.

**Architecture:** Full-stack Next.js 15 monolith with App Router. Route groups separate storefront `(storefront)` and dashboard `(dashboard)`. Prisma ORM with PostgreSQL. better-auth for authentication. All tables include `tenantId` for future multi-tenant extraction. In-process event emitter for domain events.

**Tech Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL, better-auth, Tailwind CSS, Sharp, Nodemailer, react-markdown

---

## File Structure

```
phyto-ecommerce-stack/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (html, body, fonts)
│   │   ├── (storefront)/
│   │   │   ├── layout.tsx                      # Storefront shell (header, footer, nav)
│   │   │   ├── page.tsx                        # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                    # Product listing grid
│   │   │   │   └── [slug]/page.tsx             # Product detail
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx                    # Blog listing
│   │   │   │   ├── [slug]/page.tsx             # Single post + comments
│   │   │   │   └── new/page.tsx                # Write post (auth required)
│   │   │   └── account/
│   │   │       └── page.tsx                    # User profile
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx                  # Dashboard shell (sidebar, topbar)
│   │   │       ├── page.tsx                    # Dashboard overview
│   │   │       ├── products/
│   │   │       │   ├── page.tsx                # Product table
│   │   │       │   ├── new/page.tsx            # Create product form
│   │   │       │   └── [id]/edit/page.tsx      # Edit product form
│   │   │       ├── blog/
│   │   │       │   ├── page.tsx                # Post management + moderation
│   │   │       │   └── subscribers/page.tsx    # Subscriber list
│   │   │       └── settings/
│   │   │           └── page.tsx                # Store settings
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts          # better-auth catch-all
│   │   │   └── v1/
│   │   │       ├── products/route.ts           # GET products list
│   │   │       └── products/[slug]/route.ts    # GET single product
│   │   ├── login/page.tsx                      # Login page
│   │   └── register/page.tsx                   # Register page
│   ├── lib/
│   │   ├── db.ts                               # Prisma client singleton
│   │   ├── auth.ts                             # better-auth server config
│   │   ├── auth-client.ts                      # better-auth client
│   │   ├── tenant.ts                           # getTenantId() helper
│   │   ├── events/
│   │   │   ├── emitter.ts                      # Typed EventEmitter
│   │   │   └── handlers.ts                     # Event handlers (email on post.published)
│   │   ├── email/
│   │   │   ├── send.ts                         # SMTP transport via Nodemailer
│   │   │   └── templates/
│   │   │       ├── welcome.ts                  # Welcome email HTML
│   │   │       └── new-post.ts                 # New post notification HTML
│   │   └── storage/
│   │       └── images.ts                       # Sharp resize + WebP pipeline
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   └── data-table.tsx
│   │   ├── storefront/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── subscribe-form.tsx
│   │   │   ├── comment-form.tsx
│   │   │   ├── comment-list.tsx
│   │   │   └── markdown-editor.tsx
│   │   └── dashboard/
│   │       ├── sidebar.tsx
│   │       ├── topbar.tsx
│   │       ├── product-form.tsx
│   │       ├── product-table.tsx
│   │       ├── post-table.tsx
│   │       └── stats-card.tsx
│   ├── actions/
│   │   ├── product-actions.ts                  # Server Actions for product CRUD
│   │   ├── blog-actions.ts                     # Server Actions for blog CRUD
│   │   ├── comment-actions.ts                  # Server Actions for comments
│   │   ├── subscriber-actions.ts               # Server Actions for subscribe/unsubscribe
│   │   └── settings-actions.ts                 # Server Actions for store settings
│   └── types/
│       └── index.ts                            # Shared TypeScript types
├── prisma/
│   ├── schema.prisma                           # Full database schema
│   └── seed.ts                                 # Seed script (default tenant, owner user, sample data)
├── public/
│   └── uploads/                                # Image uploads (gitignored)
├── docker-compose.yml                          # PostgreSQL for local dev
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Task 1: Project Scaffolding & Docker

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `docker-compose.yml`, `.env.example`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

Run inside `/root/phyto-ecommerce-stack`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --yes
```

This generates the base Next.js project with Tailwind, TypeScript, App Router, and `src/` directory.

- [ ] **Step 2: Create docker-compose.yml for PostgreSQL**

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: phyto
      POSTGRES_PASSWORD: phyto_dev_pass
      POSTGRES_DB: phyto_ecommerce
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 3: Create .env.example**

Create `.env.example`:

```env
# Database
DATABASE_URL="postgresql://phyto:phyto_dev_pass@localhost:5432/phyto_ecommerce"

# Auth
BETTER_AUTH_SECRET="generate-a-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@example.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 4: Update .gitignore**

Append to the generated `.gitignore`:

```
# Uploads
public/uploads/*
!public/uploads/.gitkeep

# Environment
.env
.env.local
```

- [ ] **Step 5: Create uploads directory placeholder**

```bash
mkdir -p public/uploads
touch public/uploads/.gitkeep
```

- [ ] **Step 6: Copy .env.example to .env and start PostgreSQL**

```bash
cp .env.example .env
# Edit .env with actual DATABASE_URL and BETTER_AUTH_SECRET
docker-compose up -d
```

- [ ] **Step 7: Verify Next.js runs**

```bash
npm run dev
# Visit http://localhost:3000 — should see default Next.js page
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with Docker PostgreSQL"
git push origin main
```

---

## Task 2: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `src/lib/tenant.ts`

- [ ] **Step 1: Install Prisma**

```bash
npm install prisma --save-dev
npm install @prisma/client
```

- [ ] **Step 2: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────
// AUTH (better-auth managed tables)
// ──────────────────────────────────────

model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          UserRole  @default(BUYER)
  tenantId      String    @default("default")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  accounts      Account[]

  @@index([tenantId])
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ──────────────────────────────────────
// STORE SETTINGS
// ──────────────────────────────────────

model StoreSetting {
  id       String @id @default(cuid())
  tenantId String @default("default")
  key      String
  value    Json

  @@unique([tenantId, key])
  @@index([tenantId])
}

// ──────────────────────────────────────
// CATALOG
// ──────────────────────────────────────

model Category {
  id          String            @id @default(cuid())
  tenantId    String            @default("default")
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
  tenantId        String            @default("default")
  name            String
  slug            String
  description     String            @db.Text
  sku             String?
  price           Decimal           @db.Decimal(10, 2)
  salePrice       Decimal?          @db.Decimal(10, 2)
  costPrice       Decimal?          @db.Decimal(10, 2)
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
  price     Decimal @db.Decimal(10, 2)
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

// ──────────────────────────────────────
// BLOG
// ──────────────────────────────────────

model Post {
  id          String     @id @default(cuid())
  tenantId    String     @default("default")
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
  tenantId     String   @default("default")
  email        String
  confirmed    Boolean  @default(false)
  subscribedAt DateTime @default(now())

  @@unique([tenantId, email])
  @@index([tenantId])
}

// ──────────────────────────────────────
// ENUMS
// ──────────────────────────────────────

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

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Create tenant helper**

Create `src/lib/tenant.ts`:

```typescript
const DEFAULT_TENANT_ID = "default";

export function getTenantId(): string {
  return DEFAULT_TENANT_ID;
}
```

- [ ] **Step 5: Run initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created, all tables generated, Prisma Client regenerated.

- [ ] **Step 6: Verify database**

```bash
npx prisma studio
```

Open browser, confirm all tables exist with correct columns.

- [ ] **Step 7: Commit**

```bash
git add prisma/ src/lib/db.ts src/lib/tenant.ts package.json package-lock.json
git commit -m "feat: add Prisma schema with all Phase 1 models and tenant helper"
git push origin main
```

---

## Task 3: Authentication (better-auth)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`

- [ ] **Step 1: Install better-auth**

```bash
npm install better-auth
```

- [ ] **Step 2: Create server-side auth config**

Create `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "BUYER",
        input: false,
      },
      tenantId: {
        type: "string",
        required: false,
        defaultValue: "default",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

- [ ] **Step 3: Create client-side auth**

Create `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 4: Create auth API route**

Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

- [ ] **Step 5: Create login page**

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn.email({
      email,
      password,
    });

    if (result.error) {
      setError(result.error.message || "Login failed");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Sign In
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-green-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create register page**

Create `src/app/register/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      setError(result.error.message || "Registration failed");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Create Account
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-green-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify auth works**

```bash
npm run dev
```

1. Visit `/register`, create an account
2. Visit `/login`, sign in
3. Check `prisma studio` — user, session, account rows created

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/auth/ src/app/login/ src/app/register/ package.json package-lock.json
git commit -m "feat: add better-auth with email/password, login and register pages"
git push origin main
```

---

## Task 4: Shared UI Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/button.tsx`:

```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-green-700 text-white hover:bg-green-800",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-700 hover:bg-gray-100",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

- [ ] **Step 2: Create Input component**

Create `src/components/ui/input.tsx`:

```tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
```

- [ ] **Step 3: Create Textarea component**

Create `src/components/ui/textarea.tsx`:

```tsx
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
```

- [ ] **Step 4: Create Select component**

Create `src/components/ui/select.tsx`:

```tsx
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
```

- [ ] **Step 5: Create Badge component**

Create `src/components/ui/badge.tsx`:

```tsx
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 6: Create Card component**

Create `src/components/ui/card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components (button, input, textarea, select, badge, card)"
git push origin main
```

---

## Task 5: Storefront Layout & Homepage

**Files:**
- Create: `src/components/storefront/header.tsx`
- Create: `src/components/storefront/footer.tsx`
- Create: `src/app/(storefront)/layout.tsx`
- Create: `src/app/(storefront)/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhytoCommerce",
  description: "The open-source ecommerce platform for plant retailers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Create storefront header**

Create `src/components/storefront/header.tsx`:

```tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-green-800">
            PhytoCommerce
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
              Blog
            </Link>
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/account" className="text-sm text-gray-600 hover:text-gray-900">
                  Account
                </Link>
                {session.user.role === "OWNER" && (
                  <Link
                    href="/dashboard"
                    className="text-sm bg-green-700 text-white px-3 py-1.5 rounded-md hover:bg-green-800"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-green-700 text-white px-3 py-1.5 rounded-md hover:bg-green-800"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create storefront footer**

Create `src/components/storefront/footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">PhytoCommerce</h3>
            <p className="text-sm text-gray-600">
              The open-source ecommerce platform for plant retailers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} PhytoCommerce. Open source under MIT license.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Create storefront layout**

Create `src/app/(storefront)/layout.tsx`:

```tsx
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5: Create homepage**

Create `src/app/(storefront)/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";

export default async function HomePage() {
  const tenantId = getTenantId();

  const [products, posts] = await Promise.all([
    db.product.findMany({
      where: { tenantId, status: "ACTIVE" },
      include: { images: { where: { isCover: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.post.findMany({
      where: { tenantId, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Plant Shop
          </h1>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Discover rare and exotic plants from trusted growers.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-green-800 px-6 py-3 rounded-md font-medium hover:bg-green-50"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-700">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {product.salePrice ? (
                    <>
                      <span className="line-through mr-2">
                        ₹{product.price.toString()}
                      </span>
                      <span className="text-red-600 font-medium">
                        ₹{product.salePrice.toString()}
                      </span>
                    </>
                  ) : (
                    `₹${product.price.toString()}`
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest Blog Posts */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">From the Blog</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">No blog posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {post.publishedAt?.toLocaleDateString()}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Remove default Next.js page if it exists at src/app/page.tsx**

The storefront homepage at `src/app/(storefront)/page.tsx` handles `/`. Remove or replace `src/app/page.tsx` if it conflicts:

```tsx
// src/app/page.tsx — redirect to storefront
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/");
}
```

Note: With route groups, `(storefront)/page.tsx` already serves `/`. Delete `src/app/page.tsx` entirely if Next.js generates one during scaffolding.

- [ ] **Step 7: Verify**

```bash
npm run dev
# Visit http://localhost:3000 — should see hero, empty product grid, empty blog section
```

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/(storefront)/ src/components/storefront/
git rm -f src/app/page.tsx 2>/dev/null; true
git commit -m "feat: add storefront layout with header, footer, and homepage"
git push origin main
```

---

## Task 6: Dashboard Layout & Overview

**Files:**
- Create: `src/components/dashboard/sidebar.tsx`
- Create: `src/components/dashboard/topbar.tsx`
- Create: `src/components/dashboard/stats-card.tsx`
- Create: `src/app/(dashboard)/dashboard/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard sidebar**

Create `src/components/dashboard/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/products", label: "Products", icon: "🌿" },
  { href: "/dashboard/blog", label: "Blog", icon: "📝" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <Link href="/" className="text-lg font-bold text-green-400 block mb-8 px-3">
        PhytoCommerce
      </Link>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-8">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white"
        >
          ← Back to Store
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create dashboard topbar**

Create `src/components/dashboard/topbar.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function Topbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{session?.user.name}</span>
        <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {session?.user.name?.charAt(0).toUpperCase() || "?"}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create stats card**

Create `src/components/dashboard/stats-card.tsx`:

```tsx
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <Card>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </Card>
  );
}
```

- [ ] **Step 4: Create dashboard layout with auth guard**

Create `src/app/(dashboard)/dashboard/layout.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "OWNER") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create dashboard overview page**

Create `src/app/(dashboard)/dashboard/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { StatsCard } from "@/components/dashboard/stats-card";

export default async function DashboardPage() {
  const tenantId = getTenantId();

  const [productCount, postCount, subscriberCount] = await Promise.all([
    db.product.count({ where: { tenantId } }),
    db.post.count({ where: { tenantId } }),
    db.subscriber.count({ where: { tenantId } }),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Products" value={productCount} subtitle="Total in catalog" />
        <StatsCard title="Blog Posts" value={postCount} subtitle="Published & drafts" />
        <StatsCard title="Subscribers" value={subscriberCount} subtitle="Email subscribers" />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npm run dev
# Visit /dashboard — should redirect to /login if not signed in
# Sign in as owner (manually update user role in prisma studio to OWNER)
# Visit /dashboard — should see sidebar, topbar, stats cards with zeros
```

- [ ] **Step 7: Commit**

```bash
git add src/app/(dashboard)/ src/components/dashboard/
git commit -m "feat: add dashboard layout with sidebar, topbar, and overview stats"
git push origin main
```

---

## Task 7: Product CRUD — Server Actions & Dashboard Pages

**Files:**
- Create: `src/actions/product-actions.ts`
- Create: `src/components/dashboard/product-form.tsx`
- Create: `src/components/dashboard/product-table.tsx`
- Create: `src/app/(dashboard)/dashboard/products/page.tsx`
- Create: `src/app/(dashboard)/dashboard/products/new/page.tsx`
- Create: `src/app/(dashboard)/dashboard/products/[id]/edit/page.tsx`

- [ ] **Step 1: Create product server actions**

Create `src/actions/product-actions.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createProduct(formData: FormData) {
  await requireOwner();
  const tenantId = getTenantId();

  const name = formData.get("name") as string;
  const slug = slugify(name);
  const description = formData.get("description") as string;
  const sku = (formData.get("sku") as string) || null;
  const price = new Prisma.Decimal(formData.get("price") as string);
  const salePrice = formData.get("salePrice")
    ? new Prisma.Decimal(formData.get("salePrice") as string)
    : null;
  const costPrice = formData.get("costPrice")
    ? new Prisma.Decimal(formData.get("costPrice") as string)
    : null;
  const stockQty = parseInt(formData.get("stockQty") as string) || 0;
  const status = (formData.get("status") as string) || "DRAFT";
  const genus = (formData.get("genus") as string) || null;
  const species = (formData.get("species") as string) || null;
  const cultivar = (formData.get("cultivar") as string) || null;
  const growthStage = (formData.get("growthStage") as string) || null;

  await db.product.create({
    data: {
      tenantId,
      name,
      slug,
      description,
      sku,
      price,
      salePrice,
      costPrice,
      stockQty,
      status: status as "DRAFT" | "ACTIVE" | "ARCHIVED",
      genus,
      species,
      cultivar,
      growthStage: growthStage as any,
      publishedAt: status === "ACTIVE" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  redirect("/dashboard/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireOwner();
  const tenantId = getTenantId();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sku = (formData.get("sku") as string) || null;
  const price = new Prisma.Decimal(formData.get("price") as string);
  const salePrice = formData.get("salePrice")
    ? new Prisma.Decimal(formData.get("salePrice") as string)
    : null;
  const costPrice = formData.get("costPrice")
    ? new Prisma.Decimal(formData.get("costPrice") as string)
    : null;
  const stockQty = parseInt(formData.get("stockQty") as string) || 0;
  const status = (formData.get("status") as string) || "DRAFT";
  const genus = (formData.get("genus") as string) || null;
  const species = (formData.get("species") as string) || null;
  const cultivar = (formData.get("cultivar") as string) || null;
  const growthStage = (formData.get("growthStage") as string) || null;

  const existing = await db.product.findFirst({ where: { id, tenantId } });
  if (!existing) throw new Error("Product not found");

  await db.product.update({
    where: { id },
    data: {
      name,
      description,
      sku,
      price,
      salePrice,
      costPrice,
      stockQty,
      status: status as "DRAFT" | "ACTIVE" | "ARCHIVED",
      genus,
      species,
      cultivar,
      growthStage: growthStage as any,
      publishedAt:
        status === "ACTIVE" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  await requireOwner();
  const tenantId = getTenantId();

  await db.product.deleteMany({ where: { id, tenantId } });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
}
```

- [ ] **Step 2: Create product form component**

Create `src/components/dashboard/product-form.tsx`:

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Product } from "@prisma/client";

interface ProductFormProps {
  action: (formData: FormData) => void;
  product?: Product | null;
}

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

const growthStageOptions = [
  { value: "", label: "None" },
  { value: "SEEDLING", label: "Seedling" },
  { value: "DEFLASKED", label: "Deflasked" },
  { value: "JUVENILE", label: "Juvenile" },
  { value: "SEMI_MATURE", label: "Semi-Mature" },
  { value: "MATURE", label: "Mature" },
  { value: "SPECIMEN", label: "Specimen" },
];

export function ProductForm({ action, product }: ProductFormProps) {
  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <Input
        id="name"
        name="name"
        label="Product Name"
        required
        defaultValue={product?.name || ""}
      />

      <Textarea
        id="description"
        name="description"
        label="Description"
        required
        defaultValue={product?.description || ""}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="sku"
          name="sku"
          label="SKU"
          defaultValue={product?.sku || ""}
        />
        <Select
          id="status"
          name="status"
          label="Status"
          options={statusOptions}
          defaultValue={product?.status || "DRAFT"}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          id="price"
          name="price"
          label="Price (₹)"
          type="number"
          step="0.01"
          required
          defaultValue={product?.price.toString() || ""}
        />
        <Input
          id="salePrice"
          name="salePrice"
          label="Sale Price (₹)"
          type="number"
          step="0.01"
          defaultValue={product?.salePrice?.toString() || ""}
        />
        <Input
          id="costPrice"
          name="costPrice"
          label="Cost Price (₹)"
          type="number"
          step="0.01"
          defaultValue={product?.costPrice?.toString() || ""}
        />
      </div>

      <Input
        id="stockQty"
        name="stockQty"
        label="Stock Quantity"
        type="number"
        defaultValue={product?.stockQty?.toString() || "0"}
      />

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Plant Details (optional)</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input
            id="genus"
            name="genus"
            label="Genus"
            defaultValue={product?.genus || ""}
          />
          <Input
            id="species"
            name="species"
            label="Species"
            defaultValue={product?.species || ""}
          />
          <Input
            id="cultivar"
            name="cultivar"
            label="Cultivar"
            defaultValue={product?.cultivar || ""}
          />
        </div>
        <div className="mt-4">
          <Select
            id="growthStage"
            name="growthStage"
            label="Growth Stage"
            options={growthStageOptions}
            defaultValue={product?.growthStage || ""}
          />
        </div>
      </div>

      <Button type="submit">
        {product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create product table component**

Create `src/components/dashboard/product-table.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/actions/product-actions";
import type { Product } from "@prisma/client";

interface ProductTableProps {
  products: Product[];
}

const statusBadge = {
  DRAFT: "warning" as const,
  ACTIVE: "success" as const,
  ARCHIVED: "default" as const,
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Name</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">SKU</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Price</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Stock</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Status</th>
            <th className="text-right text-sm font-medium text-gray-600 px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No products yet.{" "}
                <Link href="/dashboard/products/new" className="text-green-700 hover:underline">
                  Create one
                </Link>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="text-sm font-medium text-gray-900 hover:text-green-700"
                  >
                    {product.name}
                  </Link>
                  {product.genus && (
                    <p className="text-xs text-gray-500 italic">
                      {product.genus} {product.species}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.sku || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{product.price.toString()}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.stockQty}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadge[product.status]}>{product.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                    <form
                      action={async () => {
                        if (confirm("Delete this product?")) {
                          await deleteProduct(product.id);
                        }
                      }}
                    >
                      <Button variant="danger" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create products list page**

Create `src/app/(dashboard)/dashboard/products/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/dashboard/product-table";

export default async function ProductsPage() {
  const tenantId = getTenantId();

  const products = await db.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Link href="/dashboard/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>
      <ProductTable products={products} />
    </div>
  );
}
```

- [ ] **Step 5: Create new product page**

Create `src/app/(dashboard)/dashboard/products/new/page.tsx`:

```tsx
import { createProduct } from "@/actions/product-actions";
import { ProductForm } from "@/components/dashboard/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Product</h2>
      <ProductForm action={createProduct} />
    </div>
  );
}
```

- [ ] **Step 6: Create edit product page**

Create `src/app/(dashboard)/dashboard/products/[id]/edit/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { notFound } from "next/navigation";
import { updateProduct } from "@/actions/product-actions";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantId = getTenantId();

  const product = await db.product.findFirst({
    where: { id, tenantId },
  });

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>
      <ProductForm action={updateWithId} product={product} />
    </div>
  );
}
```

- [ ] **Step 7: Verify**

```bash
npm run dev
# Go to /dashboard/products → empty table
# Click "Add Product" → fill form → submit
# Should redirect to products list with new product
# Click "Edit" → modify → save
# Click "Delete" → confirm → product removed
```

- [ ] **Step 8: Commit**

```bash
git add src/actions/product-actions.ts src/components/dashboard/product-form.tsx src/components/dashboard/product-table.tsx src/app/\(dashboard\)/dashboard/products/
git commit -m "feat: add product CRUD with dashboard pages and server actions"
git push origin main
```

---

## Task 8: Storefront Product Pages

**Files:**
- Create: `src/components/storefront/product-card.tsx`
- Create: `src/components/storefront/product-grid.tsx`
- Create: `src/app/(storefront)/products/page.tsx`
- Create: `src/app/(storefront)/products/[slug]/page.tsx`

- [ ] **Step 1: Create product card component**

Create `src/components/storefront/product-card.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductImage, GrowthStage } from "@prisma/client";

type ProductWithImages = Product & { images: ProductImage[] };

interface ProductCardProps {
  product: ProductWithImages;
}

const growthStageLabels: Record<GrowthStage, string> = {
  SEEDLING: "Seedling",
  DEFLASKED: "Deflasked",
  JUVENILE: "Juvenile",
  SEMI_MATURE: "Semi-Mature",
  MATURE: "Mature",
  SPECIMEN: "Specimen",
};

export function ProductCard({ product }: ProductCardProps) {
  const coverImage = product.images.find((img) => img.isCover) || product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        {coverImage ? (
          <img
            src={coverImage.url}
            alt={coverImage.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-700">
          {product.name}
        </h3>
        {product.genus && (
          <p className="text-xs text-gray-500 italic">
            {product.genus} {product.species}
          </p>
        )}
        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.price.toString()}
              </span>
              <span className="text-sm font-semibold text-red-600">
                ₹{product.salePrice.toString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              ₹{product.price.toString()}
            </span>
          )}
        </div>
        {product.growthStage && (
          <Badge variant="info">{growthStageLabels[product.growthStage]}</Badge>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create product grid component**

Create `src/components/storefront/product-grid.tsx`:

```tsx
import { ProductCard } from "./product-card";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImages = Product & { images: ProductImage[] };

interface ProductGridProps {
  products: ProductWithImages[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create products listing page**

Create `src/app/(storefront)/products/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { ProductGrid } from "@/components/storefront/product-grid";

export default async function ProductsPage() {
  const tenantId = getTenantId();

  const products = await db.product.findMany({
    where: { tenantId, status: "ACTIVE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

- [ ] **Step 4: Create product detail page**

Create `src/app/(storefront)/products/[slug]/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { GrowthStage } from "@prisma/client";

const growthStageLabels: Record<GrowthStage, string> = {
  SEEDLING: "Seedling",
  DEFLASKED: "Deflasked",
  JUVENILE: "Juvenile",
  SEMI_MATURE: "Semi-Mature",
  MATURE: "Mature",
  SPECIMEN: "Specimen",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantId = getTenantId();

  const product = await db.product.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          {product.images.length > 0 ? (
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((img) => (
                    <div key={img.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {product.genus && (
            <p className="text-gray-500 italic mb-4">
              {product.genus} {product.species}
              {product.cultivar && ` '${product.cultivar}'`}
            </p>
          )}

          <div className="flex items-center gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="text-2xl text-gray-400 line-through">
                  ₹{product.price.toString()}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  ₹{product.salePrice.toString()}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            {product.growthStage && (
              <Badge variant="info">{growthStageLabels[product.growthStage]}</Badge>
            )}
            {product.stockQty > 0 ? (
              <Badge variant="success">In Stock ({product.stockQty})</Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Options</h3>
              <div className="space-y-2">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <span className="text-sm">{v.name}</span>
                    <span className="text-sm font-medium">₹{v.price.toString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="prose prose-sm max-w-none text-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Care Instructions */}
          {product.careInstructions && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Care Instructions</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(product.careInstructions, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npm run dev
# Create a product via dashboard with status ACTIVE
# Visit /products → should see product card
# Click product → should see detail page with all fields
```

- [ ] **Step 6: Commit**

```bash
git add src/components/storefront/product-card.tsx src/components/storefront/product-grid.tsx src/app/\(storefront\)/products/
git commit -m "feat: add storefront product listing and detail pages"
git push origin main
```

---

## Task 9: Blog — Server Actions & Dashboard

**Files:**
- Create: `src/actions/blog-actions.ts`
- Create: `src/components/dashboard/post-table.tsx`
- Create: `src/app/(dashboard)/dashboard/blog/page.tsx`

- [ ] **Step 1: Create blog server actions**

Create `src/actions/blog-actions.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { events } from "@/lib/events/emitter";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createPost(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const tenantId = getTenantId();
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  // Owner publishes directly, subscribers go to PENDING_REVIEW
  const isOwner = session.user.role === "OWNER";
  const status = isOwner ? "PUBLISHED" : "PENDING_REVIEW";

  const post = await db.post.create({
    data: {
      tenantId,
      authorId: session.user.id,
      title,
      slug: slugify(title),
      body,
      tags,
      status,
      publishedAt: isOwner ? new Date() : null,
    },
  });

  if (isOwner) {
    events.emit("post.published", {
      postId: post.id,
      tenantId,
      title: post.title,
      slug: post.slug,
    });
  }

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");

  if (isOwner) {
    redirect("/dashboard/blog");
  } else {
    redirect("/blog");
  }
}

export async function approvePost(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "OWNER") throw new Error("Unauthorized");

  const tenantId = getTenantId();

  const post = await db.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  events.emit("post.published", {
    postId: post.id,
    tenantId,
    title: post.title,
    slug: post.slug,
  });

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}

export async function deletePost(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "OWNER") throw new Error("Unauthorized");

  const tenantId = getTenantId();
  await db.post.deleteMany({ where: { id, tenantId } });

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}
```

- [ ] **Step 2: Create post table component**

Create `src/components/dashboard/post-table.tsx`:

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approvePost, deletePost } from "@/actions/blog-actions";
import type { Post } from "@prisma/client";

interface PostTableProps {
  posts: Post[];
}

const statusBadge = {
  DRAFT: "warning" as const,
  PENDING_REVIEW: "info" as const,
  PUBLISHED: "success" as const,
};

export function PostTable({ posts }: PostTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Title</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Status</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Tags</th>
            <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Date</th>
            <th className="text-right text-sm font-medium text-gray-600 px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No blog posts yet.
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{post.title}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadge[post.status]}>{post.status.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {post.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {post.status === "PENDING_REVIEW" && (
                      <form action={() => approvePost(post.id)}>
                        <Button variant="primary" size="sm" type="submit">Approve</Button>
                      </form>
                    )}
                    <form
                      action={async () => {
                        if (confirm("Delete this post?")) {
                          await deletePost(post.id);
                        }
                      }}
                    >
                      <Button variant="danger" size="sm" type="submit">Delete</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard blog management page**

Create `src/app/(dashboard)/dashboard/blog/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { PostTable } from "@/components/dashboard/post-table";

export default async function DashboardBlogPage() {
  const tenantId = getTenantId();

  const posts = await db.post.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = posts.filter((p) => p.status === "PENDING_REVIEW").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">
              {pendingCount} post{pendingCount > 1 ? "s" : ""} pending review
            </p>
          )}
        </div>
      </div>
      <PostTable posts={posts} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/blog-actions.ts src/components/dashboard/post-table.tsx src/app/\(dashboard\)/dashboard/blog/
git commit -m "feat: add blog server actions and dashboard management page"
git push origin main
```

---

## Task 10: Blog — Storefront Pages

**Files:**
- Create: `src/app/(storefront)/blog/page.tsx`
- Create: `src/app/(storefront)/blog/[slug]/page.tsx`
- Create: `src/app/(storefront)/blog/new/page.tsx`
- Create: `src/components/storefront/markdown-editor.tsx`
- Create: `src/components/storefront/comment-form.tsx`
- Create: `src/components/storefront/comment-list.tsx`
- Create: `src/actions/comment-actions.ts`

- [ ] **Step 1: Install react-markdown**

```bash
npm install react-markdown
```

- [ ] **Step 2: Create comment server actions**

Create `src/actions/comment-actions.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addComment(postId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Must be signed in to comment");

  const body = formData.get("body") as string;
  if (!body.trim()) throw new Error("Comment cannot be empty");

  await db.comment.create({
    data: {
      postId,
      authorId: session.user.id,
      body: body.trim(),
    },
  });

  const post = await db.post.findUnique({ where: { id: postId } });
  if (post) {
    revalidatePath(`/blog/${post.slug}`);
  }
}
```

- [ ] **Step 3: Create comment form component**

Create `src/components/storefront/comment-form.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { addComment } from "@/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const action = async (formData: FormData) => {
    await addComment(postId, formData);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <Textarea
        name="body"
        placeholder="Write a comment..."
        required
        rows={3}
      />
      <Button type="submit" size="sm">Post Comment</Button>
    </form>
  );
}
```

- [ ] **Step 4: Create comment list component**

Create `src/components/storefront/comment-list.tsx`:

```tsx
interface CommentWithAuthor {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string } | null;
}

interface CommentListProps {
  comments: CommentWithAuthor[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-500">No comments yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.author?.name || "Anonymous"}
            </span>
            <span className="text-xs text-gray-500">
              {comment.createdAt.toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create markdown editor component**

Create `src/components/storefront/markdown-editor.tsx`:

```tsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
}

export function MarkdownEditor({ name, defaultValue = "" }: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`text-sm px-3 py-1 rounded ${!preview ? "bg-gray-200 font-medium" : "text-gray-500"}`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`text-sm px-3 py-1 rounded ${preview ? "bg-gray-200 font-medium" : "text-gray-500"}`}
        >
          Preview
        </button>
      </div>
      {preview ? (
        <div className="prose prose-sm max-w-none border border-gray-300 rounded-md p-3 min-h-[200px] bg-white">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={12}
          placeholder="Write your post in Markdown..."
        />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create blog listing page**

Create `src/app/(storefront)/blog/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";

export default async function BlogPage() {
  const tenantId = getTenantId();
  const session = await auth.api.getSession({ headers: await headers() });

  const posts = await db.post.findMany({
    where: { tenantId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  const canPost = session && (session.user.role === "OWNER" || session.user.role === "BUYER");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        {canPost && (
          <Link href="/blog/new">
            <Button>Write a Post</Button>
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-gray-200 pb-8">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-semibold text-gray-900 hover:text-green-700 mb-2">
                  {post.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-500 mb-3">
                {post.publishedAt?.toLocaleDateString()}
              </p>
              <p className="text-gray-700 line-clamp-3">
                {post.body.slice(0, 300)}
                {post.body.length > 300 ? "..." : ""}
              </p>
              {post.tags.length > 0 && (
                <div className="mt-3 flex gap-1 flex-wrap">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create single post page with comments**

Create `src/app/(storefront)/blog/[slug]/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CommentForm } from "@/components/storefront/comment-form";
import { CommentList } from "@/components/storefront/comment-list";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenantId = getTenantId();
  const session = await auth.api.getSession({ headers: await headers() });

  const post = await db.post.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  // Fetch comment authors
  const authorIds = [post.authorId, ...post.comments.map((c) => c.authorId)];
  const users = await db.user.findMany({
    where: { id: { in: [...new Set(authorIds)] } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const commentsWithAuthors = post.comments.map((c) => ({
    ...c,
    author: userMap.get(c.authorId) || null,
  }));

  const postAuthor = userMap.get(post.authorId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <span>{postAuthor?.name || "Unknown"}</span>
          <span>·</span>
          <span>{post.publishedAt?.toLocaleDateString()}</span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-sm max-w-none mb-12">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>
      </article>

      {/* Comments */}
      <section className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Comments ({commentsWithAuthors.length})
        </h2>
        <CommentList comments={commentsWithAuthors} />

        {session ? (
          <div className="mt-6">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-500">
            <a href="/login" className="text-green-700 hover:underline">Sign in</a> to leave a comment.
          </p>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 8: Create new post page**

Create `src/app/(storefront)/blog/new/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createPost } from "@/actions/blog-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/storefront/markdown-editor";

export default async function NewPostPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user.role !== "OWNER" && session.user.role !== "BUYER")) {
    redirect("/login");
  }

  const isSubscriber = session.user.role === "BUYER";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Post</h1>
      {isSubscriber && (
        <p className="text-sm text-amber-600 mb-6">
          Your post will be reviewed by the store owner before publishing.
        </p>
      )}
      <form action={createPost} className="space-y-6">
        <Input id="title" name="title" label="Title" required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content (Markdown)
          </label>
          <MarkdownEditor name="body" />
        </div>
        <Input
          id="tags"
          name="tags"
          label="Tags (comma separated)"
          placeholder="plants, care tips, rare finds"
        />
        <Button type="submit">
          {isSubscriber ? "Submit for Review" : "Publish"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 9: Verify**

```bash
npm run dev
# As owner: write a post from /blog/new → published immediately, visible on /blog
# As buyer: write a post → goes to PENDING_REVIEW
# Owner approves in /dashboard/blog → now visible on /blog
# Add comments on a post → appears below the post
```

- [ ] **Step 10: Commit**

```bash
git add src/app/\(storefront\)/blog/ src/components/storefront/markdown-editor.tsx src/components/storefront/comment-form.tsx src/components/storefront/comment-list.tsx src/actions/comment-actions.ts package.json package-lock.json
git commit -m "feat: add blog pages with markdown editor, comments, and moderation"
git push origin main
```

---

## Task 11: Subscriber System & Email Events

**Files:**
- Create: `src/actions/subscriber-actions.ts`
- Create: `src/components/storefront/subscribe-form.tsx`
- Create: `src/lib/events/emitter.ts`
- Create: `src/lib/events/handlers.ts`
- Create: `src/lib/email/send.ts`
- Create: `src/lib/email/templates/welcome.ts`
- Create: `src/lib/email/templates/new-post.ts`
- Create: `src/app/(dashboard)/dashboard/blog/subscribers/page.tsx`

- [ ] **Step 1: Install nodemailer**

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

- [ ] **Step 2: Create event emitter**

Create `src/lib/events/emitter.ts`:

```typescript
type EventMap = {
  "product.created": { productId: string; tenantId: string };
  "product.updated": { productId: string; tenantId: string };
  "post.published": { postId: string; tenantId: string; title: string; slug: string };
};

type Handler<T> = (data: T) => void | Promise<void>;

const handlers: { [K in keyof EventMap]?: Handler<EventMap[K]>[] } = {};

export const events = {
  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    if (!handlers[event]) {
      handlers[event] = [];
    }
    handlers[event]!.push(handler);
  },

  async emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    const eventHandlers = handlers[event];
    if (!eventHandlers) return;

    for (const handler of eventHandlers) {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    }
  },
};
```

- [ ] **Step 3: Create email transport**

Create `src/lib/email/send.ts`:

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST) {
    console.log(`[Email skipped - no SMTP configured] To: ${to}, Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@phytocommerce.com",
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    html,
  });
}
```

- [ ] **Step 4: Create email templates**

Create `src/lib/email/templates/welcome.ts`:

```typescript
export function welcomeEmail({ storeName }: { storeName: string }): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #15803d;">Welcome to ${storeName}!</h1>
      <p>Thank you for subscribing. You'll receive updates when new blog posts are published.</p>
      <p style="color: #6b7280; font-size: 14px;">— ${storeName}</p>
    </div>
  `;
}
```

Create `src/lib/email/templates/new-post.ts`:

```typescript
export function newPostEmail({
  storeName,
  postTitle,
  postUrl,
}: {
  storeName: string;
  postTitle: string;
  postUrl: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #15803d;">New Post: ${postTitle}</h1>
      <p>A new post has been published on ${storeName}.</p>
      <a href="${postUrl}" style="display: inline-block; background: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
        Read Now
      </a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">— ${storeName}</p>
    </div>
  `;
}
```

- [ ] **Step 5: Create event handlers**

Create `src/lib/events/handlers.ts`:

```typescript
import { events } from "./emitter";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { newPostEmail } from "@/lib/email/templates/new-post";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

events.on("post.published", async ({ tenantId, title, slug }) => {
  const subscribers = await db.subscriber.findMany({
    where: { tenantId, confirmed: true },
    select: { email: true },
  });

  if (subscribers.length === 0) return;

  const postUrl = `${APP_URL}/blog/${slug}`;
  const html = newPostEmail({
    storeName: "PhytoCommerce",
    postTitle: title,
    postUrl,
  });

  const emails = subscribers.map((s) => s.email);
  await sendEmail({
    to: emails,
    subject: `New Post: ${title}`,
    html,
  });
});

// Register handlers on import
export function initEventHandlers() {
  // This function exists so we can import this module to register handlers.
  // The event registrations above run at import time.
}
```

- [ ] **Step 6: Initialize event handlers in root layout**

Add to `src/app/layout.tsx`, at the top (outside the component):

```typescript
import "@/lib/events/handlers";
```

This ensures handlers are registered when the app starts.

- [ ] **Step 7: Create subscriber server actions**

Create `src/actions/subscriber-actions.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates/welcome";

export async function subscribe(formData: FormData) {
  const tenantId = getTenantId();
  const email = (formData.get("email") as string).toLowerCase().trim();

  if (!email || !email.includes("@")) {
    return { error: "Invalid email address" };
  }

  const existing = await db.subscriber.findUnique({
    where: { tenantId_email: { tenantId, email } },
  });

  if (existing) {
    return { error: "Already subscribed" };
  }

  await db.subscriber.create({
    data: {
      tenantId,
      email,
      confirmed: true, // For Phase 1, auto-confirm. Add double opt-in later.
    },
  });

  await sendEmail({
    to: email,
    subject: "Welcome!",
    html: welcomeEmail({ storeName: "PhytoCommerce" }),
  });

  return { success: true };
}
```

- [ ] **Step 8: Create subscribe form component**

Create `src/components/storefront/subscribe-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { subscribe } from "@/actions/subscriber-actions";
import { Button } from "@/components/ui/button";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await subscribe(formData);
    if (result.error) {
      setStatus("error");
      setMessage(result.error);
    } else {
      setStatus("success");
      setMessage("You're subscribed! Check your email.");
      setEmail("");
    }
  }

  return (
    <div className="bg-green-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-900 mb-2">Stay Updated</h3>
      <p className="text-sm text-green-700 mb-4">
        Get notified when new blog posts are published.
      </p>
      {status === "success" ? (
        <p className="text-sm text-green-700 font-medium">{message}</p>
      ) : (
        <form action={handleSubmit} className="flex gap-2">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-3 py-2 border border-green-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button type="submit" size="sm">Subscribe</Button>
        </form>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 mt-2">{message}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Add subscribe form to blog listing page**

Modify `src/app/(storefront)/blog/page.tsx` — add at the end, before the closing `</div>`:

```tsx
import { SubscribeForm } from "@/components/storefront/subscribe-form";

// ... existing code ...

// Add after the posts list, before closing </div>:
<div className="mt-12">
  <SubscribeForm />
</div>
```

- [ ] **Step 10: Create subscribers dashboard page**

Create `src/app/(dashboard)/dashboard/blog/subscribers/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { Badge } from "@/components/ui/badge";

export default async function SubscribersPage() {
  const tenantId = getTenantId();

  const subscribers = await db.subscriber.findMany({
    where: { tenantId },
    orderBy: { subscribedAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Subscribers ({subscribers.length})
      </h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Email</th>
              <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Status</th>
              <th className="text-left text-sm font-medium text-gray-600 px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.confirmed ? "success" : "warning"}>
                      {sub.confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {sub.subscribedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Verify**

```bash
npm run dev
# Subscribe via /blog → form shows success
# Check /dashboard/blog/subscribers → subscriber listed
# Publish a post → console shows email log (if no SMTP configured)
```

- [ ] **Step 12: Commit**

```bash
git add src/actions/subscriber-actions.ts src/components/storefront/subscribe-form.tsx src/lib/events/ src/lib/email/ src/app/\(dashboard\)/dashboard/blog/subscribers/ src/app/\(storefront\)/blog/page.tsx src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add subscriber system, email events, and notification pipeline"
git push origin main
```

---

## Task 12: Store Settings & Seed Script

**Files:**
- Create: `src/actions/settings-actions.ts`
- Create: `src/app/(dashboard)/dashboard/settings/page.tsx`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Create settings server actions**

Create `src/actions/settings-actions.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const tenantId = getTenantId();
  const settings = await db.storeSetting.findMany({ where: { tenantId } });
  const map: Record<string, unknown> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function updateSettings(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "OWNER") throw new Error("Unauthorized");

  const tenantId = getTenantId();

  const keys = ["storeName", "storeDescription", "contactEmail", "currency", "timezone"];

  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value !== null && value !== undefined) {
      await db.storeSetting.upsert({
        where: { tenantId_key: { tenantId, key } },
        create: { tenantId, key, value: JSON.parse(JSON.stringify(value)) },
        update: { value: JSON.parse(JSON.stringify(value)) },
      });
    }
  }

  revalidatePath("/dashboard/settings");
}
```

- [ ] **Step 2: Create settings page**

Create `src/app/(dashboard)/dashboard/settings/page.tsx`:

```tsx
import { getSettings, updateSettings } from "@/actions/settings-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h2>
      <Card className="max-w-2xl">
        <form action={updateSettings} className="space-y-4">
          <Input
            id="storeName"
            name="storeName"
            label="Store Name"
            defaultValue={(settings.storeName as string) || ""}
          />
          <Input
            id="storeDescription"
            name="storeDescription"
            label="Store Description"
            defaultValue={(settings.storeDescription as string) || ""}
          />
          <Input
            id="contactEmail"
            name="contactEmail"
            label="Contact Email"
            type="email"
            defaultValue={(settings.contactEmail as string) || ""}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="currency"
              name="currency"
              label="Currency"
              defaultValue={(settings.currency as string) || "INR"}
            />
            <Input
              id="timezone"
              name="timezone"
              label="Timezone"
              defaultValue={(settings.timezone as string) || "Asia/Kolkata"}
            />
          </div>
          <Button type="submit">Save Settings</Button>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenantId = "default";

  // Seed store settings
  const defaultSettings = [
    { key: "storeName", value: "PhytoCommerce Demo" },
    { key: "storeDescription", value: "A demo plant store" },
    { key: "currency", value: "INR" },
    { key: "timezone", value: "Asia/Kolkata" },
  ];

  for (const setting of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { tenantId_key: { tenantId, key: setting.key } },
      create: { tenantId, key: setting.key, value: setting.value },
      update: {},
    });
  }

  // Seed sample categories
  const categories = [
    { name: "Aroids", slug: "aroids", description: "Monstera, Philodendron, Anthurium and more" },
    { name: "Succulents", slug: "succulents", description: "Drought-tolerant beauties" },
    { name: "Orchids", slug: "orchids", description: "Elegant flowering plants" },
    { name: "Carnivorous", slug: "carnivorous", description: "Bug-eating plants" },
    { name: "Cacti", slug: "cacti", description: "Desert dwellers" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { tenantId_slug: { tenantId, slug: cat.slug } },
      create: { tenantId, ...cat },
      update: {},
    });
  }

  // Seed sample products
  const aroids = await prisma.category.findUnique({
    where: { tenantId_slug: { tenantId, slug: "aroids" } },
  });

  const products = [
    {
      name: "Monstera Deliciosa",
      slug: "monstera-deliciosa",
      description: "The classic Swiss Cheese Plant. Large fenestrated leaves, easy to care for.",
      price: 899,
      stockQty: 25,
      genus: "Monstera",
      species: "deliciosa",
      growthStage: "JUVENILE" as const,
      status: "ACTIVE" as const,
      publishedAt: new Date(),
    },
    {
      name: "Philodendron Pink Princess",
      slug: "philodendron-pink-princess",
      description: "Stunning variegated Philodendron with pink and green leaves.",
      price: 2499,
      salePrice: 1999,
      stockQty: 5,
      genus: "Philodendron",
      species: "erubescens",
      cultivar: "Pink Princess",
      growthStage: "SEMI_MATURE" as const,
      status: "ACTIVE" as const,
      publishedAt: new Date(),
    },
    {
      name: "Anthurium Clarinervium",
      slug: "anthurium-clarinervium",
      description: "Velvet-leaved Anthurium with prominent white veining. A collector's favorite.",
      price: 1599,
      stockQty: 12,
      genus: "Anthurium",
      species: "clarinervium",
      growthStage: "MATURE" as const,
      status: "ACTIVE" as const,
      publishedAt: new Date(),
    },
  ];

  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { tenantId_slug: { tenantId, slug: prod.slug } },
      create: { tenantId, ...prod },
      update: {},
    });

    if (aroids) {
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: aroids.id } },
        create: { productId: product.id, categoryId: aroids.id },
        update: {},
      });
    }
  }

  console.log("Seed complete: settings, categories, and sample products created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 4: Add seed command to package.json**

Add to `package.json` under `"prisma"`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 5: Install tsx and run seed**

```bash
npm install --save-dev tsx
npx prisma db seed
```

Expected: "Seed complete: settings, categories, and sample products created."

- [ ] **Step 6: Verify**

```bash
npm run dev
# Homepage should now show 3 sample products
# /dashboard/settings should show seeded values
```

- [ ] **Step 7: Commit**

```bash
git add src/actions/settings-actions.ts src/app/\(dashboard\)/dashboard/settings/ prisma/seed.ts package.json package-lock.json
git commit -m "feat: add store settings page and seed script with sample data"
git push origin main
```

---

## Task 13: API Routes (Minimal Headless)

**Files:**
- Create: `src/app/api/v1/products/route.ts`
- Create: `src/app/api/v1/products/[slug]/route.ts`

- [ ] **Step 1: Create products list API**

Create `src/app/api/v1/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  const tenantId = getTenantId();
  const { searchParams } = request.nextUrl;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: { tenantId, status: "ACTIVE" },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where: { tenantId, status: "ACTIVE" } }),
  ]);

  return NextResponse.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

- [ ] **Step 2: Create single product API**

Create `src/app/api/v1/products/[slug]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tenantId = getTenantId();

  const product = await db.product.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
# curl http://localhost:3000/api/v1/products
# curl http://localhost:3000/api/v1/products/monstera-deliciosa
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/
git commit -m "feat: add REST API routes for product listing and detail"
git push origin main
```

---

## Task 14: Image Upload Pipeline

**Files:**
- Create: `src/lib/storage/images.ts`
- Create: `src/app/api/v1/upload/route.ts`

- [ ] **Step 1: Install sharp**

```bash
npm install sharp
```

- [ ] **Step 2: Create image processing utility**

Create `src/lib/storage/images.ts`:

```typescript
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

interface ProcessedImage {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export async function processAndSaveImage(
  buffer: Buffer,
  filename: string
): Promise<ProcessedImage> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const timestamp = Date.now();
  const baseName = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
  const primaryName = `${timestamp}-${baseName}.webp`;
  const thumbName = `${timestamp}-${baseName}-thumb.webp`;

  // Primary image: max 1200x1200, WebP
  const primaryBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const metadata = await sharp(primaryBuffer).metadata();

  // Thumbnail: 400x400
  const thumbBuffer = await sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .webp({ quality: 75 })
    .toBuffer();

  await Promise.all([
    writeFile(path.join(UPLOAD_DIR, primaryName), primaryBuffer),
    writeFile(path.join(UPLOAD_DIR, thumbName), thumbBuffer),
  ]);

  return {
    url: `/uploads/${primaryName}`,
    thumbnailUrl: `/uploads/${thumbName}`,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
```

- [ ] **Step 3: Create upload API route**

Create `src/app/api/v1/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { processAndSaveImage } from "@/lib/storage/images";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 10MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await processAndSaveImage(buffer, file.name);

  return NextResponse.json({ data: result });
}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
# Test upload (requires auth):
# curl -X POST http://localhost:3000/api/v1/upload \
#   -H "Cookie: <session_cookie>" \
#   -F "file=@path/to/image.jpg"
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/images.ts src/app/api/v1/upload/ package.json package-lock.json
git commit -m "feat: add image upload with Sharp processing (resize + WebP)"
git push origin main
```

---

## Task 15: Account Page & Final Polish

**Files:**
- Create: `src/app/(storefront)/account/page.tsx`
- Modify: `src/components/dashboard/sidebar.tsx` (add Subscribers link)

- [ ] **Step 1: Create account page**

Create `src/app/(storefront)/account/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      <Card>
        <CardTitle>Profile</CardTitle>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{session.user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Role</span>
            <Badge>{session.user.role as string}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Add Subscribers link to sidebar**

Modify `src/components/dashboard/sidebar.tsx` — add to `navItems` array after the Blog entry:

```typescript
{ href: "/dashboard/blog/subscribers", label: "Subscribers", icon: "📧" },
```

- [ ] **Step 3: Full verification**

```bash
npm run dev
```

Test the complete flow:
1. Homepage shows hero + products + blog section
2. `/products` — product grid with cards
3. `/products/monstera-deliciosa` — detail page
4. `/blog` — blog listing with subscribe form
5. Subscribe → success message
6. `/blog/new` — write a post (as buyer → pending review)
7. `/login` / `/register` — auth flow
8. `/dashboard` — overview stats
9. `/dashboard/products` — CRUD products
10. `/dashboard/blog` — manage posts, approve pending
11. `/dashboard/blog/subscribers` — subscriber list
12. `/dashboard/settings` — store settings
13. `/account` — profile page
14. API: `GET /api/v1/products`, `GET /api/v1/products/:slug`
15. Upload: `POST /api/v1/upload`

- [ ] **Step 4: Commit**

```bash
git add src/app/\(storefront\)/account/ src/components/dashboard/sidebar.tsx
git commit -m "feat: add account page and finalize Phase 1 navigation"
git push origin main
```

---

## Summary

| Task | What it delivers |
|------|-----------------|
| 1 | Next.js project + Docker PostgreSQL |
| 2 | Prisma schema + DB migration + tenant helper |
| 3 | better-auth + login/register pages |
| 4 | Shared UI components |
| 5 | Storefront layout + homepage |
| 6 | Dashboard layout + overview |
| 7 | Product CRUD (server actions + dashboard) |
| 8 | Storefront product pages |
| 9 | Blog CRUD + dashboard management |
| 10 | Blog storefront + comments + markdown editor |
| 11 | Subscribers + email events + notifications |
| 12 | Store settings + seed script |
| 13 | REST API routes |
| 14 | Image upload pipeline |
| 15 | Account page + final polish |

Each task produces a working, committable increment. 15 commits total.
