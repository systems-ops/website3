export function TrattoriaBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <path id="tb-top" d="M 22,100 a 78,78 0 0 1 156,0" />
        <path id="tb-bottom" d="M 22,100 a 78,78 0 0 0 156,0" />
      </defs>

      <circle cx="100" cy="100" r="94" fill="var(--color-cream)" stroke="var(--color-terracotta)" strokeWidth="2" />
      <circle cx="100" cy="100" r="84" fill="none" stroke="var(--color-gold)" strokeWidth="1" strokeDasharray="1 5" />

      {/* laurel-ish leaves */}
      <g stroke="var(--color-olive)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M30 100c8-10 8-24 0-34" />
        <path d="M28 92c6-4 14-4 18 2" />
        <path d="M28 108c6 4 14 4 18-2" />
        <path d="M170 100c-8-10-8-24 0-34" />
        <path d="M172 92c-6-4-14-4-18 2" />
        <path d="M172 108c-6 4-14 4-18-2" />
      </g>

      <text fontSize="11" fontWeight="700" letterSpacing="3" fill="var(--color-terracotta)">
        <textPath href="#tb-top" startOffset="50%" textAnchor="middle">
          A CORNER OF ITALY
        </textPath>
      </text>
      <text fontSize="11" fontWeight="700" letterSpacing="3" fill="var(--color-terracotta)">
        <textPath href="#tb-bottom" startOffset="50%" textAnchor="middle">
          BERKELEY · CALIFORNIA
        </textPath>
      </text>

      <text
        x="100"
        y="92"
        textAnchor="middle"
        fontSize="22"
        fontStyle="italic"
        fontFamily="var(--font-display)"
        fill="var(--color-espresso)"
      >
        Passione
      </text>
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontSize="22"
        fontStyle="italic"
        fontFamily="var(--font-display)"
        fill="var(--color-espresso)"
      >
        Emporio
      </text>
      <line x1="72" y1="127" x2="128" y2="127" stroke="var(--color-gold)" strokeWidth="1.5" />
    </svg>
  );
}
