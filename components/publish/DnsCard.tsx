"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  expected: string;
}

interface DnsCheckResult {
  record: string;
  expected: string;
  actual: string[];
  ok: boolean;
}

interface DnsCardProps {
  host: string;
  records: DnsRecord[];
  onVerify: () => Promise<DnsCheckResult[]>;
}

export default function DnsCard({ host, records, onVerify }: DnsCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<DnsCheckResult[] | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await onVerify();
      setResults(res);
    } catch {
      setResults(null);
    } finally {
      setVerifying(false);
    }
  };

  const allVerified = results?.every((r) => r.ok) ?? false;

  return (
    <div className="bg-ink-2 border border-border rounded-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-text">DNS Records for {host}</h3>
        <p className="text-xs text-text-faint mt-1">
          Add these records to your domain&apos;s DNS settings, then click Verify.
        </p>
      </div>

      <div className="divide-y divide-border">
        {records.map((record, idx) => {
          const result = results?.find((r) => r.record === `${record.type} ${record.name}`);
          return (
            <div key={idx} className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-text-faint">
                  {record.type}
                </span>
                {result && (
                  <span className={`text-xs ${result.ok ? "text-teal" : "text-red"}`}>
                    {result.ok ? "Verified" : "Not found"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-text truncate">{record.name}</p>
                  <p className="text-sm font-mono text-cyan truncate">{record.value}</p>
                </div>
                <button
                  onClick={() => handleCopy(record.value, idx)}
                  className="shrink-0 p-1.5 text-text-faint hover:text-text transition-colors"
                  title="Copy value"
                >
                  {copiedIdx === idx ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
                </button>
              </div>
              {result && !result.ok && result.actual.length > 0 && (
                <p className="text-xs text-amber">
                  Found: {result.actual.join(", ")} (expected: {result.expected})
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-border bg-ink-3">
        <Button
          onClick={handleVerify}
          loading={verifying}
          variant={allVerified ? "ghost" : "primary"}
          size="sm"
          className="w-full"
        >
          {verifying ? "Verifying..." : allVerified ? "All Verified" : "Verify DNS"}
        </Button>
      </div>
    </div>
  );
}
