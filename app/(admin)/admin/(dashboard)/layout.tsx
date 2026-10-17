import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "./admin.module.css";

export const metadata = {
  title: {
    default: "Tirich Admin",
    template: "%s | Tirich Admin",
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  const [pendingOrders, pendingRequests] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.bulkRequest.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className={styles.adminShell}>
      <AdminSidebar
        adminEmail={session.email}
        pendingOrdersCount={pendingOrders}
        pendingRequestsCount={pendingRequests}
      />

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.storeLink}
              title="Open storefront in new tab"
            >
              <span>🌐</span>
              <span>View Public Storefront ↗</span>
            </Link>
          </div>
        </header>

        <main className={styles.pageBody}>{children}</main>
      </div>
    </div>
  );
}
