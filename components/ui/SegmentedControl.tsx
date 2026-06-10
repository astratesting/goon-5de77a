"use client";

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="inline-flex bg-ink-2 border border-border rounded-input p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-mono rounded-[4px] transition-all duration-120 ${
            value === opt.value
              ? "bg-ink-3 text-text"
              : "text-text-faint hover:text-text-dim"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
