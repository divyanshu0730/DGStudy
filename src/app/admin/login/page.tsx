"use client";

import { useFormState, useFormStatus } from "react-dom";
import { adminLoginAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Logging in…" : "Log in as admin"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(adminLoginAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin login</h1>
      <p className="mt-1 text-sm text-slate-600">DGStudy content administration.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>
    </main>
  );
}
