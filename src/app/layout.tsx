import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://dgstudy.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "DGStudy — JUT Diploma & Polytechnic Notes PDF",
    template: "%s | DGStudy",
  },

  description:
    "Find JUT Diploma and Polytechnic notes PDFs organized branch-wise, semester-wise and chapter-wise. Explore syllabus-based study materials for Jharkhand University of Technology students.",

  applicationName: "DGStudy",

  icons: {
    icon: "/dgstudy-logo.jpeg",
  },

  openGraph: {
    title: "DGStudy — JUT Diploma & Polytechnic Notes PDF",
    description:
      "Explore JUT Diploma study material with branch-wise, semester-wise and chapter-wise notes PDFs on DGStudy.",
    url: siteUrl,
    siteName: "DGStudy",
    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary",
    title: "DGStudy — JUT Diploma & Polytechnic Notes PDF",
    description:
      "Explore syllabus-based notes PDFs for JUT Diploma and Polytechnic students.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}