"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface SubdomainInputProps {
  value: string;
  onChange: (value: string) => void;
  onStatusChange?: (status: "idle" | "checking" | "available" | "taken" | "invalid", suggestions?: string[]) => void;
  disabled?: boolean;
}

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SubdomainInput({
  value,
  onChange,
  onStatusChange,
  disabled = false,
}: SubdomainInputProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setStatus("idle");
      setError("");
      setSuggestions([]);
      onStatusChange?.("idle");
      return;
    }

    setStatus("checking");
    onStatusChange?.("checking");

    try {
      const res = await fetch(`/api/publish/check-subdomain?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();

      if (!data.valid) {
        setStatus("invalid");
        setError(data.error || "Invalid subdomain");
        setSuggestions(data.suggestions || []);
        onStatusChange?.("invalid", data.suggestions);
      } else if (data.available) {
        setStatus("available");
        setError("");
        setSuggestions([]);
        onStatusChange?.("available");
      } else {
        setStatus("taken");
        setError("This subdomain is taken");
        setSuggestions(data.suggestions || []);
        onStatusChange?.("taken", data.suggestions);
      }
    } catch {
      setStatus("idle");
      setError("Could not check availability");
      onStatusChange?.("idle");
    }
  }, [onStatusChange]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkAvailability(value);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, checkAvailability]);

  const statusConfig = {
    idle: { icon: null, color: "" },
    checking: { icon: Loader2, color: "text-text-faint" },
    available: { icon: CheckCircle, color: "text-teal" },
    taken: { icon: XCircle, color: "text-red" },
    invalid: { icon: XCircle, color: "text-amber" },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="your-name"
            disabled={disabled}
            className="w-full h-10 px-3 bg-ink-2 border border-border rounded-input text-sm text-text placeholder:text-text-faint focus:border-indigo focus:ring-1 focus:ring-indigo/30 transition-all duration-120"
          />
        </div>
        <span className="text-sm text-text-faint shrink-0">.goon.app</span>
        {Icon && (
          <Icon
            size={16}
            className={`${config.color} shrink-0 ${status === "checking" ? "animate-spin" : ""}`}
          />
        )}
      </div>

      {status === "available" && (
        <p className="text-xs text-teal flex items-center gap-1">
          <CheckCircle size={12} /> Available
        </p>
      )}

      {error && status !== "available" && (
        <p className="text-xs text-red flex items-center gap-1">
          <XCircle size={12} /> {error}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-faint">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className="text-xs px-2 py-1 bg-ink-3 border border-border rounded-input text-cyan hover:border-cyan/30 transition-colors duration-120"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && value.length < 3 && (
        <p className="text-xs text-text-faint">Must be at least 3 characters</p>
      )}
    </div>
  );
}
