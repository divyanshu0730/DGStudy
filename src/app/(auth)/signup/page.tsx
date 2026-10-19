"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signUpAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUpAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">Join DGStudy to access notes and PDFs.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
          <input name="full_name" className="input" placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" required className="input" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" autoComplete="new-password" />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700">Log in</Link>
      </p>
    </main>
  );
}
