"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPKR } from "@/lib/format";
import styles from "./bulkEditor.module.css";
import dashStyles from "@/app/(admin)/admin/(dashboard)/dashboard.module.css";

type BulkReq = {
  id: string;
  referenceNo: string;
  quantity: number;
  unit: string;
  customerName: string;
  phone: string;
  city: string;
  deliveryDate: string | Date;
  notes: string | null;
  status: string;
  quotedPrice: number | null;
  adminNote: string | null;
  createdAt: string | Date;
  product: {
    id: string;
    name: string;
    unitPrice: number | null;
    origin: string | null;
  };
};

export default function BulkRequestEditor({ request }: { request: BulkReq }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [quotedPrice, setQuotedPrice] = useState<string>(
    request.quotedPrice ? String(request.quotedPrice) : ""
  );
  const [adminNote, setAdminNote] = useState<string>(request.adminNote || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanPhone = request.phone.replace(/[^\d]/g, "");
  const dateFormatted = new Date(request.deliveryDate).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const quoteText = quotedPrice ? `PKR ${quotedPrice}` : "[quoted price]";
  const waMessage = `Hello ${request.customerName}! This is Tirich regarding your bulk request ${request.referenceNo} for ${request.quantity} KG of fresh ${request.product.name} to ${request.city}. We can supply this harvest at ${quoteText}. Would you like us to confirm and pack your crates?`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bulk-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          quotedPrice: quotedPrice ? Number(quotedPrice) : null,
          adminNote: adminNote || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update bulk request.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error saving quote.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.refInfo}>
          <span className={dashStyles.refCode}>{request.referenceNo}</span>
          <span className={`${dashStyles.statusBadge} ${dashStyles[`status${status}`]}`}>
            {status}
          </span>
        </div>
        <div className={styles.actions}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waBtn}
            title="Chat quote with customer on WhatsApp"
          >
            <span>💬</span> WhatsApp Quote
          </a>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
          >
            {isEditing ? "Close" : "Edit / Record Quote ✏️"}
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* Left: Request details */}
        <div className={styles.detailCol}>
          <h3 className={styles.fruitHeading}>
            {request.product.name} —{" "}
            <span style={{ color: "var(--color-lime)" }}>
              {request.quantity} KG
            </span>
          </h3>
          <ul className={styles.factsList}>
            <li>
              <strong>Customer:</strong> {request.customerName} ({request.phone})
            </li>
            <li>
              <strong>City:</strong> {request.city}
            </li>
            <li>
              <strong>Target Delivery Date:</strong> {dateFormatted}
            </li>
            {request.product.unitPrice && (
              <li>
                <strong>Catalog Price Guide:</strong> ~{formatPKR(request.product.unitPrice)}/kg
              </li>
            )}
            {request.notes && (
              <li style={{ color: "#fbbf24" }}>
                <strong>Customer Notes:</strong> &ldquo;{request.notes}&rdquo;
              </li>
            )}
          </ul>
        </div>

        {/* Right: Quote & Admin Notes summary */}
        <div className={styles.quoteCol}>
          <div className={styles.quoteBox}>
            <span className={styles.quoteLabel}>Locked Quoted Rate</span>
            <strong className={styles.quoteValue}>
              {request.quotedPrice ? formatPKR(request.quotedPrice) : "Not Quoted Yet"}
            </strong>
            {request.adminNote && (
              <p className={styles.adminNote}>
                <strong>Internal Note:</strong> {request.adminNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <form onSubmit={handleSave} className={styles.editForm}>
          {error && <div className={styles.alertError}>{error}</div>}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.select}
              >
                <option value="NEW">NEW (Unanswered)</option>
                <option value="QUOTED">QUOTED (Price sent to customer)</option>
                <option value="CONFIRMED">CONFIRMED (Customer approved, ready to pack)</option>
                <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quoted Total / Rate (PKR)</label>
              <input
                type="number"
                placeholder="e.g. 7500"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Internal Admin Note</label>
            <textarea
              rows={2}
              placeholder="e.g. Agreed Rs 400/kg with customer via call. Packing on Sunday morning."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-lime"
              style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}
            >
              {loading ? "Saving..." : "Save Quote & Update Status"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-outline"
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
