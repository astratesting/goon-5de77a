"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";

const STEPS = [
  "Analyzing layout…",
  "Checking mobile…",
  "Scoring copy…",
];

interface GenerationProgressProps {
  active: boolean;
}

export default function GenerationProgress({ active }: GenerationProgressProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-ink-2 border border-border rounded-card">
      <Loader size={16} className="text-indigo animate-spin" />
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <span
            key={i}
            className={`text-sm transition-all duration-300 ${
              i < step
                ? "text-teal"
                : i === step
                  ? "text-text"
                  : "text-text-faint"
            }`}
          >
            {label}
            {i < STEPS.length - 1 && (
              <span className="mx-2 text-text-faint">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
