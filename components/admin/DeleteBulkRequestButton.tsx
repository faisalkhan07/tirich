"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: string;
  referenceNo: string;
  redirectAfterDelete?: boolean;
};

export default function DeleteBulkRequestButton({
  requestId,
  referenceNo,
  redirectAfterDelete = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete bulk quote request ${referenceNo}?\n\nThis will permanently remove it from your system.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bulk-requests/${requestId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete request");
      }

      if (redirectAfterDelete) {
        router.push("/admin/requests");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting request.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title={`Delete request ${referenceNo}`}
      style={{
        background: "rgba(239, 68, 68, 0.12)",
        color: "#ef4444",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        padding: "0.35rem 0.65rem",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "#ef4444";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
          e.currentTarget.style.color = "#ef4444";
        }
      }}
    >
      🗑️ {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
