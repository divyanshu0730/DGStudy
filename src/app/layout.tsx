import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://dgstudy.in";
const siteTitle = "DGStudy — JUT Diploma & Polytechnic Notes PDF";
const siteDescription =
  "Find JUT Diploma and Polytechnic notes PDFs organized branch-wise, semester-wise and chapter-wise. Explore syllabus-based study materials for Jharkhand University of Technology students.";
const logoUrl = "/dgstudy-logo.jpeg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: "%s | DGStudy",
  },

  description: siteDescription,

  applicationName: "DGStudy",

  icons: {
    icon: logoUrl,
  },

  openGraph: {
    title: siteTitle,
    description:
      "Explore JUT Diploma study material with branch-wise, semester-wise and chapter-wise notes PDFs on DGStudy.",
    url: siteUrl,
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
    title: siteTitle,
    description:
      "Explore syllabus-based notes PDFs for JUT Diploma and Polytechnic students.",
    images: [
      {
        url: logoUrl,
        alt: "DGStudy Logo",
      },
    ],
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