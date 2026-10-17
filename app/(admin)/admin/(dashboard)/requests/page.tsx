import Link from "next/link";
import { db } from "@/lib/db";
import { BulkRequestStatus } from "@/lib/generated/prisma/enums";
import BulkRequestEditor from "@/components/admin/BulkRequestEditor";
import styles from "../dashboard.module.css";
import orderStyles from "../orders/orders.module.css";

export const revalidate = 0;

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminBulkRequestsPage({ searchParams }: Props) {
  const { status, q } = await searchParams;

  const validStatus = status && Object.values(BulkRequestStatus).includes(status as BulkRequestStatus)
    ? (status as BulkRequestStatus)
    : undefined;

  const whereClause: {
    status?: BulkRequestStatus;
    OR?: Array<{
      referenceNo?: { contains: string; mode: "insensitive" };
      customerName?: { contains: string; mode: "insensitive" };
      phone?: { contains: string; mode: "insensitive" };
      city?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (validStatus) {
    whereClause.status = validStatus;
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

  const [requests, counts] = await Promise.all([
    db.bulkRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { product: true },
    }),
    Promise.all([
      db.bulkRequest.count(),
      db.bulkRequest.count({ where: { status: "NEW" } }),
      db.bulkRequest.count({ where: { status: "QUOTED" } }),
      db.bulkRequest.count({ where: { status: "CONFIRMED" } }),
      db.bulkRequest.count({ where: { status: "DELIVERED" } }),
      db.bulkRequest.count({ where: { status: "CANCELLED" } }),
    ]),
  ]);

  const [totalCount, newCount, quotedCount, confirmedCount, deliveredCount, cancelledCount] =
    counts;

  const tabs = [
    { label: "All Requests", value: "", count: totalCount },
    { label: "New (Needs Quote)", value: "NEW", count: newCount },
    { label: "Quoted", value: "QUOTED", count: quotedCount },
    { label: "Confirmed (Packing)", value: "CONFIRMED", count: confirmedCount },
    { label: "Delivered", value: "DELIVERED", count: deliveredCount },
    { label: "Cancelled", value: "CANCELLED", count: cancelledCount },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Bulk Fruit Order Quotes</h1>
          <p>Review mountain harvest volume requests, quote locked rates, and message customers directly on WhatsApp.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={orderStyles.tabBar}>
        {tabs.map((tab) => {
          const isActive = (tab.value === "" && !validStatus) || validStatus === tab.value;
          const href = tab.value ? `/admin/requests?status=${tab.value}` : "/admin/requests";

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
      <form method="GET" action="/admin/requests" className={orderStyles.searchBar}>
        {validStatus && <input type="hidden" name="status" value={validStatus} />}
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Search by request ref (FRT-...), customer name, phone, or city..."
          className={orderStyles.searchInput}
        />
        <button type="submit" className={`btn btn-lime ${orderStyles.searchBtn}`}>
          Search
        </button>
        {q && (
          <Link
            href={validStatus ? `/admin/requests?status=${validStatus}` : "/admin/requests"}
            className={orderStyles.clearBtn}
          >
            Clear Search
          </Link>
        )}
      </form>

      {/* Requests List */}
      <div>
        {requests.length === 0 ? (
          <div className={styles.section}>
            <div className={styles.emptyState}>
              {q
                ? `No bulk requests matching "${q}".`
                : validStatus
                ? `No requests currently in ${validStatus} status.`
                : "No bulk fruit requests received yet."}
            </div>
          </div>
        ) : (
          requests.map((req) => (
            <BulkRequestEditor key={req.id} request={req} />
          ))
        )}
      </div>
    </div>
  );
}
