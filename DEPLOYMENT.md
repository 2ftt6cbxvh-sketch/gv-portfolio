# Deployment Guide — Vercel + Neon (Free Tier)

This deploys the site for free: **Vercel** hosts the Next.js app, **Neon** hosts the PostgreSQL database. Both have generous free tiers suitable for a personal portfolio.

## Overview

```
GitHub repo  →  Vercel (build + hosting)  →  Neon (Postgres, serverless)
                        ↓
              your-domain.com (optional, free on Vercel)
```

## 1. Push your code to GitHub

If not already done:

```bash
cd gv-next
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

Make sure `.env` is **not** committed (it's already in `.gitignore`) — only `.env.example` should be tracked.

## 2. Create a free Neon database

1. Go to [neon.tech](https://neon.tech) and sign up (free, no credit card required for the free tier).
2. Click **New Project**. Pick a region close to where most visitors are (or close to Vercel's default region, `us-east-1`, for lowest latency).
3. Once created, go to the project's **Dashboard → Connection Details**.
4. Copy the **connection string** that looks like:
   ```
   postgresql://<user>:<password>@<host>/<db>?sslmode=require
   ```
5. Neon gives you both a "pooled" and "direct" connection string. **Use the pooled one** (contains `-pooler` in the hostname) for `DATABASE_URL` — this is required for serverless environments like Vercel functions, which open many short-lived connections.

Neon free tier limits (as of writing): 1 project, 10 branches, 0.5 GB storage, autosuspend after inactivity (cold start adds ~1s to first query after idle — fine for a portfolio site). Check [neon.tech/pricing](https://neon.tech/pricing) for current limits.

## 3. Run migrations against the Neon database

From your local machine, temporarily point at the Neon database and apply migrations + seed:

```bash
# Use the Neon connection string (direct, non-pooled, for migrations)
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require" npx prisma migrate deploy

DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require" \
ADMIN_EMAIL="admin@ganeshvarma.in" \
ADMIN_PASSWORD="12345678" \
node prisma/seed.js
```

This creates all tables and the admin user directly on Neon, before your first deploy. (You can also do this later via Vercel's build step — see step 5 — but running it once manually first is easiest to reason about and avoids build-time migration surprises.)

## 4. Import the project into Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub (free).
2. Click **Add New → Project**, select your repo.
3. Framework preset should auto-detect **Next.js** — leave defaults.
4. Before deploying, open **Environment Variables** and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string from step 2 |
| `NEXTAUTH_SECRET` | a strong random string — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your production URL, e.g. `https://your-project.vercel.app` (update later if you attach a custom domain) |
| `ADMIN_EMAIL` | `admin@ganeshvarma.in` (only used if you run the seed script via Vercel later) |
| `ADMIN_PASSWORD` | `12345678` (same note — only read once by the seed script) |

5. Click **Deploy**.

## 5. Ensure Prisma Client generates on Vercel

Your `package.json` build script already handles this:

```json
"build": "prisma generate && next build"
```

Vercel runs `npm run build` by default, so no extra configuration is needed — Prisma Client is generated automatically on every deploy.

If you ever need to run migrations as part of the Vercel build (e.g. for future schema changes without a local migrate step), you can update the build command in **Vercel → Project Settings → Build & Development Settings** to:

```
prisma migrate deploy && prisma generate && next build
```

This applies any pending migrations automatically on deploy. For this initial launch, migrations were already applied manually in step 3, so the default build command is sufficient.

## 6. Verify the deployment

Once deployed, Vercel gives you a URL like `https://gv-portfolio.vercel.app`. Check:

- `/` — public site loads with all three modes and seeded content
- `/admin/login` — log in with your admin credentials
- Make a small edit (e.g. change a project title) and confirm it appears on `/` immediately

## 7. Attach a custom domain (optional, free on Vercel)

1. In Vercel: **Project → Settings → Domains → Add**.
2. Enter your domain (e.g. `ganeshvarma.in`).
3. Vercel shows you DNS records to add at your domain registrar:
   - For an apex domain (`ganeshvarma.in`): an `A` record pointing to Vercel's IP, or Vercel's recommended `ALIAS`/`ANAME` if your registrar supports it.
   - For a subdomain (`www.ganeshvarma.in`): a `CNAME` record pointing to `cname.vercel-dns.com`.
4. Add those records in your registrar's DNS settings (Namecheap, GoDaddy, Cloudflare, etc.).
5. Wait for DNS propagation (usually minutes, can take up to 24–48 hours). Vercel auto-provisions a free SSL certificate once DNS resolves correctly.
6. **Update `NEXTAUTH_URL`** in Vercel's environment variables to your final custom domain (e.g. `https://ganeshvarma.in`), then redeploy (Vercel → Deployments → ⋯ → Redeploy) so NextAuth uses the correct callback URL.

## 8. Post-deploy checklist

- [ ] Log into `/admin/login` with production credentials
- [ ] Change the admin password via `/admin/account` (don't leave it as `12345678` in production)
- [ ] Review all seeded content and replace placeholder text/links with real content
- [ ] Add real images to a hosting location and update `imageUrl` fields (see note below)
- [ ] Confirm the resume link points to a real, publicly accessible file
- [ ] Test all three modes and mobile layout on the live URL

### Note on images in production

The local convention (`public/media/`) works for local dev, but **Vercel's filesystem is read-only and ephemeral in production** — files placed in `public/` at build time are served fine (they're part of the deployed bundle), but you cannot upload new files to that directory after deployment; anything not in the Git repo at build time won't persist. For a personal portfolio this generally means: add images to `public/media/` in your Git repo, commit, and redeploy whenever you want to change a photo. If you later want true runtime image uploads, add a free image host (e.g. Vercel Blob free tier, Cloudinary free tier) and store the returned URL in the existing `imageUrl` fields — no schema change needed, since `imageUrl` is already just a string field.

## What stays free vs. may eventually cost money

| Service | Free tier covers | Watch for |
|---|---|---|
| Vercel | Personal projects, generous bandwidth/build minutes, automatic HTTPS, custom domains | Heavy traffic or team features may hit Hobby plan limits — unlikely for a personal portfolio |
| Neon | 1 project, ~0.5 GB storage, autosuspend compute | Storage growth from a large volume of certificates/papers/images metadata is very unlikely to matter at portfolio scale |
| Domain registration | N/A — domains are never free | Budget ~$10–15/year for a `.in` or `.com` domain from your registrar of choice |

Both Vercel and Neon's free tiers are, as of writing, sufficient indefinitely for a single-admin personal portfolio site with modest traffic. Re-check each provider's current pricing page periodically, as free-tier terms can change.
