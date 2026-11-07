# DGStudy — Study Smart. Prepare Better.

A mobile-first study notes platform for Diploma/Polytechnic students.

**Live:** https://dgstudy.in

## Features

**For students (no login needed to browse and download)**
- Branch → Semester → Subject → Chapter → Notes (PDF) navigation with clean URLs and breadcrumbs
- In-Website PDF viewer and PDF download
- Global search across branches, subjects, chapters and note titles
- Optional account: bookmarks, mark chapters as completed, progress bar, recently viewed, download history

**Admin panel (`/admin`)**
- Create and delete branches, subjects and chapters
- Upload, replace, publish/unpublish and delete PDF notes (versioned, so links do not break)
- Overview stats for content and registered students

**SEO and UX**
- Per-page metadata, Open Graph tags, sitemap and robots
- Mobile-first design with bottom navigation, custom 404 and friendly empty/error states

## Tech Stack
- Next.js 14 (App Router, Server Actions), TypeScript, Tailwind CSS
- Supabase: Postgres, Auth, Storage
- Deployed on Netlify

## Security
- Row-level security (RLS) on every table
- Notes are public only when `published = true`; students can access only their own bookmarks, progress and history
- Admin-only writes, checked through `profiles.role = 'admin'` and middleware
- PDFs are in a private storage bucket and served through short-lived (60 s) signed URLs
- Service-role key is server-only and never exposed to the browser
- Server-side upload validation (PDF only, 50 MB limit)

## Getting Started

1. Clone the repo and run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in these values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. In the Supabase SQL Editor, run `supabase/migrations/0001_init.sql`. This creates the tables, RLS policies, the private `pdfs` bucket and seed data (12 branches x 6 semesters).
4. Create an admin: sign up from `/signup`, then run the SQL below in the SQL Editor.
5. Start the app with `npm run dev`.

Admin SQL:

    update public.profiles set role = 'admin'
    where id = (select id from auth.users where email = 'you@example.com');

## Deployment
Push to GitHub, import the repo in Netlify, add the same environment variables in Site settings → Environment variables, and deploy.

## Roadmap
- Password reset and email verification
- Ranked full-text search
- Per-branch and per-subject progress breakdown
- Edit and re-order branches, subjects and chapters
