"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
  disabled?: boolean;
  initialValue?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function PromptInput({
  onSubmit,
  loading = false,
  disabled = false,
  initialValue = "",
  placeholder = "A newsletter for indie founders about pricing. Signup CTA. Indigo + white.",
  compact = false,
}: PromptInputProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = compact ? 120 : 200;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [compact]);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading || disabled) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`relative bg-ink-2 border border-border rounded-card overflow-hidden transition-all duration-120 focus-within:border-indigo ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={`w-full bg-transparent font-mono text-text placeholder:text-text-faint outline-none resize-none ${
          compact ? "text-sm min-h-[40px]" : "text-base min-h-[56px]"
        }`}
        rows={1}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-mono text-text-faint tabular-nums">
          {value.length}/2000
        </span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading || disabled}
          className="inline-flex items-center gap-1.5 h-8 px-3 bg-indigo text-white text-sm font-medium rounded-input hover:brightness-110 disabled:opacity-40 transition-all duration-120"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
