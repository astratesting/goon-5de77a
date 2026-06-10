interface StatusPillProps {
  status: string;
}

export default function StatusPill({ status }: StatusPillProps) {
  const styles: Record<string, string> = {
    draft: "bg-ink-3 text-text-dim border-border",
    generating: "bg-indigo/10 text-indigo border-indigo/20",
    published: "bg-teal/10 text-teal border-teal/20",
    error: "bg-red/10 text-red border-red/20",
  };

  const labels: Record<string, string> = {
    draft: "Draft",
    generating: "Generating",
    published: "Published",
    error: "Error",
  };

  const s = styles[status] || styles.draft;
  const label = labels[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${s}`}
    >
      {label}
    </span>
  );
}
