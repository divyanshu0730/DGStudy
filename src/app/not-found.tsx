import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <div className="text-5xl">🧭</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link href="/" className="btn-primary mt-6">Back to home</Link>
      </main>
      <SiteFooter />
    </>
  );
}
