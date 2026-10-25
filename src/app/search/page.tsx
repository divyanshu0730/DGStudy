import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Search",
  description: "Search DGStudy for branches, semesters, subjects and chapters.",
  alternates: { canonical: "https://dgstudy.in/search" }
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient();
  const q = (searchParams.q || "").trim();

  let branchResults: any[] = [];
  let subjectResults: any[] = [];
  let chapterResults: any[] = [];
  let noteResults: any[] = [];

  if (q.length >= 2) {
    const [branches, subjects, chapters, notes] = await Promise.all([
      supabase.from("branches").select("id, name, slug").ilike("name", `%${q}%`).limit(10),
      supabase
        .from("subjects")
        .select("id, name, slug, semesters(slug, branches(name, slug))")
        .ilike("name", `%${q}%`)
        .limit(10),
      supabase
        .from("chapters")
        .select("id, name, slug, subjects(name, slug, semesters(slug, branches(name, slug)))")
        .ilike("name", `%${q}%`)
        .limit(15),
      supabase
        .from("notes")
        .select("id, title, chapters(name, slug, subjects(name, slug, semesters(slug, branches(name, slug))))")
        .eq("published", true)
        .ilike("title", `%${q}%`)
        .limit(15)
    ]);
    branchResults = branches.data || [];
    subjectResults = subjects.data || [];
    chapterResults = chapters.data || [];
    noteResults = notes.data || [];
  }

  const noResults =
    q.length >= 2 &&
    !branchResults.length &&
    !subjectResults.length &&
    !chapterResults.length &&
    !noteResults.length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Search</h1>
        <form className="mt-3" method="get">
          <input name="q" defaultValue={q} placeholder="Search branches, subjects, chapters…" className="input" autoFocus />
        </form>

        {q.length < 2 && <p className="mt-4 text-sm text-slate-400">Type at least 2 characters to search.</p>}
        {noResults && <p className="mt-4 text-sm text-slate-500">No results found for "{q}".</p>}

        {branchResults.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Branches</h2>
            <div className="space-y-2">
              {branchResults.map((b) => (
                <Link key={b.id} href={`/branches/${b.slug}`} className="card block p-3 text-sm font-medium text-slate-900">
                  {b.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {subjectResults.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Subjects</h2>
            <div className="space-y-2">
              {subjectResults.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/branches/${s.semesters?.branches?.slug}/${s.semesters?.slug}/${s.slug}`}
                  className="card block p-3"
                >
                  <div className="text-sm font-medium text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.semesters?.branches?.name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {chapterResults.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Chapters</h2>
            <div className="space-y-2">
              {chapterResults.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/branches/${c.subjects?.semesters?.branches?.slug}/${c.subjects?.semesters?.slug}/${c.subjects?.slug}/${c.slug}`}
                  className="card block p-3"
                >
                  <div className="text-sm font-medium text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {c.subjects?.semesters?.branches?.name} → {c.subjects?.name}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {noteResults.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Notes</h2>
            <div className="space-y-2">
              {noteResults.map((n: any) => (
                <Link
                  key={n.id}
                  href={`/branches/${n.chapters?.subjects?.semesters?.branches?.slug}/${n.chapters?.subjects?.semesters?.slug}/${n.chapters?.subjects?.slug}/${n.chapters?.slug}`}
                  className="card block p-3"
                >
                  <div className="text-sm font-medium text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-500">
                    {n.chapters?.subjects?.semesters?.branches?.name} → {n.chapters?.subjects?.name} → {n.chapters?.name}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}