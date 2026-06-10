"use client";

import { useEffect, useRef } from "react";
import SegmentedControl from "@/components/ui/SegmentedControl";

const DEVICE_OPTIONS = [
  { label: "Mobile 375", value: "375" },
  { label: "Tablet 768", value: "768" },
  { label: "Desktop 1280", value: "1280" },
];

interface DeviceFrameProps {
  html: string;
  deviceWidth: string;
  onDeviceChange: (width: string) => void;
  className?: string;
  highlightSelector?: string | null;
}

export default function DeviceFrame({
  html,
  deviceWidth,
  onDeviceChange,
  className = "",
  highlightSelector,
}: DeviceFrameProps) {
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

  useEffect(() => {
    if (!highlightSelector || !iframeRef.current?.contentDocument) return;
    const doc = iframeRef.current.contentDocument;

    // Remove previous highlights
    doc.querySelectorAll("[data-goon-highlight]").forEach((el) => el.remove());

    const el = doc.querySelector(highlightSelector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const overlay = doc.createElement("div");
    overlay.setAttribute("data-goon-highlight", "true");
    overlay.style.cssText = `
      position: absolute;
      left: ${rect.left + (doc.defaultView?.scrollX || 0)}px;
      top: ${rect.top + (doc.defaultView?.scrollY || 0)}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #5B5BFF;
      border-radius: 4px;
      pointer-events: none;
      animation: goon-pulse 1.5s ease-in-out infinite;
      z-index: 99999;
    `;

    // Inject animation keyframes if not present
    if (!doc.querySelector("#goon-highlight-style")) {
      const style = doc.createElement("style");
      style.id = "goon-highlight-style";
      style.textContent = `
        @keyframes goon-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(91, 91, 255, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(91, 91, 255, 0); }
        }
      `;
      doc.head.appendChild(style);
    }

    doc.body.style.position = "relative";
    doc.body.appendChild(overlay);

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      overlay.remove();
    };
  }, [highlightSelector]);

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
