"use client";

import { useEffect, useRef } from "react";
import SegmentedControl from "./ui/SegmentedControl";

const DEVICE_OPTIONS = [
  { label: "Mobile 375", value: "375" },
  { label: "Mobile 414", value: "414" },
  { label: "Tablet 768", value: "768" },
  { label: "Desktop 1280", value: "1280" },
];

interface PreviewFrameProps {
  html: string;
  deviceWidth: string;
  onDeviceChange: (width: string) => void;
  className?: string;
}

export default function PreviewFrame({
  html,
  deviceWidth,
  onDeviceChange,
  className = "",
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  const frameWidth = parseInt(deviceWidth, 10);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <SegmentedControl
          options={DEVICE_OPTIONS}
          value={deviceWidth}
          onChange={onDeviceChange}
        />
        <span className="text-xs font-mono text-text-faint">
          {deviceWidth}px
        </span>
      </div>
      <div className="flex-1 flex justify-center overflow-auto bg-ink rounded-card border border-border p-4">
        <div
          className="bg-white rounded transition-all duration-200 ease-in-out overflow-hidden shadow-lg"
          style={{
            width: `${frameWidth}px`,
            maxWidth: "100%",
            height: "100%",
            minHeight: "600px",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Page preview"
            className="w-full h-full border-0"
            style={{ minHeight: "600px" }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
