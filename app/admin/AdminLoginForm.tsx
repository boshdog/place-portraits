"use client";

import { useActionState } from "react";
import { adminLoginAction } from "./actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-sm bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
