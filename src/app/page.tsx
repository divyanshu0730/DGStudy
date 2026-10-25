
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default async function HomePage() {
  const supabase = createClient();
  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, slug, description")
    .order("order_index");

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-10 pb-8 text-center sm:pt-16">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Diploma & Polytechnic Notes PDF
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Find branch-wise, semester-wise and chapter-wise notes for
            Diploma and Polytechnic students. Explore study materials
            and notes PDFs to prepare for your semester exams with DGStudy.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/branches" className="btn-primary w-full sm:w-auto">
              Explore Branches
            </Link>
            <Link href="/search" className="btn-secondary w-full sm:w-auto">
              Search Notes
            </Link>
          </div>
        </section>

        {/* Choose Your Branch */}
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="text-xl font-bold text-slate-900">
            Diploma & Polytechnic Branches
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Explore available subjects and notes across 8 Diploma/Polytechnic branches and 6 semesters.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(branches || []).slice(0, 12).map((b) => (
              <Link
                key={b.id}
                href={`/branches/${b.slug}`}
                className="card p-4"
              >
                <div className="text-2xl">🎓</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {b.name}
                </div>
              </Link>
            ))}
          </div>
          {branches && branches.length > 12 && (
            <div className="mt-4 text-center">
              <Link
                href="/branches"
                className="text-sm font-semibold text-brand-700"
              >
                View all branches →
              </Link>
            </div>
          )}
        </section>

        {/* How DGStudy Works */}
        <section className="bg-white py-8">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Find Notes by Branch, Semester and Chapter
            </h2>
            <div className="mt-5 flex flex-col items-center gap-2 text-sm font-medium text-slate-700">
              {[
                "Choose Branch",
                "Choose Semester",
                "Choose Subject",
                "Choose Chapter",
                "Read or Download Notes PDF",
              ].map((step, i, arr) => (
                <div
                  key={step}
                  className="flex w-full max-w-xs flex-col items-center"
                >
                  <div className="card w-full py-2.5">{step}</div>
                  {i < arr.length - 1 && (
                    <div className="my-1 text-slate-300">↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why DGStudy */}
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="text-xl font-bold text-slate-900">
            Why Study with DGStudy?
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["📚", "Organized semester-wise study materials"],
              ["📄", "Chapter-wise notes for focused learning"],
              ["📱", "Mobile-friendly study platform"],
              ["👁️", "Easy in-app PDF viewing"],
              ["⬇️", "Download available notes PDFs"],
              ["✅", "Optional account for progress and bookmarks"],
            ].map(([icon, text]) => (
              <div key={text} className="card p-4">
                <div className="text-xl">{icon}</div>
                <div className="mt-2 text-sm font-medium text-slate-800">
                  {text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Account Information */}
        <section className="bg-brand-50 py-10">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Access Notes Without an Account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Browse, read and download available notes without signing in.
              Creating a free account adds a personal dashboard, study
              progress, completed chapters, bookmarks, recently viewed
              content and download history.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary w-full sm:w-auto">
                Create Account
              </Link>
              <Link href="/login" className="btn-secondary w-full sm:w-auto">
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
