import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://dgstudy.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "DGStudy — Diploma & Polytechnic Notes PDF",
    template: "%s | DGStudy",
  },

  description:
    "Explore branch-wise, semester-wise and chapter-wise notes PDFs for Diploma and Polytechnic students. Find organized study material and prepare for your semester exams with DGStudy.",

  applicationName: "DGStudy",

  icons: {
    icon: "/dgstudy-logo.jpeg",
  },

  openGraph: {
    title: "DGStudy — Diploma & Polytechnic Notes PDF",
    description:
      "Find Diploma and Polytechnic study material with branch-wise, semester-wise and chapter-wise notes PDFs.",
    url: siteUrl,
    siteName: "DGStudy",
    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary",
    title: "DGStudy — Diploma & Polytechnic Notes PDF",
    description:
      "Explore organized notes PDFs for Diploma and Polytechnic students on DGStudy.",
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