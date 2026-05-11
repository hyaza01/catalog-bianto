type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
      {message}
    </div>
  );
}

