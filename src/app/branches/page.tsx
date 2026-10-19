import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Branches",
  description: "Browse all Diploma/Polytechnic branches on DGStudy — semester-wise subjects and chapter-wise notes."
};

export default async function BranchesPage() {
  const supabase = createClient();
  const { data: branches, error } = await supabase.from("branches").select("id, name, slug, description").order("order_index");
console.log("Branches query:", { branches, error });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Branches" }]} />
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Choose Your Branch</h1>
        <p className="mt-1 text-sm text-slate-600">All 12 branches, 6 semesters each.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(branches || []).map((b) => (
            <Link key={b.id} href={`/branches/${b.slug}`} className="card p-4">
              <div className="text-2xl">🎓</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{b.name}</div>
              {b.description && <div className="mt-1 text-xs text-slate-500">{b.description}</div>}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
