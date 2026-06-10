"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PromptInput from "@/components/PromptInput";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    try {
      // Try to create page — if unauthorized, redirect to signup
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.status === 401) {
        router.push(
          `/signup?returnTo=/generate&prompt=${encodeURIComponent(prompt)}`
        );
        return;
      }

      if (res.ok) {
        const { id } = await res.json();
        router.push(`/p/${id}`);
        return;
      }

      // For any other error, just go to generate
      router.push(`/generate`);
    } catch {
      router.push(`/generate`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[720px] space-y-8 page-enter">
        {/* Wordmark */}
        <div className="text-center">
          <span className="text-base font-medium text-text-dim tracking-tight">
            goon
          </span>
        </div>

        {/* Headline */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold text-text tracking-tighter leading-display">
            Type a sentence. Get a landing page.
          </h1>
          <p className="text-lg text-text-dim max-w-[520px] mx-auto">
            Goon writes the copy, picks the layout, and checks it on a phone.
            You ship.
          </p>
        </div>

        {/* Prompt input */}
        <PromptInput
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="A newsletter for indie founders about pricing. Signup CTA. Indigo + white."
        />

        {/* Hints */}
        <div className="flex justify-center gap-6 text-xs text-text-faint">
          <span>Average generation: 18s</span>
          <span>Tested on 4 viewports</span>
          <span>Free to try, no card required</span>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-text-faint pt-8">
          Built by the Goon team
        </footer>
      </div>
    </main>
  );
}
