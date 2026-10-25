import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";
import { optionalUser } from "@/lib/supabase/guards";
import Breadcrumbs from "@/components/Breadcrumbs";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChapterActions from "./ChapterActions";

const siteUrl = "https://dgstudy.in";
const logoUrl = "/dgstudy-logo.jpeg";

type ChapterPageProps = {
  params: {
    branchSlug: string;
    semesterSlug: string;
    subjectSlug: string;
    chapterSlug: string;
  };
};

async function loadPath(
  supabase: SupabaseClient,
  branchSlug: string,
  semesterSlug: string,
  subjectSlug: string,
  chapterSlug: string
) {
  const { data: branch } = await supabase
    .from("branches")
    .select("id, name, slug")
    .eq("slug", branchSlug)
    .single();

  if (!branch) {
    return {
      branch: null,
      semester: null,
      subject: null,
      chapter: null,
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
      branch,
      semester: null,
      subject: null,
      chapter: null,
    };
  }

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .eq("semester_id", semester.id)
    .eq("slug", subjectSlug)
    .single();

  if (!subject) {
    return {
      branch,
      semester,
      subject: null,
      chapter: null,
    };
  }

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, name, slug, description, chapter_number")
    .eq("subject_id", subject.id)
    .eq("slug", chapterSlug)
    .single();

  return { branch, semester, subject, chapter };
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { supabase } = await optionalUser();

  const { branch, semester, subject, chapter } = await loadPath(
    supabase,
    params.branchSlug,
    params.semesterSlug,
    params.subjectSlug,
    params.chapterSlug
  );

  if (!branch || !semester || !subject || !chapter) {
    return {
      title: "Chapter Not Found",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${chapter.name} — ${subject.name}`;
  const description =
    chapter.description ||
    `Read ${chapter.name} notes for ${subject.name}, ${semester.name}, ${branch.name}. Access Diploma and Polytechnic study material on DGStudy.`;

  const canonicalUrl =
    `${siteUrl}/branches/${branch.slug}/${semester.slug}/${subject.slug}/${chapter.slug}`;

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
      type: "article",
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

export default async function ChapterPage({
  params,
}: ChapterPageProps) {
  const { supabase, user } = await optionalUser();

  const { branch, semester, subject, chapter } = await loadPath(
    supabase,
    params.branchSlug,
    params.semesterSlug,
    params.subjectSlug,
    params.chapterSlug
  );

  if (!branch || !semester || !subject || !chapter) notFound();

  const { data: note } = await supabase
    .from("notes")
    .select("id")
    .eq("chapter_id", chapter.id)
    .eq("published", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  let bookmarked = false;
  let completed = false;

  if (user) {
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("chapter_id", chapter.id)
        .maybeSingle(),
      supabase
        .from("progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("chapter_id", chapter.id)
        .maybeSingle(),
    ]);

    bookmarked = !!b;
    completed = !!p;
  }

  const path =
    `/branches/${branch.slug}/${semester.slug}/${subject.slug}/${chapter.slug}`;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-6">
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
            {
              label: subject.name,
              href: `/branches/${branch.slug}/${semester.slug}/${subject.slug}`,
            },
            { label: chapter.name },
          ]}
        />

        <div className="mt-2 text-sm font-medium text-slate-500">
          Chapter {chapter.chapter_number ?? ""}
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          {chapter.name}
        </h1>

        {chapter.description && (
          <p className="mt-1 text-sm text-slate-600">
            {chapter.description}
          </p>
        )}

        <div className="mt-4">
          <ChapterActions
            chapterId={chapter.id}
            path={path}
            isLoggedIn={!!user}
            initialBookmarked={bookmarked}
            initialCompleted={completed}
            hasNote={!!note}
          />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}