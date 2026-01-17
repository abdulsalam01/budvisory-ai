"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const USERNAME_STORAGE_KEY = "budvisory.username";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a name to continue.");
      return;
    }

    window.localStorage.setItem(USERNAME_STORAGE_KEY, trimmed);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900 sm:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Budvisory
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
            Welcome back traveler
          </h1>
          <p className="text-base text-zinc-600">
            Sign in with any name to personalize your Budvisory experience.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Your name
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Rani"
              className="h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
              required
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-red-500">{error}</p>
          ) : (
            <p className="text-xs text-zinc-500">
              Everyone can log in &mdash; just enter any name to continue.
            </p>
          )}
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Continue to Budvisory
          </button>
        </form>
      </div>
    </div>
  );
}
