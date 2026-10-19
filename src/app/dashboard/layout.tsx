import BottomNav from "@/components/BottomNav";
import { requireUser } from "@/lib/supabase/guards";
import { logoutAction } from "@/app/auth/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">D</div>
            <span className="font-bold text-brand-800">DGStudy</span>
          </a>
          <form action={logoutAction}>
            <button className="text-sm font-medium text-slate-500">Log out</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-4">{children}</div>
      <BottomNav />
    </div>
  );
}
