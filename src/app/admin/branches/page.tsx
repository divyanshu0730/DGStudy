import { requireAdmin } from "@/lib/supabase/guards";
import { createBranch, deleteBranch, ensureSemesters } from "@/app/admin/actions";

export default async function AdminBranchesPage() {
  const { supabase } = await requireAdmin();
  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, slug, semesters(id, semester_number)")
    .order("order_index");

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Branches &amp; Semesters</h1>
      <p className="mt-1 text-sm text-slate-500">
        Adding a branch automatically creates its 6 semesters.
      </p>

      <form action={createBranch} className="card mt-4 flex flex-wrap gap-2 p-4">
        <input name="name" placeholder="New branch name" className="input flex-1 min-w-[160px]" required />
        <input name="description" placeholder="Short description (optional)" className="input flex-1 min-w-[160px]" />
        <button className="btn-primary shrink-0">Add branch</button>
      </form>

      <div className="mt-4 space-y-3">
        {(branches || []).map((b: any) => (
          <div key={b.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{b.name}</div>
                <div className="text-xs text-slate-500">{b.semesters?.length || 0}/6 semesters set up</div>
              </div>
              <div className="flex gap-2">
                {(b.semesters?.length || 0) < 6 && (
                  <form action={ensureSemesters.bind(null, b.id)}>
                    <button className="btn-secondary text-xs">Ensure 6 semesters</button>
                  </form>
                )}
                <form action={deleteBranch.bind(null, b.id)}>
                  <button className="text-xs text-red-600">Delete</button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {(!branches || branches.length === 0) && (
          <p className="card p-4 text-sm text-slate-500">No branches yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
