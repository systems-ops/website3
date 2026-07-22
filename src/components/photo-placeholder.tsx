export function PhotoPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`grain relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-terracotta/20 via-cream-dark to-olive/20 ${className}`}
    >
      <span className="px-4 text-center font-display text-sm italic text-espresso/50">
        {label}
      </span>
    </div>
  );
}
