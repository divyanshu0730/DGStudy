
"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn-primary w-full"
      disabled={pending}
    >
      {pending ? "Logging in…" : "Log in"}
    </button>
  );
}

function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Log in to continue studying.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="input"
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-700">
          Create an account
        </Link>
      </p>

      <p className="mt-2 text-center text-xs text-slate-400">
        <Link href="/admin/login">Admin login</Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-6">
          Loading login...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
