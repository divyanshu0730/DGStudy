import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About DGStudy | Diploma Notes for JUT Students",
  description:
    "Learn about DGStudy, a study resource for Jharkhand University of Technology Diploma and Polytechnic students, with notes organized by branch, semester, subject and chapter.",
  alternates: {
    canonical: "https://dgstudy.in/about",
  },
  openGraph: {
    title: "About DGStudy",
    description:
      "Explore DGStudy, a notes platform for JUT Diploma and Polytechnic students.",
    url: "https://dgstudy.in/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-800">About DGStudy</h1>

        <p className="mt-4 leading-7 text-slate-600">
          DGStudy is a study resource designed to help Diploma and Polytechnic
          students find their study notes in one place.
        </p>

        <p className="mt-4 leading-7 text-slate-600">
          The platform is intended especially for students studying under
          Jharkhand University of Technology (JUT) and other Diploma students
          looking for organized study material.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          How notes are organized
        </h2>

        <p className="mt-2 leading-7 text-slate-600">
          Notes are organized by branch, semester, subject and chapter so that
          students can find relevant study material more easily.
        </p>

        <p className="mt-4 leading-7 text-slate-600">
          Our goal is to make study resources easier to access and help students
          prepare for their examinations.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}