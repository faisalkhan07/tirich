import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/format";
import PrintButton from "@/components/admin/PrintButton";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import styles from "@/components/admin/orderDetail.module.css";
import dashStyles from "@/app/(admin)/admin/(dashboard)/dashboard.module.css";

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cleanPhone = order.phone.replace(/[^\d]/g, "");
  const waMessage = `Hello ${order.customerName}! This is Tirich confirming your order ${order.referenceNo} for ${order.items.reduce((s, i) => s + i.quantity, 0)} jars of artisanal jam. Total COD amount to collect is ${formatPKR(order.total)}.`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className={styles.container}>
      {/* Top navigation & Print Action */}
      <div className={styles.topRow}>
        <Link href="/admin/orders" className={styles.backLink}>
          ← Back to All Orders
        </Link>
        <div className={styles.actionRow} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <PrintButton />
          <DeleteOrderButton
            orderId={order.id}
            referenceNo={order.referenceNo}
            redirectAfterDelete={true}
          />
        </div>
      </div>

      {/* Main Order Header */}
      <div className={dashStyles.pageHeader} style={{ marginBottom: 0 }}>
        <div className={dashStyles.titleGroup}>
          <h1>Order {order.referenceNo}</h1>
          <p>Placed on {dateFormatted} via Cash on Delivery</p>
        </div>
        <div>
          <span className={`${dashStyles.statusBadge} ${dashStyles[`status${order.status}`]}`} style={{ fontSize: "0.88rem", padding: "0.4rem 0.9rem" }}>
            Current Status: {order.status}
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column: Items & Totals */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Itemized Jars & Packaging</h2>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Item & Jar Size</th>
                <th style={{ textAlign: "center" }}>Quantity</th>
                <th style={{ textAlign: "right" }}>Unit Price</th>
                <th style={{ textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: "#ffffff" }}>{item.nameSnapshot}</strong>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.55)" }}>
                      Size: {item.labelSnapshot}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>{formatPKR(item.priceSnapshot)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--color-lime)" }}>
                    {formatPKR(item.priceSnapshot * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Breakdown */}
          <div className={styles.totalSummary}>
            <div className={styles.summaryRow}>
              <span>Jars Subtotal:</span>
              <span>{formatPKR(order.subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? "FREE" : formatPKR(order.deliveryFee)}</span>
            </div>
            <div className={styles.grandTotalRow}>
              <span>Total Payable on Delivery:</span>
              <strong>{formatPKR(order.total)}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Status Updater */}
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customer Details</h2>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{order.customerName}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mobile / WhatsApp</span>
              <span className={styles.infoValue}>{order.phone}</span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waBtn}
              >
                <span>💬</span> Message on WhatsApp
              </a>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Delivery Destination</span>
              <span className={styles.infoValue}>{order.city}</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.75)" }}>
                {order.address}
              </p>
            </div>

            {order.notes && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Customer Special Notes</span>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#fbbf24", fontStyle: "italic" }}>
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            )}

            <div className={styles.infoItem} style={{ marginBottom: 0 }}>
              <span className={styles.infoLabel}>Payment Mode</span>
              <span className={styles.infoValue}>Cash on Delivery (COD)</span>
            </div>
          </div>

          {/* Status Updater */}
          <OrderStatusUpdater orderId={order.id} initialStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
