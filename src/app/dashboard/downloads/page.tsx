import Link from "next/link";
import { requireUser } from "@/lib/supabase/guards";

export default async function DownloadsPage() {
  const { supabase, user } = await requireUser();

  const { data: downloads } = await supabase
    .from("downloads")
    .select("downloaded_at, chapters(id, name, slug, subjects(name, slug, semesters(slug, branches(name, slug))))")
    .eq("user_id", user.id)
    .order("downloaded_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Download history</h1>
      <div className="mt-4 space-y-2">
        {(downloads || []).map((d: any, i: number) =>
          d.chapters ? (
            <Link
              key={i}
              href={`/branches/${d.chapters.subjects?.semesters?.branches?.slug}/${d.chapters.subjects?.semesters?.slug}/${d.chapters.subjects?.slug}/${d.chapters.slug}`}
              className="card flex items-center gap-3 p-4"
            >
              <div className="text-xl">⬇️</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-900">{d.chapters.name}</div>
                <div className="text-xs text-slate-500">
                  {d.chapters.subjects?.semesters?.branches?.name} · {new Date(d.downloaded_at).toLocaleString()}
                </div>
              </div>
            </Link>
          ) : null
        )}
        {(!downloads || downloads.length === 0) && (
          <p className="text-sm text-slate-500">Notes you download will show up here.</p>
        )}
      </div>
    </div>
  );
}
