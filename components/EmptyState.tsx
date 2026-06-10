interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-text-faint">{icon}</div>}
      <h3 className="text-lg font-medium text-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-dim max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
