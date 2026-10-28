"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import styles from "./cart.module.css";

// Delivery fee settings default (Rs 500 flat, free above Rs 5,000)
const FLAT_DELIVERY_FEE = 500;
const FREE_DELIVERY_THRESHOLD = 5000;

export default function CartPage() {
  const { items, itemsCount, subtotal, updateQuantity, removeItem, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="container" style={{ paddingBlock: "var(--space-12)", textAlign: "center" }}>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingBlock: "var(--space-12)" }}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🛒</div>
          <h1 className={styles.emptyTitle}>Your cart is empty</h1>
          <p className={styles.emptyText}>
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/jams" className="btn btn-primary">
              Explore fresh jams
            </Link>
            <Link href="/fruits" className="btn btn-outline">
              Explore bulk fruits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : FLAT_DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const amountToFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className="page-title">Shopping Cart</h1>
      <p className="page-lead">Review your selected items before proceeding to Cash on Delivery checkout.</p>

      <div className={styles.cartGrid}>
        {/* Items List */}
        <div className={styles.itemsColumn}>
          {amountToFree > 0 ? (
            <div className={styles.freeDeliveryBanner}>
              Add <strong>{formatPKR(amountToFree)}</strong> more to get <strong>FREE delivery</strong> across Pakistan!
            </div>
          ) : (
            <div className={styles.freeDeliveryQualified}>
              🎉 You qualify for <strong>FREE delivery</strong>!
            </div>
          )}

          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.variantId} className={styles.itemRow}>
                {/* Thumbnail */}
                <div className={styles.itemMedia}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className={styles.itemImg}
                    />
                  ) : (
                    <div className={styles.noImg}>🍯</div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.itemDetails}>
                  <Link href={`/jams/${item.slug}`} className={styles.itemName}>
                    {item.name}
                  </Link>
                  <span className={styles.itemVariant}>Size: {item.label}</span>
                  <span className={styles.itemPrice}>{formatPKR(item.price)} each</span>
                </div>

                {/* Quantity Stepper */}
                <div className={styles.itemQty}>
                  <div className={styles.stepper}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className={styles.stepBtn}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={styles.stepVal}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className={styles.stepBtn}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Line Total & Remove */}
                <div className={styles.itemTotalCol}>
                  <strong className={styles.itemTotal}>
                    {formatPKR(item.price * item.quantity)}
                  </strong>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className={styles.removeBtn}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.continueShopping}>
            <Link href="/jams" className="btn btn-outline">
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryLine}>
              <span>Subtotal ({itemsCount} {itemsCount === 1 ? "jar" : "jars"})</span>
              <strong>{formatPKR(subtotal)}</strong>
            </div>

            <div className={styles.summaryLine}>
              <span>Delivery Fee</span>
              {isFreeDelivery ? (
                <span className={styles.freeBadge}>FREE</span>
              ) : (
                <strong>{formatPKR(deliveryFee)}</strong>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.totalLine}>
              <span>Total Payable</span>
              <strong className={styles.totalAmount}>{formatPKR(total)}</strong>
            </div>

            <div className={styles.codNotice}>
              <span className={styles.codIcon}>💵</span>
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <p>Pay with cash directly to the courier upon delivery.</p>
              </div>
            </div>

            <Link href="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`}>
              Proceed to Checkout
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
