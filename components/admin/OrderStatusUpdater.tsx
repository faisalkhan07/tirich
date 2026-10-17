"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./orderDetail.module.css";

type Props = {
  orderId: string;
  initialStatus: string;
};

export default function OrderStatusUpdater({ orderId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statuses = [
    { value: "NEW", label: "New (Unprocessed)" },
    { value: "CONFIRMED", label: "Confirmed (Packing)" },
    { value: "DISPATCHED", label: "Dispatched (In Transit)" },
    { value: "DELIVERED", label: "Delivered (COD Paid)" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  async function handleUpdate(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setStatus(newStatus);
      setSuccess(`Order status updated to ${newStatus}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update status.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.statusBox}>
      <h3 className={styles.boxTitle}>Update Order Status</h3>
      <p className={styles.boxDesc}>Select current fulfillment state for this Cash on Delivery order:</p>

      {success && <div className={styles.alertSuccess}>✓ {success}</div>}
      {error && <div className={styles.alertError}>⚠️ {error}</div>}

      <div className={styles.btnRow}>
        {statuses.map((s) => {
          const isCurrent = s.value === status;
          return (
            <button
              key={s.value}
              type="button"
              disabled={loading}
              onClick={() => handleUpdate(s.value)}
              className={`${styles.statusOptionBtn} ${
                isCurrent ? styles.activeStatusOption : ""
              }`}
            >
              {s.label} {isCurrent && "✓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
