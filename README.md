# DGStudy — Study Smart. Prepare Better.

Mobile-first study platform for Diploma/Polytechnic students. Next.js 14
(App Router, TypeScript, Server Actions) + Supabase (Postgres, Auth, Storage).

Hierarchy: **Branch → Semester → Subject → Chapter → Notes (PDF)** — no topic
navigation, no test system, no revision section, per spec.

## 1. What's implemented

**Public site (no login required — login is optional for browsing/viewing/downloading):**
- Homepage: hero, "Choose Your Branch" grid, "How DGStudy Works" flow,
  "Why DGStudy" features, Login CTA section, footer.
- `/branches` → `/branches/[branch]` → `/branches/[branch]/[nth-semester]` →
  `/branches/[branch]/[nth-semester]/[subject]` →
  `.../[chapter]` — all data-driven from Postgres, clean readable slugs,
  breadcrumbs on every level, e.g.
  `/branches/electronics-communication-engineering/3rd-semester/analog-electronics/chapter-1`.
- Chapter page: **View Notes** (in-app PDF viewer), **Download PDF** — both
  work with no account. **Bookmark** / **Mark as Completed** prompt a login
  if the visitor isn't signed in. Shows "Notes coming soon." if no PDF is
  published yet — never a broken viewer.
- Global **search** (`/search`) across branches, subjects and chapters.
- SEO: per-page metadata (title/description), Open Graph tags, `sitemap.ts`
  (includes every chapter URL), `robots.ts`, a custom 404 page.

**Account features (`/dashboard/**`, login required):**
- Email/password **sign up, login, logout** (Supabase Auth), with an
  auto-created `profiles` row (role defaults to `student`).
- Dashboard home: welcome message, overall **study progress** bar
  (completed vs. total published chapters), **recently viewed** chapters.
- **Bookmarks** list, **Download history** list.
- Profile page with basic stats and logout.

**Admin panel (`/admin`, separate login at `/admin/login`, gated by
`profiles.role = 'admin'`):**
- Branches: create (auto-provisions all 6 semesters), delete, or
  backfill semesters for older branches.
- Subjects and chapters: create/delete under any branch → semester.
- Notes: upload PDF, **replace** PDF (keeps the same chapter slot),
  **publish/unpublish**, delete. Each upload is versioned
  (`notes.version`) so replacing a PDF doesn't break existing links.
- Overview stats: branches, subjects, chapters, published/unpublished
  notes, registered students.

**Security:**
- Row-level security on every table (see the policies in
  `supabase/migrations/0001_init.sql`): academic-tree tables (branches/
  semesters/subjects/chapters) are readable by anyone (even anonymous),
  matching "login optional to browse"; `notes` are readable only when
  `published = true`, or by admins; `bookmarks`/`progress`/
  `recently_viewed`/`downloads` are readable/writable only by their
  owning `user_id`; all writes to the academic tree and notes require
  `public.is_admin()`.
- The Supabase **service-role key is server-only**
  (`lib/supabase/admin.ts`, marked `server-only`) — never sent to the
  browser. The `pdfs` storage bucket is **private**; students (including
  anonymous visitors) never get a direct storage URL, only a 60-second
  signed URL issued by `/api/chapters/[chapterId]/signed-url` after the
  server checks the note is published (or the requester is an admin).
- File-upload validation on the server: PDF MIME type only, 50MB cap.
- `middleware.ts` protects only `/dashboard/**` and `/admin/**` (and
  further checks `role = 'admin'` for `/admin/**`); everything under
  `/branches` and `/search` is intentionally public.

**Mobile-first design:** bottom tab nav on account pages, header with
hamburger-style icons on mobile / full nav on desktop, large touch
targets, safe-area padding, blue/sky-blue theme, rounded cards, subtle
shadows, minimal JS (most pages are React Server Components — the PDF
viewer/download/bookmark controls are the only client components).

**Empty/loading/error states:** "No subjects/chapters added yet",
"Notes coming soon.", a friendly PDF-load error with a Download
fallback, and a branded 404 page — content looks intentional even
before all academic material is uploaded.

Seed data: the exact 12 branches from the spec × 6 semesters each (see
`supabase/migrations/0001_init.sql`). No subjects/chapters/notes are
invented — admins add those through `/admin`.

## 2. What remains / known limitations

**Changes made in this final audit pass** (nothing else was rewritten):
- Wired up the previously-orphaned `replaceNoteFile` action to an actual
  "Replace" file input per note row in `/admin/content` — PDF replacement
  is now reachable from the UI, not just implemented in `actions.ts`.
- Search now also matches published note titles (previously
  branches/subjects/chapters only).
- The mobile header's hamburger icon now opens a real toggleable menu
  (Home/Branches/Search/Login-or-Dashboard) instead of just linking to
  `/branches`; the header also switches Login → Dashboard once signed in.
- Login now honors a `next` redirect param, so "Log in to bookmark &
  track progress" on a chapter page returns you to that chapter after
  signing in instead of always landing on `/dashboard`.


This was built in a sandboxed environment **with no network access**, so I
could not run `npm install`, `next build`, or connect to a real Supabase
project to test end-to-end. The code is written carefully and should build
cleanly, but please run the checks in section 6 after `npm install` and
fix anything your exact dependency versions surface (this is normal for
any fast-moving framework/library combo).

Not implemented (intentionally, to avoid over-engineering a v1):
- Password reset / email verification UI (Supabase Auth supports it;
  wiring a "forgot password" page is a small follow-up).
- Full-text ranked search (current search uses `ILIKE` on branch/subject/
  chapter names — simple and reliable; can upgrade to Postgres
  `tsvector` ranking later using the `idx_*_search` GIN indexes already
  created).
- Per-branch/per-semester/per-subject progress breakdown (spec section
  22 mentions this as a "nice to have" beyond overall progress; the
  `progress` table + chapter→subject→semester→branch relations support
  computing it, but only the overall percentage is shown on the
  dashboard today).
- Multiple admin roles/permission tiers (single `admin` role only).
- Drag-and-drop re-ordering UI for branches/subjects/chapters (the
  `order_index` columns exist; only manual DB edits or a future UI would
  set them beyond default/creation order).
- Editing an existing branch/subject/chapter's name (currently
  create/delete only — renaming is a small follow-up form).

## 3. Required environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only, never exposed to the browser
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these from your Supabase project: Project Settings → API.

## 4. Supabase setup steps

1. Create a project at https://supabase.com.
2. In the SQL Editor, run the entire contents of
   `supabase/migrations/0001_init.sql`. This creates all tables, RLS
   policies, the `pdfs` storage bucket, and seeds the 12 branches × 6
   semesters from the spec. (If you already ran an earlier version of
   this file against a live project, drop the `public` tables listed in
   it first, or run this in a fresh project — the schema changed
   `notes.file_path`→`storage_path`, `is_published`→`published`, and
   `bookmarks`/`progress`/`recently_viewed` now key off `chapter_id`
   instead of `note_id`, plus a new `downloads` table.)
3. Confirm in Storage that a **private** bucket named `pdfs` exists.
4. Confirm in Authentication → Providers that Email is enabled.
   (For local development you may want to disable "Confirm email" so you
   can sign up and log in immediately.)

## 5. Admin account setup

1. Sign up a normal account from `/signup` (or via the Supabase Auth
   dashboard) with the email you want to use as admin.
2. In the SQL Editor, promote that user:
   ```sql
   update public.profiles set role = 'admin' where id =
     (select id from auth.users where email = 'you@example.com');
   ```
3. Log in at `/admin/login` with that email/password.

## 6. Local development

```
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Then check, and fix any issues found:
```
npm run build
npx tsc --noEmit
```

Open http://localhost:3000.

## 7. Production deployment

Easiest path is Vercel:
1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same environment variables from section 3 in the Vercel
   project settings (Production + Preview).
4. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your production URL.

Any other Node-hosting platform that supports Next.js 14 App Router
(server actions + middleware) works the same way — set the four env vars
and run `npm run build && npm run start`.
