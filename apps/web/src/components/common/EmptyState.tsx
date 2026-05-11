type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--brand-200)] bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-[var(--neutral-900)]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[var(--neutral-600)]">{description}</p> : null}
    </div>
  );
}

