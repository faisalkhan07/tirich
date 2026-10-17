import Link from "next/link";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/format";
import styles from "./dashboard.module.css";

export const revalidate = 0; // always dynamic for admin

export default async function AdminDashboardPage() {
  const [
    newOrdersCount,
    newRequestsCount,
    totalProductsCount,
    allOrders,
    recentOrders,
    recentRequests,
  ] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.bulkRequest.count({ where: { status: "NEW" } }),
    db.product.count({ where: { isActive: true } }),
    db.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    db.bulkRequest.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      },
    }),
  ]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Store Operations Overview</h1>
          <p>Real-time monitor for Chitral orchard harvests & COD artisanal jam orders.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>TOTAL COD REVENUE</span>
            <span>💰</span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiAccentLime}`}>
            {formatPKR(totalRevenue)}
          </div>
          <div className={styles.kpiHint}>{allOrders.length} confirmed/active orders</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>NEW JAM ORDERS</span>
            <span>📦</span>
          </div>
          <div className={`${styles.kpiValue} ${newOrdersCount > 0 ? styles.kpiAccentApple : ""}`}>
            {newOrdersCount}
          </div>
          <div className={styles.kpiHint}>
            {newOrdersCount > 0 ? "⚠️ Requires packing & dispatch" : "All orders processed"}
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>PENDING FRUIT QUOTES</span>
            <span>🍏</span>
          </div>
          <div className={`${styles.kpiValue} ${newRequestsCount > 0 ? styles.kpiAccentAmber : ""}`}>
            {newRequestsCount}
          </div>
          <div className={styles.kpiHint}>
            {newRequestsCount > 0 ? "Requires customer WhatsApp quote" : "All quotes answered"}
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>ACTIVE PRODUCTS</span>
            <span>🏷️</span>
          </div>
          <div className={styles.kpiValue}>{totalProductsCount}</div>
          <div className={styles.kpiHint}>Listed on public store</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>📦</span>
            <span>Recent Jam Orders (Cash on Delivery)</span>
          </h2>
          <Link href="/admin/orders" className={styles.viewAllLink}>
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className={styles.emptyState}>No orders placed yet.</div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  const itemsSummary = order.items
                    .map((i) => `${i.quantity}x ${i.nameSnapshot} (${i.labelSnapshot})`)
                    .join(", ");

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.refCode}>{order.referenceNo}</span>
                      </td>
                      <td>
                        <span className={styles.custName}>{order.customerName}</span>
                        <span className={styles.custPhone}>{order.phone}</span>
                      </td>
                      <td>{order.city}</td>
                      <td title={itemsSummary} style={{ maxWidth: "260px" }}>
                        <span style={{ fontSize: "0.82rem" }}>
                          {itemCount} jars: {itemsSummary}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#ffffff" }}>{formatPKR(order.total)}</strong>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/orders/${order.id}`} className={styles.actionBtn}>
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Bulk Requests Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>🍏</span>
            <span>Recent Bulk Fruit Requests</span>
          </h2>
          <Link href="/admin/requests" className={styles.viewAllLink}>
            View All Quotes →
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className={styles.emptyState}>No bulk fruit requests received yet.</div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request Ref</th>
                  <th>Fruit</th>
                  <th>Quantity</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Target Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span className={styles.refCode}>{req.referenceNo}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#ffffff" }}>{req.product.name}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--color-lime)" }}>
                        {req.quantity} KG
                      </span>
                    </td>
                    <td>
                      <span className={styles.custName}>{req.customerName}</span>
                      <span className={styles.custPhone}>{req.phone}</span>
                    </td>
                    <td>{req.city}</td>
                    <td>{new Date(req.deliveryDate).toLocaleDateString("en-PK")}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${req.status}`]}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/requests`} className={styles.actionBtn}>
                        Quote Rate →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
