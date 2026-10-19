import { requireAdmin } from "@/lib/supabase/guards";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();

  const [branches, subjects, chapters, published, unpublished, students] = await Promise.all([
    supabase.from("branches").select("id", { count: "exact", head: true }),
    supabase.from("subjects").select("id", { count: "exact", head: true }),
    supabase.from("chapters").select("id", { count: "exact", head: true }),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student")
  ]);

  const stats = [
    ["Branches", branches.count ?? 0],
    ["Subjects", subjects.count ?? 0],
    ["Chapters", chapters.count ?? 0],
    ["Published notes", published.count ?? 0],
    ["Unpublished notes", unpublished.count ?? 0],
    ["Registered students", students.count ?? 0]
  ] as const;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Overview</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-brand-700">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
