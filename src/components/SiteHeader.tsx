import Link from "next/link";
import { optionalUser } from "@/lib/supabase/guards";
import MobileMenu from "./MobileMenu";

export default async function SiteHeader() {
  const { user } = await optionalUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur pt-[env(safe-area-inset-top,0px)]">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">D</div>
          <span className="font-bold text-brand-800">DGStudy</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <Link href="/branches" className="hover:text-brand-700">Branches</Link>
          <Link href="/search" className="hover:text-brand-700">Search</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-secondary py-1.5">Dashboard</Link>
          ) : (
            <Link href="/login" className="btn-secondary py-1.5">Login</Link>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-3 sm:hidden">
          <Link href="/search" aria-label="Search" className="text-lg text-slate-600">🔍</Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} aria-label={isLoggedIn ? "Dashboard" : "Login"} className="text-lg text-slate-600">
            👤
          </Link>
          <MobileMenu isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}
