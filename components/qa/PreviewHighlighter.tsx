"use client";

interface PreviewHighlighterProps {
  selector: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export default function PreviewHighlighter({ selector, iframeRef }: PreviewHighlighterProps) {
  if (!selector) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <div
        className="absolute border-2 border-indigo rounded animate-pulse"
        style={{
          animation: "pulse-border 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
