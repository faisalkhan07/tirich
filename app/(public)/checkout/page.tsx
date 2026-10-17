"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import styles from "./checkout.module.css";

const FLAT_DELIVERY_FEE = 500;
const FREE_DELIVERY_THRESHOLD = 5000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemsCount, subtotal, clearCart, isHydrated } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="container" style={{ paddingBlock: "var(--space-12)", textAlign: "center" }}>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingBlock: "var(--space-12)" }}>
        <div className={styles.emptyBox}>
          <h2>Your cart is empty</h2>
          <p>You need at least one jar in your cart to proceed with checkout.</p>
          <Link href="/jams" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }}>
            Browse jams
          </Link>
        </div>
      </div>
    );
  }

  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : FLAT_DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          address,
          city,
          notes: notes || undefined,
          honeypot,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      // Order created successfully! Clear cart & navigate to confirmation
      clearCart();
      router.push(`/order/${data.referenceNo}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className="page-title">Guest Checkout</h1>
      <p className="page-lead">
        No account required. Enter your delivery address below and pay with Cash on Delivery.
      </p>

      {error && (
        <div className={styles.alertError} role="alert">
          <strong>⚠️ {error}</strong>
        </div>
      )}

      <div className={styles.checkoutLayout}>
        {/* Form Column */}
        <div className={styles.formColumn}>
          <form onSubmit={handleSubmit} className={styles.formCard}>
            <h2 className={styles.sectionHeading}>1. Delivery Information</h2>

            {/* Honeypot field for spam prevention (invisible to real users) */}
            <input
              type="text"
              name="company_name"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className={styles.honeypot}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className={styles.formGroup}>
              <label htmlFor="customerName" className={styles.label}>
                Full Name <span className={styles.req}>*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ali Khan"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Mobile Number <span className={styles.req}>*</span>
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
                Used by the courier rider to coordinate your delivery.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>
                Complete Delivery Address <span className={styles.req}>*</span>
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Apartment #, Street, Sector / Area, Landmark"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                City <span className={styles.req}>*</span>
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Islamabad, Lahore, Karachi, Peshawar"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Delivery Notes (Optional)
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please deliver between 2pm - 6pm"
                className={styles.input}
              />
            </div>

            <h2 className={styles.sectionHeading} style={{ marginTop: "var(--space-6)" }}>
              2. Payment Method
            </h2>

            <div className={styles.paymentBox}>
              <div className={styles.paymentRadio}>
                <span className={styles.checkMark}>✓</span>
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay with cash directly to the courier when your order arrives at your doorstep.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              {loading ? "Placing your order..." : `Confirm Order — ${formatPKR(total)}`}
            </button>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <aside className={styles.reviewColumn}>
          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <h2 className={styles.reviewTitle}>Your Order</h2>
              <Link href="/cart" className={styles.editCartLink}>
                Edit cart
              </Link>
            </div>

            <div className={styles.miniItemsList}>
              {items.map((item) => (
                <div key={item.variantId} className={styles.miniItem}>
                  <div className={styles.miniMedia}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className={styles.miniImg}
                      />
                    ) : (
                      <span>🍯</span>
                    )}
                  </div>
                  <div className={styles.miniDetails}>
                    <strong className={styles.miniName}>{item.name}</strong>
                    <span className={styles.miniMeta}>
                      Size: {item.label} × {item.quantity}
                    </span>
                  </div>
                  <span className={styles.miniPrice}>
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.calcLine}>
              <span>Subtotal ({itemsCount} {itemsCount === 1 ? "jar" : "jars"})</span>
              <strong>{formatPKR(subtotal)}</strong>
            </div>

            <div className={styles.calcLine}>
              <span>Delivery Fee</span>
              {isFreeDelivery ? (
                <span className={styles.freeBadge}>FREE</span>
              ) : (
                <strong>{formatPKR(deliveryFee)}</strong>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.calcTotal}>
              <span>Total Payable</span>
              <strong>{formatPKR(total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
