export function Spinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div
      className={`border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin ${className}`}
    />
  );
}
