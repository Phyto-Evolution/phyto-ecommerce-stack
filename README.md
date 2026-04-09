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
- **Auth:** better-auth (planned)

## Project Structure

```
src/
  app/          # Next.js App Router pages & layouts
public/
  uploads/      # User-uploaded files (gitignored)
docs/
  superpowers/  # Project plans & specs
```