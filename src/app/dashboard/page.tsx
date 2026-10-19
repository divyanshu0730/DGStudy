import Link from "next/link";
import { requireUser } from "@/lib/supabase/guards";

export default async function DashboardHome() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: recents }, { count: completedCount }, { count: totalPublishedChapters }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase
        .from("recently_viewed")
        .select(
          "viewed_at, chapters(id, name, slug, subjects(name, slug, semesters(slug, branches(name, slug))))"
        )
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(5),
      supabase.from("progress").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      // Chapters that currently have at least one published note (rough total for overall progress).
      supabase.from("notes").select("chapter_id", { count: "exact", head: true }).eq("published", true)
    ]);

  const total = totalPublishedChapters ?? 0;
  const done = completedCount ?? 0;
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">
        {profile?.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}!` : "Welcome back!"}
      </h1>

      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Study Progress</span>
          <span className="text-slate-500">{done}/{total} completed</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-right text-xs text-slate-500">{pct}%</div>
      </section>

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recently Viewed</h2>
        </div>
        {recents && recents.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recents.map((r: any) =>
              r.chapters ? (
                <Link
                  key={r.chapters.id}
                  href={`/branches/${r.chapters.subjects?.semesters?.branches?.slug}/${r.chapters.subjects?.semesters?.slug}/${r.chapters.subjects?.slug}/${r.chapters.slug}`}
                  className="card min-w-[180px] shrink-0 p-3"
                >
                  <div className="line-clamp-2 text-sm font-medium text-slate-900">{r.chapters.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{r.chapters.subjects?.name}</div>
                </Link>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chapters you view will show up here.</p>
        )}
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/branches" className="card p-4 text-center">
          <div className="text-xl">🎓</div>
          <div className="mt-1 text-sm font-semibold text-slate-800">Browse Branches</div>
        </Link>
        <Link href="/dashboard/downloads" className="card p-4 text-center">
          <div className="text-xl">⬇️</div>
          <div className="mt-1 text-sm font-semibold text-slate-800">Download History</div>
        </Link>
      </div>
    </div>
  );
}
