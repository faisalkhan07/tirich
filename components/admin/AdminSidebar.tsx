"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/(admin)/admin/(dashboard)/admin.module.css";

type Props = {
  adminEmail: string;
  pendingOrdersCount: number;
  pendingRequestsCount: number;
};

export default function AdminSidebar({
  adminEmail,
  pendingOrdersCount,
  pendingRequestsCount,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: "📊",
      badge: 0,
      exact: true,
    },
    {
      label: "Orders (COD)",
      href: "/admin/orders",
      icon: "📦",
      badge: pendingOrdersCount,
      badgeStyle: styles.badge,
    },
    {
      label: "Bulk Fruit Quotes",
      href: "/admin/requests",
      icon: "🍏",
      badge: pendingRequestsCount,
      badgeStyle: styles.badgeWarning,
    },
    {
      label: "Products & Rates",
      href: "/admin/products",
      icon: "🏷️",
      badge: 0,
    },
    {
      label: "Store Settings",
      href: "/admin/settings",
      icon: "⚙️",
      badge: 0,
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.brand}>
        <svg
          width="22"
          height="18"
          viewBox="0 0 24 18"
          fill="none"
          aria-hidden="true"
        >
          <path d="M11 2L1 16H23L16 6L12 12L11 2Z" fill="var(--color-lime)" fillOpacity="0.9" />
          <path d="M11 2L9 6.5L13 6.5L11 2Z" fill="#ffffff" />
        </svg>
        <div>
          <span className={styles.brandText}>TIRICH</span>
          <span className={styles.brandSub}>Admin Control</span>
        </div>
      </Link>

      <nav className={styles.nav} aria-label="Admin Navigation">
        <span className={styles.navSection}>Store Operations</span>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              <div className={styles.navItemLeft}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`${styles.badge} ${item.badgeStyle || ""}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <span className={styles.userEmail} title={adminEmail}>
            {adminEmail}
          </span>
          <span className={styles.userRole}>Store Administrator</span>
        </div>
        <button
          onClick={handleLogout}
          type="button"
          className={styles.logoutBtn}
          title="Sign out of Admin Portal"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
