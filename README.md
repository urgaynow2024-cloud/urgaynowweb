# Ur Gay Now — Official Community Website

A welcoming, colourful, LGBTQ+ friendly community hub built with **Next.js (App Router)**,
**TypeScript**, **Tailwind CSS**, and **Prisma**. It includes a public site plus a secure,
single-admin dashboard for managing all content.

## Features

- 🏠 Public pages: Home, About, Rules, Staff, Events, Guides/FAQ, Links, News, Gallery, Support
- 🛠️ Secure admin dashboard (protected routes, single admin login)
- 👥 Staff directory with photos, VRChat usernames, ranks, bios, social links
- 📣 Announcements & 📅 Events with Markdown content and image uploads
- 📖 Rules & Guides/FAQ (collapsible)
- 🖼️ Group photos & gallery image management
- 🌗 Light / dark mode with no flash on load
- 📱 Fully responsive & accessible (skip link, focus styles, semantic HTML)
- 🔍 SEO-friendly metadata on every page
- 💾 Optional Vercel Blob storage for images (falls back to local disk in dev)

## Tech stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Framework      | Next.js 14 (App Router) + TypeScript     |
| Styling        | Tailwind CSS                             |
| Database       | Prisma + Supabase (PostgreSQL)               |
| Auth           | Cookie session (JWT via `jose`)         |
| Image uploads  | Vercel Blob (or local `public/uploads`)  |
| Rendering      | Server Components + Server Actions       |

## Getting started (local)

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
#   - Set AUTH_SECRET to a long random string
#   - Set DATABASE_URL to your Supabase connection string (see "Supabase notes" below)
#   - Set ADMIN_USERNAME and ADMIN_PASSWORD in .env
#     (run `npm run gen:password` to print a ready-to-paste line)

# 3. Create the database tables and seed sample content.
#    `prisma db push` deadlocks through Supabase's transaction-mode pooler, so:
#    - Run the SQL in schema.sql (repo root) in the Supabase SQL Editor, OR
#    - Switch the Supabase pooler to Session mode (Dashboard -> Settings ->
#      Database -> Connection pooler) and then run: npx prisma db push
npm run db:seed

# 4. Run the dev server
npm run dev
```

### Supabase connection notes (important)

Supabase gives you two hosts. Use them as follows:

| Purpose            | Host                       | Port | Username              |
| ------------------ | -------------------------- | ---- | --------------------- |
| Direct connection  | `db.<ref>.supabase.co`     | 5432 | `postgres`            |
| Connection pooler  | `*.pooler.supabase.com`    | 6543 | `postgres.<ref>`      |

- The **pooler** (port 6543) requires the project ref in the username:
  `postgres.<ref>@<region>.pooler.supabase.com:6543/postgres`.
- Append **`?pgbouncer=true&connection_limit=1`** for Prisma — this disables prepared
  statements, which PgBouncer's transaction mode does not support.
- If your network blocks the direct `:5432` port (common on some ISPs), use the **pooler**
  for local dev. The app runs fine through it.
- If the DB password contains `@`, URL-encode it as `%40`.
- `prisma db push` / migrations hang on the transaction-mode pooler — either run the SQL
  from `schema.sql` in the Supabase SQL Editor, or set the pooler to **Session** mode first.

Visit:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin  (log in with the username/password you set)

## Admin dashboard

Log in at `/admin`. From there you can:
- Add / edit / remove staff, announcements, events, rules, guides, links
- Upload staff photos, group photos, and gallery images
- Update homepage copy, the About page, support info, and social links (Settings)

The public cannot access `/admin` — routes are protected by `middleware.ts` and server-side
session checks.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import** the repository.
3. Add the environment variables from your `.env` (especially `AUTH_SECRET`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `DATABASE_URL`).
4. **Database (Supabase):** the project already uses the Supabase/PostgreSQL Prisma provider.
   - **For the running app:** set `DATABASE_URL` to the **pooler** connection
     (`postgres.<ref>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`).
    - **For the build step (creating tables):** the project’s `build` script already runs
      `prisma generate && prisma db push && next build`, so the Prisma schema (including the
      `GroupPhoto` table) is synced to the database on every deploy. `prisma db push` needs a stable
      connection:
        - On Vercel’s network the **direct** `:5432` host *is* reachable, so set `DATABASE_URL` to
          the direct connection at build time: `postgresql://postgres:<pw>@db.<ref>.supabase.co:5432/postgres?sslmode=require`.
        - **Do not** use the transaction-mode pooler (`:6543?pgbouncer=true`) for the build — it
          deadlocks `db push`. Either use the direct `:5432` connection, or switch the Supabase
          pooler to **Session** mode first.
        - Bulletproof alternative: run the SQL in `schema.sql` (repo root) once in the Supabase
          **SQL Editor**, then the build-time push is a harmless no-op.
    - If a new model (e.g. `GroupPhoto`) was added after the first deploy, the production database
      may be missing its table. The next deploy’s `prisma db push` creates it automatically — or run
      `schema.sql` in the Supabase SQL Editor to add it immediately.
5. (Required for uploads on Vercel) **Image uploads:** add a Vercel Blob store and set
   `BLOB_READ_WRITE_TOKEN`. Without it, uploads only work on the local filesystem (not on Vercel),
   and `/api/upload` returns a clean, user-safe error instead of crashing.

   **Setting up Vercel Blob:**
   - Go to your Vercel project dashboard
   - Navigate to Storage → Create Database → Blob
   - Once created, open the Blob store (or its access keys) and copy `BLOB_READ_WRITE_TOKEN`
   - Add `BLOB_READ_WRITE_TOKEN` as an environment variable in Vercel for **Production**,
     **Preview**, and **Development** environments
   - Group photo uploads, group banner uploads, and all other image fields depend on this token.
   - If the token is missing, the upload route fails *gracefully* with:
     `Image storage is not configured. Please contact support.` (HTTP 503) — no stack traces
     are exposed to the client.
6. Deploy. Set your Fasthosts domain in the Vercel project's **Domains** settings and follow the
   DNS instructions.

> Because the database is hosted on Supabase and image uploads use Vercel Blob, everything is
> fully persistent and works on Vercel's serverless platform.

## Connecting your Fasthosts domain

In the Vercel dashboard, go to **Settings → Domains**, add your Fasthosts domain, and update the
DNS records at Fasthosts as Vercel instructs (usually a CNAME or A record). Vercel provisions a
free SSL certificate automatically.

## Project structure

```
app/
  page.tsx                 # Home
  about/ rules/ staff/ events/ guides/ links/ news/ gallery/ support/
  admin/                   # Dashboard + CRUD (protected)
  api/upload/route.ts      # Secure image upload endpoint
components/                # Shared UI + admin form components
lib/                       # db, auth, upload, settings, utils
prisma/schema.prisma       # Database models
middleware.ts              # Protects /admin and /api/upload
```

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Production build                     |
| `npm run start`   | Run the production build             |
| `npm run lint`    | Lint                                 |
| `npm run typecheck` | TypeScript check                   |
| `npm run db:seed` | Seed sample content                  |
| `npm run gen:password` | Print an admin password line for .env |

## Future ideas (already considered in the design)

Event countdowns, community stats, a bot/status page, search across guides, an announcement
archive, a partners/affiliates page, and Discord / VRChat quick-action buttons.
