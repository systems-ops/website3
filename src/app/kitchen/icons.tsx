import type { ReactNode } from "react";

// A small inline-SVG icon set, consistent stroke weight/caps throughout —
// same approach as the existing StatusIcon in status-visuals.tsx (no icon
// library dependency). Every icon takes `size` and inherits color from the
// text color around it (stroke="currentColor"), so it always matches
// whatever state color a label already has (muted, accent, alert, ...).
type IconProps = { size?: number };

function base(size: number, children: ReactNode) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function TodayIcon({ size = 20 }: IconProps) {
  return base(
    size,
    <>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
      <path d="M8.5 13.5l2 2 4.5-4.5" />
    </>
  );
}

export function SideworkIcon({ size = 20 }: IconProps) {
  return base(
    size,
    <>
      <path d="M6 20l4.5-11" />
      <path d="M5 20h8" />
      <path d="M10.5 9c2-1 3.8-3.2 4.2-5.4-2 .6-3.8 2.3-4.2 5.4z" />
      <path d="M17 11.5l2.5 2.5-3 3-2.5-2.5z" />
    </>
  );
}

export function ProductsIcon({ size = 20 }: IconProps) {
  return base(
    size,
    <>
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </>
  );
}

export function TrainingIcon({ size = 20 }: IconProps) {
  return base(
    size,
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
      <path d="M19 18H6.5A2.5 2.5 0 0 0 4 20.5" />
      <path d="M8 7.5h7M8 10.5h7" />
    </>
  );
}

export function BatchesIcon({ size = 20 }: IconProps) {
  return base(
    size,
    <>
      <rect x="4" y="9.5" width="16" height="4.5" rx="1" />
      <rect x="4" y="15.5" width="16" height="4.5" rx="1" />
      <rect x="4" y="3.5" width="16" height="4.5" rx="1" />
    </>
  );
}

export function RecordsIcon({ size = 20 }: IconProps) {
  return base(
    size,
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>
  );
}

export function TempsIcon({ size = 22 }: IconProps) {
  return base(
    size,
    <>
      <path d="M12 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0z" />
      <path d="M10 8h1.5" />
    </>
  );
}

export function ChecklistIcon({ size = 22 }: IconProps) {
  return base(
    size,
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 2.5h6v2H9z" />
      <path d="M8 10.5l1.6 1.6L12.5 9" />
      <path d="M8 16h8" />
    </>
  );
}

export function CalibrationIcon({ size = 22 }: IconProps) {
  return base(
    size,
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13l3-3" />
      <path d="M9 3.5h6" />
    </>
  );
}

export function TruckIcon({ size = 22 }: IconProps) {
  return base(
    size,
    <>
      <path d="M3 7h10v9H3z" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  );
}

export function LocationIcon({ size = 18 }: IconProps) {
  return base(
    size,
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  );
}

export function ChevronRightIcon({ size = 16 }: IconProps) {
  return base(size, <path d="M9 5l6 7-6 7" />);
}
