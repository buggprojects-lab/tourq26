"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) router.replace("/admin/dashboard");
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--brand-gradient)" }}
        aria-hidden
      />
      <form
        onSubmit={handleSubmit}
        className="card-flat w-full max-w-sm p-8"
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--brand-gradient)" }}
            aria-hidden
          />
          <p className="mono-eyebrow text-muted-foreground">TORQ ADMIN</p>
        </div>
        <h1 className="display-md mt-3 text-foreground">Sign in to continue.</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          Enter the admin password to manage content, SEO, and feature flags.
        </p>
        <label className="mono-label mt-7 block text-muted-foreground" htmlFor="admin-password">
          PASSWORD
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="text-input mt-2"
          autoFocus
          required
        />
        {error ? (
          <p className="mt-3 text-[13px] text-[color:var(--app-destructive)]">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-base btn-primary mt-5 w-full"
        >
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
