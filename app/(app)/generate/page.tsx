"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PromptInput from "@/components/PromptInput";
import GenerationProgress from "@/components/GenerationProgress";
import PreviewFrame from "@/components/PreviewFrame";
import { showToast } from "@/components/ui/Toast";

const EXAMPLE_CHIPS = [
  "Waitlist for a coffee subscription",
  "Notion template for hiring",
  "Personal site for a watercolorist",
];

export default function GeneratePage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [deviceWidth, setDeviceWidth] = useState("375");

  const handleGenerate = async (prompt: string) => {
    setGenerating(true);
    setGeneratedHtml("");

    try {
      // Create page
      const createRes = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        if (createRes.status === 401) {
          router.push(`/signin?returnTo=/generate`);
          return;
        }
        showToast({ type: "error", message: data.error || "Failed to create page" });
        setGenerating(false);
        return;
      }

      const { id } = await createRes.json();

      // Trigger generation
      const genRes = await fetch(`/api/pages/${id}/generate`, {
        method: "POST",
      });

      if (!genRes.ok) {
        const data = await genRes.json();
        showToast({ type: "error", message: data.error || "Generation failed" });
        setGenerating(false);
        return;
      }

      const result = await genRes.json();
      setGeneratedHtml(result.html);
      setGenerating(false);

      // Navigate to editor
      router.push(`/p/${id}`);
    } catch {
      showToast({ type: "error", message: "Something went wrong. Try again." });
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex">
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!generatedHtml && !generating && (
            <div className="w-full max-w-[720px] space-y-6 page-enter">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-semibold text-text tracking-tighter leading-display">
                  Type a sentence. Get a landing page.
                </h1>
                <p className="text-lg text-text-dim max-w-[520px] mx-auto">
                  Goon writes the copy, picks the layout, and checks it on a phone. You ship.
                </p>
              </div>

              <PromptInput onSubmit={handleGenerate} />

              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleGenerate(chip)}
                    className="px-3 py-1.5 bg-ink-2 border border-border rounded-input text-sm text-text-dim hover:text-text hover:border-text-faint transition-all duration-120"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-6 text-xs text-text-faint">
                <span>Average generation: 18s</span>
                <span>Tested on 4 viewports</span>
                <span>Free to try, no card required</span>
              </div>
            </div>
          )}

          {generating && (
            <div className="w-full max-w-[720px] space-y-4 page-enter">
              <GenerationProgress active={generating} />
            </div>
          )}
        </div>

        {/* Preview area (post-generation) */}
        {generatedHtml && (
          <div className="flex-1 border-l border-border p-4">
            <PreviewFrame
              html={generatedHtml}
              deviceWidth={deviceWidth}
              onDeviceChange={setDeviceWidth}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
