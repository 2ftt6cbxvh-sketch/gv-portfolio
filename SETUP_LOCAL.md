# Local Development Setup

This guide takes you from a fresh clone to a running admin-managed portfolio on your machine.

## 1. Prerequisites

Install these before you start:

| Tool | Version | Check with |
|---|---|---|
| Node.js | 18.18+ or 20+ | `node -v` |
| npm | comes with Node | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |
| Git | any recent | `git --version` |

If you don't have PostgreSQL installed locally, the easiest option is:
- **macOS:** `brew install postgresql@16 && brew services start postgresql@16`
- **Windows:** install via [postgresql.org](https://www.postgresql.org/download/windows/) (includes pgAdmin)
- **Linux:** `sudo apt install postgresql postgresql-contrib`

You can also skip local Postgres entirely and point `DATABASE_URL` straight at a free [Neon](https://neon.tech) database — see the deployment guide for how to create one. This is actually the simplest path if you don't want to manage Postgres locally.

## 2. Install dependencies

```bash
cd gv-next
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

## 3. Create your database

If using local PostgreSQL, create an empty database:

```bash
psql -U postgres -c "CREATE DATABASE gvportfolio;"
```

(Adjust the username/flags to match your local Postgres setup.)

## 4. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gvportfolio?schema=public"
NEXTAUTH_SECRET="any-long-random-string-for-local-dev"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@ganeshvarma.in"
ADMIN_PASSWORD="12345678"
```

- `DATABASE_URL` — match whatever user/password/db name you created in step 3. If using Neon locally, paste the connection string from your Neon dashboard here instead.
- `NEXTAUTH_SECRET` — any random string works for local dev. Generate a proper one with `openssl rand -base64 32` if you want.
- `NEXTAUTH_URL` — must match the URL you'll actually run the dev server on (default Next.js port is 3000).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — only used once, by the seed script, to create the admin user row. Changing them later does nothing — use the in-app password change screen instead.

## 5. Run database migrations

This creates all the tables (modes, projects, skills, certificates, papers, achievements, site settings, etc.):

```bash
npm run db:migrate
```

You'll be prompted to name the migration if this is a fresh migration history — press Enter to accept the default, or it will simply apply the existing migration already included in the repo (`prisma/migrations/20260729095052_init`).

## 6. Seed the database

This creates the admin user (bcrypt-hashed password) and starter content for all three modes (Developer, Editor, Data Analyst) so the site isn't empty on first run:

```bash
npm run db:seed
```

The seed script is idempotent — safe to re-run. It won't duplicate the admin user or duplicate content on repeat runs; it upserts by known keys.

## 7. Start the dev server

```bash
npm run dev
```

Visit:
- **Public site:** [http://localhost:3000](http://localhost:3000)
- **Admin login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Log in with the email/password you set in `.env` (defaults: `admin@ganeshvarma.in` / `12345678`).

## 8. Using the admin panel

Once logged in you can manage:

- **Dashboard** — content counts at a glance
- **Modes & Hero copy** — per-mode hero title/lede/role/accent color
- **Projects** — add/edit/delete, per mode, with tags/stack/URL/featured flag
- **Skills** — grouped skill categories with a proficiency slider (0–100) per skill
- **Certificates**, **Papers & Publications**, **Achievements** — same CRUD pattern
- **Contact & Social** — email, resume link, social links
- **Section visibility & order** — show/hide any section per mode, reorder them
- **Theme tokens** — adjust accent colors if desired
- **Change password** — rotate the admin password any time, no code or redeploy needed

Every change is reflected on the public site immediately on next page load — there's no cache to bust, no rebuild required, since the homepage is server-rendered on every request (`dynamic = "force-dynamic"`).

## 9. Adding images

Drop image files into `public/media/` (already created, tracked via `.gitkeep`). Reference them in any `imageUrl` field in the admin panel as `/media/your-file.jpg`. There's no upload widget in this phase — files are placed manually. A future phase could add an upload endpoint (e.g. to Vercel Blob or S3) if needed.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Error: P1001: Can't reach database server` | Postgres isn't running, or `DATABASE_URL` host/port is wrong. Check `pg_isready` or your Neon dashboard status. |
| `relation "ModeContent" does not exist` | Migrations haven't run. Run `npm run db:migrate`. |
| Admin login always fails | Confirm you ran `npm run db:seed` at least once — the admin user only exists after seeding. If you already changed the password via the UI, use that password, not the `.env` value. |
| `NEXTAUTH_URL` mismatch warnings | Make sure `NEXTAUTH_URL` in `.env` exactly matches the URL/port you're browsing to. |
| Port already in use | Run on a different port: `npx next dev -p 3001` (update `NEXTAUTH_URL` to match). |
| Changes in admin don't appear on public site | Hard-refresh the browser tab (the homepage is dynamic/no-cache, but browser/CDN caching of a prior response can occasionally linger in some setups). |
| `prisma generate` errors after pulling new changes | Re-run `npm install` (triggers `postinstall`) or `npm run db:generate` directly. |

## Common day-to-day commands

```bash
npm run dev          # start dev server
npm run build        # production build (also runs prisma generate)
npm run start         # run a production build locally
npm run db:studio     # visual database browser (Prisma Studio)
npm run db:migrate    # create/apply a new migration after schema.prisma changes
npm run db:seed       # re-run seed (idempotent)
```
