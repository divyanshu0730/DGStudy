import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export async function generateMetadata({ params }: { params: { branchSlug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: branch } = await supabase.from("branches").select("name, description").eq("slug", params.branchSlug).single();
  if (!branch) return {};
  return {
    title: branch.name,
    description: branch.description || `${branch.name} — semester-wise subjects and chapter-wise notes on DGStudy.`
  };
}

export default async function BranchPage({ params }: { params: { branchSlug: string } }) {
  const supabase = createClient();

  const { data: branch } = await supabase
    .from("branches")
    .select("id, name, slug, description")
    .eq("slug", params.branchSlug)
    .single();
  if (!branch) notFound();

  const { data: semesters } = await supabase
    .from("semesters")
    .select("id, semester_number, name, slug")
    .eq("branch_id", branch.id)
    .order("semester_number");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Branches", href: "/branches" }, { label: branch.name }]} />
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{branch.name}</h1>
        {branch.description && <p className="mt-1 text-sm text-slate-600">{branch.description}</p>}

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {(semesters || []).map((s) => (
            <Link key={s.id} href={`/branches/${branch.slug}/${s.slug}`} className="card flex flex-col items-center justify-center p-4">
              <div className="text-xs text-slate-500">Semester</div>
              <div className="text-xl font-bold text-brand-700">{s.semester_number}</div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
