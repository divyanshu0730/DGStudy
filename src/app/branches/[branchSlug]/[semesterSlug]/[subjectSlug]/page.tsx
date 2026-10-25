
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const siteUrl = "https://dgstudy.in";
const logoUrl = "/dgstudy-logo.jpeg";

async function loadPath(
  branchSlug: string,
  semesterSlug: string,
  subjectSlug: string
) {
  const supabase = createClient();

  const { data: branch } = await supabase
    .from("branches")
    .select("id, name, slug")
    .eq("slug", branchSlug)
    .single();

  if (!branch) {
    return {
      supabase,
      branch: null,
      semester: null,
      subject: null,
    };
  }

  const { data: semester } = await supabase
    .from("semesters")
    .select("id, semester_number, name, slug")
    .eq("branch_id", branch.id)
    .eq("slug", semesterSlug)
    .single();

  if (!semester) {
    return {
      supabase,
      branch,
      semester: null,
      subject: null,
    };
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug, subject_code")
    .eq("semester_id", semester.id)
    .eq("slug", subjectSlug)
    .single();

  return { supabase, branch, semester, subject };
}

type SubjectPageProps = {
  params: {
    branchSlug: string;
    semesterSlug: string;
    subjectSlug: string;
  };
};

export async function generateMetadata({
  params,
}: SubjectPageProps): Promise<Metadata> {
  const { branch, semester, subject } = await loadPath(
    params.branchSlug,
    params.semesterSlug,
    params.subjectSlug
  );

  if (!branch || !semester || !subject) {
    return {
      title: "Subject Not Found",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${subject.name} — ${semester.name}, ${branch.name}`;
  const description = `Explore chapter-wise notes and study materials for ${subject.name}, ${semester.name}, ${branch.name} on DGStudy. Prepare for Diploma and Polytechnic examinations with organized study notes.`;
  const canonicalUrl = `${siteUrl}/branches/${branch.slug}/${semester.slug}/${subject.slug}`;

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

export default async function SubjectPage({
  params,
}: SubjectPageProps) {
  const { supabase, branch, semester, subject } = await loadPath(
    params.branchSlug,
    params.semesterSlug,
    params.subjectSlug
  );

  if (!branch || !semester || !subject) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, name, slug, chapter_number")
    .eq("subject_id", subject.id)
    .order("order_index");

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
            {
              label: semester.name,
              href: `/branches/${branch.slug}/${semester.slug}`,
            },
            { label: subject.name },
          ]}
        />

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {subject.name}
        </h1>

        {subject.subject_code && (
          <p className="text-sm text-slate-600">
            {subject.subject_code}
          </p>
        )}

        <h2 className="mt-5 text-sm font-semibold text-slate-700">
          Chapters
        </h2>

        <div className="mt-2 space-y-2">
          {(chapters || []).map((ch) => (
            <Link
              key={ch.id}
              href={`/branches/${branch.slug}/${semester.slug}/${subject.slug}/${ch.slug}`}
              className="card flex items-center justify-between p-4"
            >
              <span className="font-medium text-slate-900">
                {ch.name}
              </span>
              <span className="text-slate-400">›</span>
            </Link>
          ))}

          {(!chapters || chapters.length === 0) && (
            <p className="card p-4 text-sm text-slate-500">
              No chapters added for this subject yet.
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
