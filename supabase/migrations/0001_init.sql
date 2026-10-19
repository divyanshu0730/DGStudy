-- =========================================================
-- DGStudy database schema, RLS policies, storage & seed data
-- Run this in the Supabase SQL editor (or via CLI migrations)
-- Hierarchy: Branch -> Semester -> Subject -> Chapter -> Notes (PDF)
-- =========================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ---------- ACADEMIC CONTENT TREE ----------
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- semester_slug is a readable ordinal slug ("1st-semester" .. "6th-semester"),
-- generated automatically so URLs stay clean without extra admin input.
create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  semester_number int not null check (semester_number between 1 and 6),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (branch_id, semester_number)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id) on delete cascade,
  name text not null,
  slug text not null,
  subject_code text,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (semester_id, slug)
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  chapter_number int not null default 1,
  name text not null,
  slug text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  unique (subject_id, slug)
);

-- A chapter may have multiple uploaded note versions; only the published one
-- is shown to students. "version" auto-increments per chapter.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null,
  storage_path text not null,
  file_size bigint,
  version int not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- STUDENT DATA (all keyed by chapter, per spec) ----------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

create index if not exists idx_semesters_branch on public.semesters(branch_id);
create index if not exists idx_subjects_semester on public.subjects(semester_id);
create index if not exists idx_chapters_subject on public.chapters(subject_id);
create index if not exists idx_notes_chapter on public.notes(chapter_id);
create index if not exists idx_notes_title_search on public.notes using gin (to_tsvector('english', title));
create index if not exists idx_chapters_name_search on public.chapters using gin (to_tsvector('english', name));
create index if not exists idx_subjects_name_search on public.subjects using gin (to_tsvector('english', name));
create index if not exists idx_recently_viewed_user on public.recently_viewed(user_id, viewed_at desc);
create index if not exists idx_downloads_user on public.downloads(user_id, downloaded_at desc);
create index if not exists idx_progress_user on public.progress(user_id);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.branches enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.notes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.progress enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.downloads enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Content tree: readable by EVERYONE, including anonymous visitors
-- (student login is optional for browsing/viewing/downloading per spec).
create policy "branches_read_all" on public.branches for select using (true);
create policy "branches_admin_write" on public.branches for all
  using (public.is_admin()) with check (public.is_admin());

create policy "semesters_read_all" on public.semesters for select using (true);
create policy "semesters_admin_write" on public.semesters for all
  using (public.is_admin()) with check (public.is_admin());

create policy "subjects_read_all" on public.subjects for select using (true);
create policy "subjects_admin_write" on public.subjects for all
  using (public.is_admin()) with check (public.is_admin());

create policy "chapters_read_all" on public.chapters for select using (true);
create policy "chapters_admin_write" on public.chapters for all
  using (public.is_admin()) with check (public.is_admin());

-- notes: published notes are public; admins see/manage everything
create policy "notes_read_published_or_admin" on public.notes
  for select using (published = true or public.is_admin());
create policy "notes_admin_write" on public.notes for all
  using (public.is_admin()) with check (public.is_admin());

-- student-owned data: strictly own rows only, login required
create policy "bookmarks_owner_all" on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "progress_owner_all" on public.progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "recently_viewed_owner_all" on public.recently_viewed for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "downloads_owner_all" on public.downloads for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- STORAGE ----------
-- Private bucket for PDFs. Students (including anonymous visitors) never get
-- a direct storage URL; the server issues a short-lived signed URL after
-- checking the note is published (see /api/chapters/[chapterId]/signed-url).
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

create policy "pdfs_admin_write" on storage.objects for all
  using (bucket_id = 'pdfs' and public.is_admin())
  with check (bucket_id = 'pdfs' and public.is_admin());

-- ---------- SEED: 12 branches x 6 semesters (ordinal slugs, no subjects yet) ----------
create or replace function public.ordinal_suffix(n int) returns text as $$
  select case
    when n in (1) then '1st'
    when n in (2) then '2nd'
    when n in (3) then '3rd'
    else n || 'th'
  end;
$$ language sql immutable;

insert into public.branches (name, slug, order_index) values
  ('Civil Engineering', 'civil-engineering', 1),
  ('Computer Science & Engineering', 'computer-science-engineering', 2),
  ('Computer Engineering', 'computer-engineering', 3),
  ('Electrical Engineering', 'electrical-engineering', 4),
  ('Electrical & Electronics Engineering', 'electrical-electronics-engineering', 5),
  ('Electronics & Communication Engineering', 'electronics-communication-engineering', 6),
  ('Mechanical Engineering', 'mechanical-engineering', 7),
  ('Metallurgical Engineering', 'metallurgical-engineering', 8),
  ('Mining Engineering', 'mining-engineering', 9),
  ('Automobile Engineering', 'automobile-engineering', 10),
  ('Food Technology', 'food-technology', 11),
  ('Architectural Assistantship Engineering', 'architectural-assistantship-engineering', 12)
on conflict (slug) do nothing;

insert into public.semesters (branch_id, semester_number, name, slug)
select b.id, gs.n, public.ordinal_suffix(gs.n) || ' Semester', public.ordinal_suffix(gs.n) || '-semester'
from public.branches b
cross join generate_series(1,6) as gs(n)
on conflict (branch_id, semester_number) do nothing;
