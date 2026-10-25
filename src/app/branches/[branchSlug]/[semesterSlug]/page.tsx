
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const siteUrl = "https://dgstudy.in";
const logoUrl = "/dgstudy-logo.jpeg";

async function loadBranchAndSemester(
  branchSlug: string,
  semesterSlug: string
) {
  const supabase = createClient();

  const { data: branch } = await supabase
    .from("branches")
    .select("id, name, slug")
    .eq("slug", branchSlug)
    .single();

  if (!branch) {
    return { supabase, branch: null, semester: null };
  }

  const { data: semester } = await supabase
    .from("semesters")
    .select("id, semester_number, name, slug")
    .eq("branch_id", branch.id)
    .eq("slug", semesterSlug)
    .single();

  return { supabase, branch, semester };
}

type SemesterPageProps = {
  params: {
    branchSlug: string;
    semesterSlug: string;
  };
};

export async function generateMetadata({
  params,
}: SemesterPageProps): Promise<Metadata> {
  const { branch, semester } = await loadBranchAndSemester(
    params.branchSlug,
    params.semesterSlug
  );

  if (!branch || !semester) {
    return {
      title: "Semester Not Found",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${semester.name} — ${branch.name} Diploma Notes`;
  const description = `Explore subjects and study notes for ${semester.name} of ${branch.name} on DGStudy. Find Diploma and Polytechnic study materials organized for exam preparation.`;
  const canonicalUrl = `${siteUrl}/branches/${branch.slug}/${semester.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | DGStudy`,
      description,
      url: canonicalUrl,
      siteName: "DGStudy",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: logoUrl,
          alt: "DGStudy Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | DGStudy`,
      description,
      images: [
        {
          url: logoUrl,
          alt: "DGStudy Logo",
        },
      ],
    },
  };
}

export default async function SemesterPage({
  params,
}: SemesterPageProps) {
  const {
    supabase,
    branch,
    semester,
  } = await loadBranchAndSemester(
    params.branchSlug,
    params.semesterSlug
  );

  if (!branch || !semester) notFound();

  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name, slug, subject_code, chapters(id)")
    .eq("semester_id", semester.id)
    .order("order_index");

  if (subjectsError) {
    console.error(
      "Public subjects query failed:",
      subjectsError.message
    );
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Branches", href: "/branches" },
            {
              label: branch.name,
              href: `/branches/${branch.slug}`,
            },
            { label: semester.name },
          ]}
        />

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {semester.name}
        </h1>

        <p className="text-sm text-slate-600">
          {branch.name}
        </p>

        <div className="mt-5 space-y-2">
          {(subjects || []).map((sub: any) => (
            <Link
              key={sub.id}
              href={`/branches/${branch.slug}/${semester.slug}/${sub.slug}`}
              className="card flex items-center justify-between p-4"
            >
              <div>
                <div className="font-medium text-slate-900">
                  {sub.name}
                </div>

                <div className="text-xs text-slate-500">
                  {sub.subject_code
                    ? `${sub.subject_code} · `
                    : ""}
                  {sub.chapters?.length || 0} chapter
                  {sub.chapters?.length === 1 ? "" : "s"}
                </div>
              </div>

              <span className="text-slate-400">›</span>
            </Link>
          ))}

          {(!subjects || subjects.length === 0) && (
            <p className="card p-4 text-sm text-slate-500">
              No subjects added for this semester yet.
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
