"use client";

export default function PrintButton({ label = "Print Invoice / Packing Slip" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-outline"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
    >
      <span>🖨️</span>
      <span>{label}</span>
    </button>
  );
}
