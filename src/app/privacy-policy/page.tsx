import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service | DGStudy",
  description:
    "Read the terms and conditions for using DGStudy's Diploma and Polytechnic study notes website.",
  alternates: {
    canonical: "https://dgstudy.in/terms",
  },
  openGraph: {
    title: "Terms of Service | DGStudy",
    description:
      "Terms and conditions for using DGStudy and its educational resources.",
    url: "https://dgstudy.in/terms",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-800">
          Terms of Service
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Welcome to DGStudy. By accessing or using this website, you
          agree to these Terms of Service. If you do not agree, please
          stop using the website.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          1. Educational Purpose
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          DGStudy provides study notes and other educational resources
          for Diploma and Polytechnic students. These materials are
          intended to support learning and exam preparation. We do not
          guarantee specific examination results.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          2. Permitted Use
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          You may access and use the website for lawful personal
          educational purposes. You must not misuse the website,
          attempt unauthorized access, interfere with its operation,
          or use it for unlawful activities.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          3. Notes and Intellectual Property
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          Website design, branding, and original content may be
          protected by applicable intellectual property laws. Do not
          copy, redistribute, or commercially use content in ways
          that violate applicable law or the rights of its owner.
          Third-party materials remain subject to their respective
          owners&apos; rights.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          4. Accuracy and Availability
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          We try to keep the notes and website information useful and
          accurate, but errors or omissions may occur. Website
          features and content may change, and uninterrupted access
          cannot be guaranteed.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          5. Accounts and Security
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          If you create an account, provide accurate information and
          take reasonable steps to protect your login credentials.
          Contact DGStudy if you believe your account has been
          accessed without permission.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          6. Third-Party Services and Links
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          The website may rely on third-party services or link to
          external websites. DGStudy does not control all third-party
          services and is not responsible for their independent
          content or policies.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          7. Limitation of Liability
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          To the extent permitted by applicable law, DGStudy is not
          liable for losses arising from reliance on website content,
          temporary unavailability, or third-party services. Nothing
          in these terms excludes liability where exclusion is not
          permitted by law.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          8. Changes to These Terms
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          We may update these terms when the website or its
          requirements change. Updated terms will be published on
          this page.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-slate-800">
          9. Contact
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          If you have questions about these terms, email{" "}
          <a
            href="mailto:dgstudy4@gmail.com"
            className="text-brand-700 underline hover:text-brand-800"
          >
            dgstudy4@gmail.com
          </a>
          .
        </p>
      </main>

      <SiteFooter />
    </>
  );
}