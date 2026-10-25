import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | DGStudy",
  description:
    "Read how DGStudy handles account information, study progress, bookmarks, download history, cookies, third-party services, and data deletion requests.",
  alternates: {
    canonical: "https://dgstudy.in/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Learn how DGStudy handles personal information and protects user privacy.",
    url: "https://dgstudy.in/privacy-policy",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-800">
          Privacy Policy
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          This Privacy Policy explains how DGStudy handles information
          when you visit or use our website for Diploma and Polytechnic
          study resources.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          1. Information We May Collect
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          Depending on the features you use, DGStudy may process your
          account email address, study progress, bookmarks, recently
          viewed notes, and download history. Technical information
          such as browser details and basic usage data may also be
          processed to operate and improve the website.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          2. How We Use Information
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          Information may be used to provide account access, remember
          your study activity, manage bookmarks and downloads, maintain
          website security, and improve the DGStudy experience.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          3. Cookies and Similar Technologies
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          DGStudy and its service providers may use cookies or similar
          technologies for essential website functions, authentication,
          preferences, analytics, or advertising where enabled. You can
          manage cookies through your browser settings. Blocking some
          cookies may affect certain website features.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          4. Third-Party Services
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          DGStudy uses Supabase for supported database and account
          services and Netlify for website hosting. These providers
          may process information needed to deliver their services.
          If Google Analytics or Google AdSense is enabled, those
          services may use cookies or similar technologies according
          to their own privacy policies.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          5. Data Sharing and Security
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          We do not intend to sell personal information. Information
          may be processed by service providers, or disclosed where
          required by law or necessary to protect the website and its
          users. We take reasonable steps to protect information, but
          no online service can guarantee absolute security.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          6. Requesting Data Deletion
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          If you want to request deletion of your account or associated
          personal information, contact us at{" "}
          <a
            href="mailto:dgstudy4@gmail.com"
            className="text-brand-700 underline hover:text-brand-800"
          >
            dgstudy4@gmail.com
          </a>
          . Please use the email associated with your account. We will
          review the request and handle it subject to applicable legal
          requirements and any information that must be retained.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          7. Children and Students
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          DGStudy provides educational resources for Diploma and
          Polytechnic students. Users should avoid sharing unnecessary
          personal information through the website or support channels.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          8. Changes to This Policy
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          We may update this Privacy Policy when our website features,
          services, or legal requirements change. The latest version
          will be published on this page.
        </p>

        <p className="mt-8 text-sm text-slate-500">
          For privacy questions, contact dgstudy4@gmail.com.
        </p>
      </main>

      <SiteFooter />
    </>
  );
}