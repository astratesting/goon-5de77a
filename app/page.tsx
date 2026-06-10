"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PromptInput from "@/components/PromptInput";
import { Smartphone, Eye, Rocket } from "lucide-react";

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

        {/* Built-in QA section */}
        <div className="pt-8 space-y-4">
          <p className="text-center text-xs text-text-faint uppercase tracking-widest">
            Built-in QA, before you publish
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-ink-2 border border-border rounded-card p-4 space-y-2 text-center">
              <div className="w-9 h-9 rounded-lg bg-indigo/10 flex items-center justify-center mx-auto">
                <Smartphone size={16} className="text-indigo" />
              </div>
              <p className="text-sm font-medium text-text">Mobile-ready check</p>
              <p className="text-xs text-text-faint">Tap targets, viewport, responsive CSS — scored automatically.</p>
            </div>
            <div className="bg-ink-2 border border-border rounded-card p-4 space-y-2 text-center">
              <div className="w-9 h-9 rounded-lg bg-cyan/10 flex items-center justify-center mx-auto">
                <Eye size={16} className="text-cyan" />
              </div>
              <p className="text-sm font-medium text-text">Live preview</p>
              <p className="text-xs text-text-faint">See exactly what visitors will see at every screen size.</p>
            </div>
            <div className="bg-ink-2 border border-border rounded-card p-4 space-y-2 text-center">
              <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center mx-auto">
                <Rocket size={16} className="text-teal" />
              </div>
              <p className="text-sm font-medium text-text">One-click publish</p>
              <p className="text-xs text-text-faint">Pick a subdomain, preview, publish. No DNS setup required.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-text-faint pt-4 pb-8">
          Built by the Goon team
        </footer>
      </div>
    </main>
  );
}
