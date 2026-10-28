import Link from "next/link";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/format";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import styles from "../dashboard.module.css";
import orderStyles from "./orders.module.css";

export const revalidate = 0;

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, q } = await searchParams;

  const isAll = status === "ALL";
  const validStatus = status && Object.values(OrderStatus).includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const whereClause: {
    status?: OrderStatus | { in: OrderStatus[] };
    OR?: Array<{
      referenceNo?: { contains: string; mode: "insensitive" };
      customerName?: { contains: string; mode: "insensitive" };
      phone?: { contains: string; mode: "insensitive" };
      city?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (validStatus) {
    whereClause.status = validStatus;
  } else if (!isAll) {
    // Default active operational queue: NEW, CONFIRMED, DISPATCHED.
    // Delivered orders automatically disappear from active queue!
    whereClause.status = { in: ["NEW", "CONFIRMED", "DISPATCHED"] };
  }

  if (q && q.trim().length > 0) {
    const term = q.trim();
    whereClause.OR = [
      { referenceNo: { contains: term, mode: "insensitive" } },
      { customerName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
    ];
  }

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "NEW" } }),
      db.order.count({ where: { status: "CONFIRMED" } }),
      db.order.count({ where: { status: "DISPATCHED" } }),
      db.order.count({ where: { status: "DELIVERED" } }),
      db.order.count({ where: { status: "CANCELLED" } }),
    ]),
  ]);

  const [totalCount, newCount, confirmedCount, dispatchedCount, deliveredCount, cancelledCount] =
    counts;
  const activeCount = newCount + confirmedCount + dispatchedCount;

  const tabs = [
    { label: "Active Queue", value: "", count: activeCount },
    { label: "New (Unprocessed)", value: "NEW", count: newCount },
    { label: "Confirmed", value: "CONFIRMED", count: confirmedCount },
    { label: "Dispatched", value: "DISPATCHED", count: dispatchedCount },
    { label: "Delivered (Archive)", value: "DELIVERED", count: deliveredCount },
    { label: "Cancelled", value: "CANCELLED", count: cancelledCount },
    { label: "All Orders", value: "ALL", count: totalCount },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Jam Orders (Cash on Delivery)</h1>
          <p>
            {validStatus === "DELIVERED"
              ? "Completed orders archive."
              : isAll
              ? "Complete historical log of all customer orders."
              : "Active order processing queue. Once delivered, orders automatically move to the Completed archive."}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={orderStyles.tabBar}>
        {tabs.map((tab) => {
          const isActive = (tab.value === "" && !validStatus && !isAll) || (tab.value === "ALL" && isAll) || validStatus === tab.value;
          const href = tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders";

          return (
            <Link
              key={tab.label}
              href={href}
              className={`${orderStyles.tabItem} ${isActive ? orderStyles.tabItemActive : ""}`}
            >
              <span>{tab.label}</span>
              <span className={orderStyles.tabCount}>{tab.count}</span>
            </Link>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <form method="GET" action="/admin/orders" className={orderStyles.searchBar}>
        {validStatus && <input type="hidden" name="status" value={validStatus} />}
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Search by reference (JAM-...), customer name, phone, or city..."
          className={orderStyles.searchInput}
        />
        <button type="submit" className={`btn btn-lime ${orderStyles.searchBtn}`}>
          Search
        </button>
        {q && (
          <Link
            href={validStatus ? `/admin/orders?status=${validStatus}` : "/admin/orders"}
            className={orderStyles.clearBtn}
          >
            Clear Search
          </Link>
        )}
      </form>

      {/* Orders Table */}
      <div className={styles.section}>
        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            {q
              ? `No orders matching "${q}".`
              : validStatus
              ? `No orders currently in ${validStatus} status.`
              : "No orders placed yet."}
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>City & Address</th>
                  <th>Jars Summary</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  const itemsList = order.items
                    .map((i) => `${i.quantity}x ${i.nameSnapshot} (${i.labelSnapshot})`)
                    .join(", ");

                  const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-PK", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={order.id}>
                      <td style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.55)", whiteSpace: "nowrap" }}>
                        {dateFormatted}
                      </td>
                      <td>
                        <span className={styles.refCode}>{order.referenceNo}</span>
                      </td>
                      <td>
                        <span className={styles.custName}>{order.customerName}</span>
                        <a
                          href={`https://wa.me/${order.phone.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.custPhone}
                          title="Message customer on WhatsApp"
                          style={{ textDecoration: "underline" }}
                        >
                          💬 {order.phone}
                        </a>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#ffffff" }}>{order.city}</span>
                        <span style={{ display: "block", fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", maxWidth: "200px" }}>
                          {order.address}
                        </span>
                      </td>
                      <td style={{ maxWidth: "240px" }}>
                        <span style={{ fontSize: "0.82rem" }}>
                          <strong>{itemCount} jars:</strong> {itemsList}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#ffffff" }}>{formatPKR(order.total)}</strong>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--color-lime)" }}>
                          COD
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <Link href={`/admin/orders/${order.id}`} className={styles.actionBtn}>
                            Open Order →
                          </Link>
                          <DeleteOrderButton orderId={order.id} referenceNo={order.referenceNo} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
