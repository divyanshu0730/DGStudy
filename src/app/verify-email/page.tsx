
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        {/* Email Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <span className="text-3xl" aria-hidden="true">
            ✉
          </span>
        </div>

        {/* Page Heading */}
        <h1 className="text-2xl font-bold text-slate-900">
          Verify Your Email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          We've sent a verification link to your email address.
          Please verify your email to activate your DGStudy account.
        </p>

        {/* Instructions */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left">
          <h2 className="font-semibold text-slate-800">
            What should you do next?
          </h2>

          <ol className="mt-3 list-inside list-decimal space-y-3 text-sm leading-6 text-slate-600">
            <li>Open your email inbox.</li>
            <li>Look for the DGStudy account verification email.</li>
            <li>Click the "Confirm email address" link.</li>
            <li>Return to DGStudy and log in to your account.</li>
          </ol>
        </div>

        {/* Spam Folder Reminder */}
        <p className="mt-4 text-sm text-slate-500">
          Didn't receive the email? Check your spam or junk folder.
        </p>

        {/* Login Button */}
        <Link
          href="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Login
        </Link>

        {/* Brand Footer */}
        <p className="mt-5 text-xs text-slate-400">
          DGStudy — Study Smart. Prepare Better.
        </p>
      </section>
    </main>
  );
}
