"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

type Props = {
  initialSettings: {
    whatsappNumber: string;
    ownerEmail: string;
    deliveryFee: string;
    freeDeliveryThreshold: string;
    deliveryNote: string;
  };
};

export default function SettingsForm({ initialSettings }: Props) {
  const router = useRouter();

  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings.whatsappNumber || "923436818227"
  );
  const [ownerEmail, setOwnerEmail] = useState(
    initialSettings.ownerEmail || "hamadsultan662@gmail.com"
  );
  const [deliveryFee, setDeliveryFee] = useState(
    initialSettings.deliveryFee || "500"
  );
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    initialSettings.freeDeliveryThreshold || "5000"
  );
  const [deliveryNote, setDeliveryNote] = useState(
    initialSettings.deliveryNote || ""
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber,
          ownerEmail,
          deliveryFee,
          freeDeliveryThreshold,
          deliveryNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSuccess("Settings updated successfully!");
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error saving settings.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {success && <div className={styles.alertSuccess}>✓ {success}</div>}
      {error && <div className={styles.alertError}>⚠️ {error}</div>}

      <div className={styles.sectionBlock}>
        <h3 className={styles.sectionTitle}>1. WhatsApp Contact & Order Notifications</h3>
        <p className={styles.sectionDesc}>
          This is the phone number customers will reach when clicking WhatsApp confirmation buttons across the store.
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="wa" className={styles.label}>
            Store WhatsApp Number (Format: 923XXXXXXXXX)
          </label>
          <input
            id="wa"
            type="text"
            required
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className={styles.input}
            placeholder="923436818227"
          />
          <span className={styles.hint}>
            Country code + mobile number without plus (+) or dashes. Example: 923436818227.
          </span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Owner Alert Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className={styles.input}
            placeholder="hamadsultan662@gmail.com"
          />
          <span className={styles.hint}>
            Email address for new order notification alerts.
          </span>
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <h3 className={styles.sectionTitle}>2. Jam Delivery Fee & Free Delivery Threshold</h3>
        <p className={styles.sectionDesc}>
          Standard Cash on Delivery shipping fees applied during checkout.
        </p>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="fee" className={styles.label}>
              Flat Delivery Fee (PKR)
            </label>
            <input
              id="fee"
              type="number"
              required
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className={styles.input}
              placeholder="500"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="freeThresh" className={styles.label}>
              Free Delivery Order Threshold (PKR)
            </label>
            <input
              id="freeThresh"
              type="number"
              required
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              className={styles.input}
              placeholder="5000"
            />
          </div>
        </div>
        <span className={styles.hint}>
          Orders equal to or greater than Rs {freeDeliveryThreshold} get free delivery across Pakistan.
        </span>
      </div>

      <div className={styles.sectionBlock}>
        <h3 className={styles.sectionTitle}>3. Checkout Delivery Notice</h3>
        <div className={styles.formGroup}>
          <label htmlFor="note" className={styles.label}>
            Storefront Delivery Policy Notice
          </label>
          <textarea
            id="note"
            rows={2}
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            className={styles.textarea}
          />
        </div>
      </div>

      <div className={styles.submitRow}>
        <button type="submit" disabled={loading} className="btn btn-lime">
          {loading ? "Saving Settings..." : "Save Store Settings →"}
        </button>
      </div>
    </form>
  );
}
