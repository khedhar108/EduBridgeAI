import type { CSSProperties } from "react";

// Soft drifting color clouds. Colors are token-derived via color-mix so the
// mesh stays on-brand (slate-blue / teal) and light-only, per MASTER.md.
// The four blobs animate via .mesh-blob-* in app/globals.css.

export function MeshGradient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <span
        className="mesh-blob mesh-blob-1 -top-24 -left-24 size-96"
        style={
          {
            backgroundColor: "var(--accent)",
          } as CSSProperties
        }
      />
      <span
        className="mesh-blob mesh-blob-2 top-1/3 -right-28 size-[26rem]"
        style={
          {
            backgroundColor: "var(--primary)",
            opacity: 0.28,
          } as CSSProperties
        }
      />
      <span
        className="mesh-blob mesh-blob-3 -bottom-28 left-1/4 size-[22rem]"
        style={
          {
            backgroundColor: "var(--ring)",
            opacity: 0.2,
          } as CSSProperties
        }
      />
      <span
        className="mesh-blob mesh-blob-4 bottom-10 right-1/4 size-72"
        style={
          {
            backgroundColor: "var(--chart-2)",
            opacity: 0.18,
          } as CSSProperties
        }
      />
    </div>
  );
}
