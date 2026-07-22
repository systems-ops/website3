export function PhotoPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`grain relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-black/90 via-black/70 to-black/90 ${className}`}
    >
      <span className="px-4 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
    </div>
  );
}
