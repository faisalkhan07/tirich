"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <main className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.brandRow}>
            <svg
              className={styles.brandIcon}
              width="24"
              height="20"
              viewBox="0 0 24 18"
              fill="none"
              aria-hidden="true"
            >
              <path d="M11 2L1 16H23L16 6L12 12L11 2Z" fill="currentColor" fillOpacity="0.8" />
              <path d="M11 2L9 6.5L13 6.5L11 2Z" fill="#ffffff" />
            </svg>
            <span>TIRICH.</span>
          </div>
          <p className={styles.subtitle}>Store Management & Orchard Dispatch Portal</p>
        </div>

        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.group}>
            <label htmlFor="email" className={styles.label}>
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. benekhan07@gmail.com"
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.group}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className={`btn btn-lime ${styles.submitBtn}`}>
            {loading ? "Verifying..." : "Sign In to Admin Portal →"}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
