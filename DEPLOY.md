# Deploy runbook — nextwin.ma

This document is the step-by-step playbook to ship this site to production
under the `nextwin.ma` domain.

## TL;DR

- Recommended host: **Vercel** (Next.js native, zero config for our setup,
  free tier covers expected traffic). Cloudflare Pages and Netlify also
  work but need extra adapter config.
- The site needs **dynamic hosting** — it has API routes, admin auth,
  Prisma/Supabase, and the inquiry/booking forms. Static export will
  not ship the admin panel or any inquiry submissions.
- The `.ma` domain is registered through **Cap Connect** and currently
  shows status **"En attente / ID manquant"**. The Moroccan registrar
  needs an ID document uploaded before they activate the domain. Until
  then, deploy under a temporary `*.vercel.app` URL and swap to
  `nextwin.ma` once it's live.

## 0. Prerequisites you do once

- [ ] Upload your CIN (or passport) to Cap Connect so they activate
      `nextwin.ma`. Until status flips from "En attente" to "Actif" you
      cannot point the domain at Vercel.
- [ ] Push the current `main` branch to the GitHub remote
      (`origin` is already configured to
      `github.com/nextuinllc-glitch/nextwin-stays`).
      Confirm `git status` is clean before the next step.

## 1. Pick a host — recommended: Vercel

Why Vercel:

- Native Next.js 15 support (no adapter)
- Free tier handles small-business traffic (100 GB bandwidth/month,
  unlimited serverless invocations on Hobby)
- One-click GitHub integration — every push to `main` deploys
- Automatic HTTPS on the custom domain
- Edge cache for static assets, server functions for API routes

If you prefer Cloudflare Pages: see "Appendix: Cloudflare Pages" below
(needs `@cloudflare/next-on-pages` adapter + a few code tweaks).

## 2. Create the Vercel project

1. Go to <https://vercel.com/new>, sign in with the GitHub account that
   owns the repo (`nextuinllc-glitch`).
2. Click "Import" next to `nextwin-stays`.
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: keep default (`.`) — Vercel finds `package.json`.
5. **Do NOT click Deploy yet** — paste the env vars first (step 3).

## 3. Set environment variables on Vercel

In the import screen → "Environment Variables", add the following.
All values are in your local `.env`; copy them across. Generate fresh
SESSION_SECRET and use a strong ADMIN_PASSWORD for production.

| Variable                       | Source / how to set                                          |
|--------------------------------|--------------------------------------------------------------|
| `DATABASE_URL`                 | Supabase Transaction pooler (port 6543, `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL`                   | Supabase Session pooler (port 5432)                         |
| `NEXT_PUBLIC_SUPABASE_URL`     | `https://<ref>.supabase.co`                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase project → API → anon (public) key                  |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase project → API → service_role key (server-only)     |
| `SUPABASE_STORAGE_BUCKET`      | `uploads`                                                   |
| `SESSION_SECRET`               | Generate: `openssl rand -base64 48`                         |
| `ADMIN_PASSWORD`               | Pick something strong (or use `ADMIN_PASSWORD_HASH` instead)|
| `NEXT_PUBLIC_SITE_URL`         | `https://nextwin.ma` (or temporary `*.vercel.app` until DNS)|
| `R2_S3_ENDPOINT`               | Cloudflare R2 → bucket settings → S3 API endpoint           |
| `R2_BUCKET`                    | Your R2 bucket name                                         |
| `R2_PUBLIC_URL`                | Cloudflare R2 → bucket → "Public URL" (pub-*.r2.dev)        |
| `R2_ACCESS_KEY_ID`             | R2 → Manage API Tokens → Object Read & Write                |
| `R2_SECRET_ACCESS_KEY`         | Same token's secret (shown once)                            |

Mark `NEXT_PUBLIC_*` vars for all environments (Production + Preview +
Development). Mark the rest for Production + Preview.

## 4. First deploy

1. Click "Deploy" on Vercel. Build runs `npm run build` which already
   includes `prisma generate`. First build takes ~2 minutes.
2. When it finishes you'll get a `*.vercel.app` URL — open it and verify:
   - Home renders, hero video plays, portal cards work
   - `/properties` shows real Court séjour listings with real images
   - `/acheter` and `/louer` show the "Bientôt disponible" placeholder
   - `/admin/login` works, password is your `ADMIN_PASSWORD`
   - Submit a test inquiry from `/contact` → admin queue receives it
3. If anything 500s, open Vercel project → Logs → pick the failing
   request — env vars or Prisma connection are the usual suspects.

## 5. Connect the nextwin.ma domain (once Cap Connect activates it)

### 5a. Vercel side

1. Vercel project → Settings → Domains → "Add" → `nextwin.ma`
2. Add a second entry for `www.nextwin.ma`
3. Vercel shows the DNS records you need to create. Note them down.

### 5b. DNS — Option A: Cloudflare (recommended, since you already have CF)

1. Cloudflare dashboard → Add a Site → `nextwin.ma` → Free plan
2. Cap Connect dashboard → nextwin.ma → "Nameservers" action →
   change to the two Cloudflare nameservers Cloudflare gave you
   (e.g. `*.ns.cloudflare.com`). This takes effect in 1–24 h.
3. In Cloudflare → DNS:
   - `A` record: `nextwin.ma` → `76.76.21.21` (Vercel's IP)
   - `CNAME`: `www` → `cname.vercel-dns.com`
   - Both records: "Proxied" status = **DNS only (grey cloud)**.
     Vercel needs to terminate TLS, not Cloudflare.

### 5b. DNS — Option B: Cap Connect's DNS

If you don't want to move nameservers to Cloudflare, use Cap Connect's
DNS panel and create the same `A` and `CNAME` records as above.

### 5c. Verify

- After 5–60 min Vercel will show a green check next to `nextwin.ma`.
- Browse to `https://nextwin.ma` — should serve the live site with a
  valid Let's Encrypt cert (issued by Vercel automatically).
- Update `NEXT_PUBLIC_SITE_URL` on Vercel to `https://nextwin.ma` and
  redeploy so SEO tags / canonical URLs match.

## 6. Post-launch checklist

- [ ] Test admin login: <https://nextwin.ma/admin/login>
- [ ] Pick the home-page featured properties at
      <https://nextwin.ma/admin/featured>
- [ ] Upload team photos at <https://nextwin.ma/admin/team>
- [ ] Submit a fake inquiry from `/contact` and confirm it lands in
      the Inquiry table on Supabase
- [ ] Submit a fake `/gestion` lead and check `kind=MANAGEMENT` rows
- [ ] Try a fake reservation on a Court séjour listing — confirm
      calendar updates
- [ ] Run a Lighthouse audit (target: Performance > 85, SEO 100)
- [ ] Set up a Supabase backup schedule (Supabase project → Settings →
      Backups → daily). The free tier keeps 7 days of automated backups.
- [ ] Once the catalogue is photographed, flip
      `COMING_SOON_NON_STAY` in [src/lib/property-repo.ts](src/lib/property-repo.ts)
      to `false` and redeploy.

## 7. Things that will break if you forget

- **Env vars on Preview deployments**: if you only set vars for
  Production, every PR preview will 500. Set them for "All
  Environments" or at minimum Production + Preview.
- **Prisma connection limit**: Vercel serverless functions cold-start.
  Keep `?pgbouncer=true&connection_limit=1` in `DATABASE_URL` or
  Supabase will reject connections under load.
- **R2 public URL**: the `pub-*.r2.dev` URL only works after you enable
  "Public access" on the bucket (R2 → bucket → Settings → Public).
- **Admin password leak**: change `ADMIN_PASSWORD` immediately if any
  contributor sees it. Better: switch to `ADMIN_PASSWORD_HASH` once
  you've got the password chosen.

## Appendix: Cloudflare Pages

If you want to host on Cloudflare instead of Vercel (one less vendor):

1. `npm i -D @cloudflare/next-on-pages`
2. Add a `wrangler.toml` at the repo root pointing at the Pages project.
3. Build command on Pages: `npx @cloudflare/next-on-pages@1`
4. Output directory: `.vercel/output/static`
5. Compatibility flags: enable `nodejs_compat`.
6. All env vars from §3 go in Pages project Settings → Environment
   variables (set for both "Production" and "Preview").
7. Same DNS steps as §5b but inside Cloudflare you can use the Pages
   project's auto-DNS instead of manual A/CNAME records.

Caveats vs Vercel:

- API routes run on Workers, not Node — some libraries (notably the
  full `@prisma/client` and `ffmpeg-static`) need workarounds.
- Video upload endpoint (`ffmpeg-static`) currently won't work on
  Pages. Keep video uploads on a Vercel-hosted instance or move that
  one endpoint to a Worker with native FFmpeg.

## Appendix: Netlify

Netlify works with the Next plugin (`@netlify/plugin-nextjs`). The plugin
is auto-detected. Steps:

1. <https://app.netlify.com/start> → "Import from GitHub"
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Same env var list as §3 in Site settings → Environment variables.
5. DNS: same as §5b but use `apex-loadbalancer.netlify.com` (A) and
   `<site>.netlify.app` (CNAME) instead of Vercel's targets.
