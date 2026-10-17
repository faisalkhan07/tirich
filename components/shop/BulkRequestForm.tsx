"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/generated/prisma/client";
import { formatPKR } from "@/lib/format";
import styles from "./BulkRequestForm.module.css";

type Props = {
  fruits: Product[];
  initialFruitSlug?: string;
};

export default function BulkRequestForm({ fruits, initialFruitSlug }: Props) {
  const router = useRouter();

  // Find initial fruit or default to first
  const initialFruit = fruits.find((f) => f.slug === initialFruitSlug) || fruits[0];

  const [selectedId, setSelectedId] = useState<string>(initialFruit?.id || "");
  const selectedFruit = fruits.find((f) => f.id === selectedId) || fruits[0];

  const minRequired = selectedFruit?.minQty || 5;
  const [quantity, setQuantity] = useState<number>(minRequired);

  // Delivery date default (2 days from today)
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const minDateStr = defaultDate.toISOString().split("T")[0] || "";
  const [deliveryDate, setDeliveryDate] = useState<string>(minDateStr);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When changing fruit, adjust quantity if below min
  function handleFruitChange(fruitId: string) {
    setSelectedId(fruitId);
    const target = fruits.find((f) => f.id === fruitId);
    if (target && target.minQty && quantity < target.minQty) {
      setQuantity(target.minQty);
    }
  }

  const approxTotal = selectedFruit?.unitPrice ? selectedFruit.unitPrice * quantity : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/bulk-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedId,
          quantity: Number(quantity),
          deliveryDate,
          customerName,
          phone,
          city,
          notes: notes || undefined,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      router.push(`/request/${data.referenceNo}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  }

  if (!fruits.length) {
    return (
      <div className="empty">
        <p>No fruits are currently listed for bulk requests. Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Informative Callout */}
      <div className={styles.callout}>
        <div className={styles.calloutIcon}>💡</div>
        <div className={styles.calloutBody}>
          <strong>How Bulk Fruit Ordering Works:</strong>
          <p>
            Chitral orchard harvests vary daily with morning mountain temperatures. To ensure you receive
            only peak-quality fruit at true fair-market rates, submit your request below. Our owner will
            contact you on WhatsApp or call to quote today&apos;s exact price and coordinate your delivery.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.alertError} role="alert">
          <strong>⚠️ {error}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Left Column: Fruit & Quantity Selection */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>1. Choose Fruit</h2>

            {/* Visual fruit selector */}
            <div className={styles.fruitPicker}>
              {fruits.map((fruit) => {
                const isSelected = fruit.id === selectedFruit?.id;
                return (
                  <button
                    key={fruit.id}
                    type="button"
                    onClick={() => handleFruitChange(fruit.id)}
                    className={`${styles.fruitChip} ${isSelected ? styles.activeFruit : ""}`}
                  >
                    <div className={styles.chipMedia}>
                      {fruit.images[0] ? (
                        <Image
                          src={fruit.images[0]}
                          alt={fruit.name}
                          width={48}
                          height={48}
                          className={styles.chipImg}
                        />
                      ) : (
                        <span>🍎</span>
                      )}
                    </div>
                    <div className={styles.chipInfo}>
                      <strong className={styles.chipName}>{fruit.name}</strong>
                      <span className={styles.chipGuide}>
                        {fruit.unitPrice ? `Guide: ${formatPKR(fruit.unitPrice)}/kg` : "Rate on request"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Fruit Details Preview */}
            {selectedFruit && (
              <div className={styles.fruitPreview}>
                <div className={styles.previewHeader}>
                  <div>
                    <h3 className={styles.previewName}>{selectedFruit.name}</h3>
                    <p className={styles.previewDesc}>{selectedFruit.description}</p>
                  </div>
                  {selectedFruit.unitPrice && (
                    <div className={styles.rateGuideBox}>
                      <span className={styles.rateLabel}>Price Guide</span>
                      <strong className={styles.rateValue}>
                        {formatPKR(selectedFruit.unitPrice)} / kg
                      </strong>
                    </div>
                  )}
                </div>

                <ul className={styles.metaList}>
                  {selectedFruit.origin && <li>📍 <strong>Origin:</strong> {selectedFruit.origin}</li>}
                  {selectedFruit.seasonNote && <li>🍂 <strong>Season:</strong> {selectedFruit.seasonNote}</li>}
                  <li>📦 <strong>Minimum Order:</strong> {minRequired} kg</li>
                </ul>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className={styles.qtySection}>
              <label htmlFor="quantity" className={styles.label}>
                Quantity (in KG) <span className={styles.req}>*</span>
              </label>
              <div className={styles.stepperRow}>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(minRequired, q - 5))}
                    className={styles.stepBtn}
                    aria-label="Decrease quantity by 5kg"
                  >
                    −5
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(minRequired, q - 1))}
                    className={styles.stepBtn}
                    aria-label="Decrease quantity by 1kg"
                  >
                    −1
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min={minRequired}
                    max={2000}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(minRequired, Number(e.target.value)))}
                    className={styles.qtyInput}
                  />
                  <span className={styles.unitSuffix}>KG</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className={styles.stepBtn}
                    aria-label="Increase quantity by 1kg"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 5)}
                    className={styles.stepBtn}
                    aria-label="Increase quantity by 5kg"
                  >
                    +5
                  </button>
                </div>
              </div>
              <span className={styles.hint}>
                Minimum order: {minRequired} kg. For commercial orders above 100 kg, please state in notes.
              </span>

              {approxTotal !== null && (
                <div className={styles.approxBox}>
                  <span>Approximate Guide Subtotal:</span>
                  <strong className={styles.approxValue}>{formatPKR(approxTotal)}</strong>
                  <span className={styles.approxNote}>
                    (Guide estimate only; actual price confirmed on order lock)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Details */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>2. Delivery & Contact Details</h2>

            {/* Honeypot field */}
            <input
              type="text"
              name="company_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className={styles.honeypot}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className={styles.formGroup}>
              <label htmlFor="customerName" className={styles.label}>
                Your Full Name <span className={styles.req}>*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                WhatsApp / Mobile Number <span className={styles.req}>*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567 or +92 3XX XXXXXXX"
                className={styles.input}
              />
              <span className={styles.hint}>
                The owner will message or call this number to confirm the quoted price.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                Delivery City <span className={styles.req}>*</span>
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Islamabad, Rawalpindi, Lahore, Peshawar"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="deliveryDate" className={styles.label}>
                Target Delivery Date <span className={styles.req}>*</span>
              </label>
              <input
                id="deliveryDate"
                type="date"
                required
                min={minDateStr}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={styles.input}
              />
              <span className={styles.hint}>
                Orchard fruit is picked to order; allow 1-3 days for transit from Chitral.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Special Requirements or Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ripeness preference, crate packaging requirements, restaurant delivery times..."
                className={styles.textarea}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              {loading ? "Submitting Request..." : "Submit Bulk Order Request →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
