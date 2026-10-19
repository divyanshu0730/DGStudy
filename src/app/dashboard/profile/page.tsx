import { requireUser } from "@/lib/supabase/guards";
import { logoutAction } from "@/app/auth/actions";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();

  const [{ count: bookmarkCount }, { count: completedCount }] = await Promise.all([
    supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("progress").select("id", { count: "exact", head: true }).eq("user_id", user.id)
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <div className="card mt-4 p-4">
        <div className="text-sm text-slate-500">Name</div>
        <div className="font-medium text-slate-900">{profile?.full_name || "—"}</div>
        <div className="mt-3 text-sm text-slate-500">Email</div>
        <div className="font-medium text-slate-900">{user.email}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-700">{bookmarkCount ?? 0}</div>
          <div className="text-xs text-slate-500">Saved notes</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-700">{completedCount ?? 0}</div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
      </div>

      <form action={logoutAction} className="mt-6">
        <button className="btn-secondary w-full">Log out</button>
      </form>
    </div>
  );
}
