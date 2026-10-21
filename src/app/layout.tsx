
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dgstudy.in";

export const metadata: Metadata = {
  title: {
    default: "DGStudy — Study Smart. Prepare Better.",
    template: "%s | DGStudy",
  },
  description:
    "DGStudy is a mobile-first study platform for Diploma and Polytechnic students, offering branch-wise, semester-wise and chapter-wise notes and PDFs, with optional progress tracking and bookmarks.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/dgstudy-logo.jpeg",
  },
  openGraph: {
    title: "DGStudy — Study Smart. Prepare Better.",
    description:
      "Branch-wise, semester-wise and chapter-wise notes for Diploma and Polytechnic students.",
    url: siteUrl,
    siteName: "DGStudy",
    type: "website",
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
