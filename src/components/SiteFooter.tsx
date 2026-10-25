
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Image
            src="/dgstudy-logo.jpeg"
            alt="DGStudy logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-brand-800">DGStudy</span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Study Smart. Prepare Better.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <div className="mb-2 font-semibold text-slate-700">
              Quick Links
            </div>
            <ul className="space-y-1 text-slate-500">
              <li><Link href="/" className="hover:text-brand-700">Home</Link></li>
              <li><Link href="/branches" className="hover:text-brand-700">Branches</Link></li>
              <li><Link href="/search" className="hover:text-brand-700">Search</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-2 font-semibold text-slate-700">
              Account
            </div>
            <ul className="space-y-1 text-slate-500">
              <li><Link href="/login" className="hover:text-brand-700">Login</Link></li>
              <li><Link href="/signup" className="hover:text-brand-700">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-700">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-2 font-semibold text-slate-700">
              About
            </div>
            <ul className="space-y-1 text-slate-500">
              <li><Link href="/about" className="hover:text-brand-700">About DGStudy</Link></li>
              <li><Link href="/contact" className="hover:text-brand-700">Support / Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-2 font-semibold text-slate-700">
              Legal
            </div>
            <ul className="space-y-1 text-slate-500">
              <li><Link href="/privacy-policy" className="hover:text-brand-700">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-700">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} DGStudy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
