import Link from "next/link";
import { requireUser } from "@/lib/supabase/guards";

export default async function BookmarksPage() {
  const { supabase, user } = await requireUser();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("created_at, chapters(id, name, slug, subjects(name, slug, semesters(slug, branches(name, slug))))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Saved chapters</h1>
      <div className="mt-4 space-y-2">
        {(bookmarks || []).map((b: any) =>
          b.chapters ? (
            <Link
              key={b.chapters.id}
              href={`/branches/${b.chapters.subjects?.semesters?.branches?.slug}/${b.chapters.subjects?.semesters?.slug}/${b.chapters.subjects?.slug}/${b.chapters.slug}`}
              className="card flex items-center gap-3 p-4"
            >
              <div className="text-xl">🔖</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-900">{b.chapters.name}</div>
                <div className="text-xs text-slate-500">
                  {b.chapters.subjects?.semesters?.branches?.name} · {b.chapters.subjects?.name}
                </div>
              </div>
            </Link>
          ) : null
        )}
        {(!bookmarks || bookmarks.length === 0) && (
          <p className="text-sm text-slate-500">You haven't bookmarked any chapters yet.</p>
        )}
      </div>
    </div>
  );
}
