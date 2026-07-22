export function WoodFiredBadge({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <path
          id="badge-circle-top"
          d="M 20,100 a 80,80 0 0 1 160,0"
        />
        <path
          id="badge-circle-bottom"
          d="M 20,100 a 80,80 0 0 0 160,0"
        />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="black" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="black" strokeWidth="1" strokeDasharray="2 4" />
      <text fontSize="12.5" fontWeight="700" letterSpacing="2" fill="black">
        <textPath href="#badge-circle-top" startOffset="50%" textAnchor="middle">
          WOOD FIRED · SINCE
        </textPath>
      </text>
      <text fontSize="12.5" fontWeight="700" letterSpacing="2" fill="black">
        <textPath href="#badge-circle-bottom" startOffset="50%" textAnchor="middle">
          BERKELEY · CALIFORNIA
        </textPath>
      </text>
      <text
        x="100"
        y="94"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fontFamily="var(--font-display)"
        fill="black"
      >
        A CORNER
      </text>
      <text
        x="100"
        y="120"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fontFamily="var(--font-display)"
        fill="black"
      >
        OF ITALY
      </text>
    </svg>
  );
}
