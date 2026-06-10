"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, Share2 } from "lucide-react";

interface SuccessCardProps {
  url: string;
  onOpen?: () => void;
}

export default function SuccessCard({ url, onOpen }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-ink-2 border border-teal/20 rounded-card p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center mx-auto">
        <Check size={24} className="text-teal" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text">Published</h3>
        <p className="text-sm text-text-dim mt-1">Your page is live at:</p>
      </div>
      <div className="bg-ink border border-border rounded-input p-3 font-mono text-sm text-cyan break-all">
        {url}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-3 border border-border rounded-input text-sm text-text hover:border-text-faint transition-colors duration-120"
        >
          {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy URL"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-3 border border-border rounded-input text-sm text-text hover:border-text-faint transition-colors duration-120"
        >
          <ExternalLink size={14} />
          Open
        </a>
      </div>
    </div>
  );
}
