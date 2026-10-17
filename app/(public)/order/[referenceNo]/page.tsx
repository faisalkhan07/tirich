import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/format";
import { getSettings, whatsappLink } from "@/lib/products";
import styles from "./order.module.css";

type Props = {
  params: Promise<{ referenceNo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { referenceNo } = await params;
  return {
    title: `Order ${referenceNo} Confirmed`,
    description: `Your order ${referenceNo} has been placed successfully with Tirich.`,
  };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { referenceNo } = await params;

  const [order, settings] = await Promise.all([
    db.order.findUnique({
      where: { referenceNo },
      include: {
        items: true,
      },
    }),
    getSettings(),
  ]);

  if (!order) {
    notFound();
  }

  // Pre-filled WhatsApp message for owner confirmation
  const waMessage = `Hello Tirich! I have placed order ${order.referenceNo} for ${formatPKR(
    order.total
  )} (COD). Please confirm my order.`;

  const waUrl = whatsappLink(settings.whatsappNumber, waMessage);

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)", maxWidth: "800px" }}>
      <div className={styles.confirmedCard}>
        {/* Success Icon & Header */}
        <div className={styles.headerBlock}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Order Placed Successfully!</h1>
          <p className={styles.lead}>
            Thank you, <strong>{order.customerName}</strong>. Your order has been received and is being prepared with care in Chitral.
          </p>

          <div className={styles.refBox}>
            <span className={styles.refLabel}>Order Reference Number</span>
            <strong className={styles.refCode}>{order.referenceNo}</strong>
          </div>
        </div>

        {/* Action button: WhatsApp Direct Chat */}
        <div className={styles.waSection}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-lime ${styles.waBtn}`}
          >
            <span>💬</span> Confirm Order on WhatsApp
          </a>
          <p className={styles.waHint}>
            Tap above to send your reference number to our team on WhatsApp for priority confirmation and dispatch updates.
          </p>
        </div>

        {/* Order Details Breakdown */}
        <div className={styles.detailsBlock}>
          <h2 className={styles.sectionTitle}>Ordered Items</h2>
          <div className={styles.itemsList}>
            {order.items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div>
                  <strong className={styles.itemName}>{item.nameSnapshot}</strong>
                  <span className={styles.itemMeta}>
                    Size: {item.labelSnapshot} × {item.quantity}
                  </span>
                </div>
                <strong className={styles.itemPrice}>
                  {formatPKR(item.priceSnapshot * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <div className={styles.totalsTable}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatPKR(order.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Delivery Fee</span>
              {order.deliveryFee === 0 ? (
                <span className={styles.freeBadge}>FREE</span>
              ) : (
                <strong>{formatPKR(order.deliveryFee)}</strong>
              )}
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total Payable</span>
              <strong>{formatPKR(order.total)}</strong>
            </div>
          </div>
        </div>

        {/* Delivery & Payment Information */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>Delivery Details</h3>
            <p>
              <strong>Recipient:</strong> {order.customerName}
            </p>
            <p>
              <strong>Phone:</strong> {order.phone}
            </p>
            <p>
              <strong>Address:</strong> {order.address}, {order.city}
            </p>
            {order.notes ? (
              <p>
                <strong>Delivery Notes:</strong> {order.notes}
              </p>
            ) : null}
          </div>

          <div className={styles.infoCard}>
            <h3>Payment Method</h3>
            <p>
              <strong>Cash on Delivery (COD)</strong>
            </p>
            <p className={styles.mutedNote}>
              Please have <strong>{formatPKR(order.total)}</strong> ready in cash when the courier arrives at your doorstep.
            </p>
            <p className={styles.mutedNote}>
              Status: <span className={styles.statusBadge}>{order.status}</span>
            </p>
          </div>
        </div>

        {/* Back navigation */}
        <div className={styles.footerNav}>
          <Link href="/jams" className="btn btn-outline">
            ← Continue Shopping
          </Link>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
