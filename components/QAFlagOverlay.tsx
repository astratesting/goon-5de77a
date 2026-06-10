"use client";

interface QAFlagOverlayProps {
  label: string;
  position: { top: number; left: number; width: number; height: number };
  onDismiss: () => void;
}

export default function QAFlagOverlay({
  label,
  position,
  onDismiss,
}: QAFlagOverlayProps) {
  return (
    <div
      className="absolute z-40 pointer-events-auto"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
      }}
    >
      <div className="absolute inset-0 bg-red/20 border-2 border-red/40 rounded" />
      <div className="absolute -top-6 left-0 flex items-center gap-1">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red text-white text-xs font-mono rounded whitespace-nowrap">
          {label}
          <button onClick={onDismiss} className="hover:opacity-70">
            ×
          </button>
        </span>
      </div>
    </div>
  );
}
