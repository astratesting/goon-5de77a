"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email or password is incorrect.");
        return;
      }

      router.push(returnTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <Link href="/" className="text-base font-medium text-text-dim tracking-tight">
              goon
            </Link>
            <h1 className="text-2xl font-semibold text-text mt-6 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-text-dim mt-1">
              Sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="text-sm text-red">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-text-dim text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${returnTo !== "/dashboard" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="text-indigo hover:brightness-110"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-ink-2 border-l border-border items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="w-full h-80 bg-ink-3 rounded-card border border-border flex items-center justify-center mb-4">
            <span className="text-text-faint text-sm">Example landing page</span>
          </div>
          <p className="text-xs text-text-faint">example preview</p>
        </div>
      </div>
    </div>
  );
}
