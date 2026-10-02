import { SpinnerIcon } from "./icons";

// Shown in place of a tab's content while its data is still loading — a
// tab switch with nothing in its place reads as broken, and reusing the
// same "nothing here" empty-state copy a real empty list uses is actively
// misleading (it tells a cook there's nothing to do when the app just
// hasn't heard back yet).
export default function LoadingScreen({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 320, color: "var(--color-accent)" }}>
      <SpinnerIcon size={30} />
      {label && <span style={{ fontSize: 14, color: "var(--color-muted)" }}>{label}</span>}
    </div>
  );
}
