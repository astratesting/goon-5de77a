"use client";

import { useState, useRef } from "react";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ScoreRing from "@/components/qa/ScoreRing";

const DEVICE_OPTIONS = [
  { label: "Mobile", value: "375" },
  { label: "Tablet", value: "768" },
  { label: "Desktop", value: "1280" },
];

interface PreviewPaneProps {
  pageId: string;
  score?: number | null;
  className?: string;
}

export default function PreviewPane({ pageId, score, className = "" }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceWidth, setDeviceWidth] = useState("375");

  const frameWidth = parseInt(deviceWidth, 10);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <SegmentedControl
          options={DEVICE_OPTIONS}
          value={deviceWidth}
          onChange={setDeviceWidth}
        />
        {score !== null && score !== undefined && (
          <ScoreRing score={score} size="sm" />
        )}
      </div>
      <div className="flex-1 flex justify-center overflow-auto bg-ink rounded-card border border-border p-4">
        <div
          className="bg-white rounded transition-all duration-200 overflow-hidden shadow-lg"
          style={{
            width: `${frameWidth}px`,
            maxWidth: "100%",
            height: "100%",
            minHeight: "500px",
          }}
        >
          <iframe
            ref={iframeRef}
            src={`/preview/${pageId}`}
            title="Page preview"
            className="w-full h-full border-0"
            style={{ minHeight: "500px" }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
