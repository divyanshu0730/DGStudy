import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact and Support",
  description:
    "Contact DGStudy for questions, feedback, notes corrections, or support related to Diploma and Polytechnic study materials.",
  alternates: {
    canonical: "https://dgstudy.in/contact",
  },
  openGraph: {
    title: "Contact DGStudy | Support",
    description:
      "Contact DGStudy for questions, feedback, notes corrections, and website support.",
    url: "https://dgstudy.in/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-800">
          Contact DGStudy
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Have a question, found an error in the notes, or need
          help using DGStudy? Contact us using email or WhatsApp.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          Email Support
        </h2>

        <p className="mt-2 leading-7 text-slate-600">
          Email:{" "}
          <a
            href="mailto:dgstudy4@gmail.com"
            className="text-brand-700 underline hover:text-brand-800"
          >
            dgstudy4@gmail.com
          </a>
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          WhatsApp Support
        </h2>

        <p className="mt-2 leading-7 text-slate-600">
          For questions, feedback, or notes corrections, message us
          on WhatsApp.
        </p>

        <p className="mt-2 leading-7 text-slate-600">
          WhatsApp:{" "}
          <a
            href="https://wa.me/916205647362"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline hover:text-brand-800"
          >
            Chat with DGStudy on WhatsApp
          </a>
        </p>

        <p className="mt-4 leading-7 text-slate-600">
          Please describe your question or the issue clearly so
          we can understand your request.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}