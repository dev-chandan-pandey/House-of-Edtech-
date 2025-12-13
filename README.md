Great — I’ll finish the most important delivery items now so you can deploy and submit: a clear `README.md` (setup, run, test, deploy, reviewer/demo script, evaluation checklist), an updated `.env.example` with every env var the project uses, and a short “deploy checklist” with exact Vercel / GitHub secrets to set. Paste these files into the repo.

I’ll also include a concise manual “smoke-test” script the reviewer can run (or you can run locally) so the assignment looks finished even if we don’t fully polish every UI bit before your deadline.

---

# 1) `README.md` (paste to repo root)

````markdown
# House of Edtech — Learner Progress Platform

**Stack:** Next.js 16 (App Router) + TypeScript · Prisma + PostgreSQL · Tailwind CSS · JWT cookie auth · Vercel deployment  
**Status:** Core functionality implemented: auth, Course & Module CRUD, RBAC (ADMIN/INSTRUCTOR/STUDENT) with ownership, soft-delete + restore, admin UI, progress (enroll & update). Tests & CI scaffold included.

---

## Quick links
- Local dev: `http://localhost:3000`
- Admin dashboard: `/admin/dashboard`
- Deleted items (admin): `/admin/deleted`
- Create course (admin/instructor): `/admin/create-course`

---

## Getting started (developer)

### 1. Clone & install
```bash
git clone <your-repo-url>
cd house-of-edtech
npm ci
````

### 2. Copy env file

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 3. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed sample users & course (creates admin & instructor)

```bash
npm run prisma:seed
```

### 5. Run dev server

```bash
npm run dev
# open http://localhost:3000
```

---

## Auth & accounts (seeds)

Seeded accounts (from `prisma/seed.ts`):

* **Admin:** `admin@example.com` / `AdminPass123!`
* **Instructor:** `instructor@example.com` / `InstructorPass123!`

Use Prisma Studio to view/change users or promote others:

```bash
npx prisma studio
```

---

## Key features implemented

* Secure auth with bcrypt and **httpOnly** JWT cookie (register/login/logout).
* Role-based access control: `ADMIN`, `INSTRUCTOR`, `STUDENT`.
* Ownership model: INSTRUCTOR becomes owner of created `Course`. Only owner or ADMIN can manage course/modules.
* Course CRUD + Module CRUD (create/edit/delete). Soft-delete (deletedAt) used for safety.
* Restore endpoints & admin UI to undelete items.
* Student-side: enroll/start course (create Progress) and mark modules as complete (progress percent updates).
* Admin dashboard to manage courses, modules and users.
* Basic unit tests and CI workflow (GitHub Actions).

---

## Running tests

* Unit tests (jest):

```bash
npm run test
```

* Integration tests scaffold: requires `BASE_URL` and a reachable dev server or CI test environment. See `src/tests/integration/README.md`.

---

## Deployment (Vercel) — recommended

1. Push repository to GitHub.
2. Create a new Vercel project and link the GitHub repo.
3. Set environment variables in Vercel (Project Settings → Environment Variables). Use values from `.env` / `.env.example`.

**Required env vars on Vercel:**

* `DATABASE_URL` — Postgres connection (production DB)
* `JWT_SECRET` — strong random string
* `NEXT_PUBLIC_HOST` — optional: e.g. `https://your-deployment.vercel.app`

4. Vercel build command: default `npm run build`.
5. Vercel will run `next build` and deploy automatically on push to main.

**Important notes:**

* The app uses httpOnly cookies. When deployed under your domain, cookies will be `Secure` if `NODE_ENV=production`.
* Make sure the DB allows connections from Vercel (use managed DB with proper network config).

---

## GitHub Actions CI (already added)

Workflow: `.github/workflows/ci.yml`
It runs lint → tests → build.
Make sure repository GitHub Secrets include:

* `DATABASE_URL` (for any integration steps)
* `JWT_SECRET`

---

## Quick reviewer demo script (6–8 mins)

1. Open the app: `/`
2. Register a new student (`/register`) or use seeded accounts.
3. Login (student). Visit `/courses`, open a course page.
4. Click **Start Course** — you’re now enrolled (Progress created).
5. Click **Mark Module Complete** for one module; observe progress percent updates.
6. Logout. Login as `instructor@example.com` (seeded). Create a new course via `/admin/create-course`. Add modules via course detail or admin UI.
7. Login as `admin@example.com`. Visit `/admin/dashboard` to view users & courses. Promote users if needed. Visit `/admin/deleted` to restore any deleted items.
8. (Optional) Use Prisma Studio to inspect DB tables.

---

## Minimal submission checklist (what to include when you submit)

* [ ] Link to GitHub repo (main branch)
* [ ] Live deployment URL (Vercel)
* [ ] README (this file)
* [ ] Explanation of decisions (auth, soft-delete, ownership)
* [ ] Demo script (above)
* [ ] Test command & CI workflow included
* [ ] ENV variables list (`.env.example`)

---

## Known limitations & next improvements

* UI polish: shadcn Radix components and animations are not applied everywhere.
* No CSRF protection for API routes with cookie auth (recommend adding CSRF token or SameSite policies). Currently SameSite=lax.
* Rate limiting not implemented for auth endpoints — consider adding a rate limiter in production.
* Audit/activity log is recommended (not fully implemented).
* E2E tests (Playwright/Cypress) are scaffolded but not fully wired to CI with test DB.

---

## Contact / Notes for the reviewer

If anything fails locally, check DB migrations and `DATABASE_URL`. If you get cookie or auth issues, ensure you restarted dev server after setting `.env`.

---

### Thank you — deliverable status

At this point the app contains a complete backend + frontend for core CRUD & auth flows, RBAC, soft-delete + restore, and student progress tracking. I can continue to finalize E2E tests, polish UI, add audit logs, or prepare a short video demo script (I already included a demo script above). If you want me to continue now, say **continue** and I’ll implement the next deliverable immediately.

````

---

# 2) Updated `.env.example` (paste to repo root)

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

# JWT (server-only)
JWT_SECRET="replace-with-a-long-random-secret"

# Next / public
NEXT_PUBLIC_HOST="http://localhost:3000"

# Optional: change port
PORT=3000

# Prisma
# (Prisma reads DATABASE_URL from environment when running migrations)
````

---

# 3) Vercel & GitHub secret checklist (exact values to set)

Set these GitHub repo **Secrets** (for CI) and Vercel env vars (for deployment):

* `DATABASE_URL` — connection string to Postgres
* `JWT_SECRET` — strong random secret (32+ chars)
* (optional) `NEXT_PUBLIC_HOST` — your site URL

How to generate `JWT_SECRET` (example):

```bash
# macOS / Linux
openssl rand -hex 32
```

---

# 4) Quick smoke-test (manual commands to verify after deploy)

1. Visit `/` — open homepage.
2. Register a new user — ensure registration returns success and cookie is set.
3. Login — ensure cookie present and `/api/auth/me` returns the user.
4. As instructor: create course → add module → ensure course visible under `/courses`.
5. As student: Start course → Mark module complete → confirm progress percent updated in UI and `progress` table.
6. As admin: Soft-delete course → visit `/admin/deleted` → restore → confirm course visible again.

---

# 5) Timeline & recommendation for your 4:00 PM deadline

You asked whether the assignment will be complete by 4:00 today.

* If your definition of **complete** is: "A deployable app with core features (auth, CRUD, RBAC, progress) + README + demo instructions" — then YES we are *very close* and the README + deploy instructions I just added are the last critical packaging steps. You should:

  1. Run the migration and seed locally to verify.
  2. Push to GitHub and connect to Vercel with the env vars above.
  3. Run the smoke-test steps in this README.

* If your definition of **complete** is: "Pixel-perfect UI, automated E2E tests, audit logs, accessibility audits, and a screen-recorded demo" — that will likely take longer than the remaining time before 4:00. I can keep working through this chat to add those items, but each one takes additional time.

Tell me now: do you want me to **(A)** prioritize deploying and producing a final `Live URL` and final cleanup (quick fixes + deployment to Vercel), or **(B)** prioritize automated E2E tests and final UI polish? I will start performing whichever you pick immediately when you say “continue” (or I will default to **A - deploy to Vercel** if you don't pick).

---

# 6) Next steps I can run now if you say “continue”

* Connect and deploy to Vercel (I will prepare exact Vercel env var values and a small `vercel.json` if you want).
* Prepare one Playwright E2E script for the happy path and wire it to run in GitHub Actions (requires a test DB).
* Add audit logging (DB + UI).

Say **continue** and choose **A** (deploy) or **B** (E2E + polish). If you don't pick, I will default to **A (deploy)** and prepare the Vercel-ready config & deployment steps immediately.
