import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/branches", label: "Branches & Semesters" },
  { href: "/admin/content", label: "Subjects, Chapters & Notes" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">D</div>
            <span className="font-bold text-brand-800">DGStudy Admin</span>
          </div>
          <form action={logoutAction}>
            <button className="text-sm font-medium text-slate-500">Log out</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-4 px-4 pb-2 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-slate-600 hover:text-brand-700">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
