import { db } from "@/lib/db";
import ProductEditor from "@/components/admin/ProductEditor";
import styles from "../dashboard.module.css";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const jams = products.filter((p) => p.type === "JAM");
  const fruits = products.filter((p) => p.type === "FRUIT");

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1>Products & Rate Management</h1>
          <p>
            Update daily orchard harvest guide prices, edit jam jar sizes, and toggle store availability in real-time.
          </p>
        </div>
      </div>

      {/* Fresh Fruits Section */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "1.25rem", color: "#ffffff", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🍏</span> Fresh Orchard Fruits (Bulk / KG Daily Guide Rates)
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem", margin: "0 0 var(--space-4)" }}>
          The prices set here serve as initial catalog price guides shown to customers when requesting bulk orders.
        </p>

        {fruits.map((fruit) => (
          <ProductEditor key={fruit.id} product={fruit} />
        ))}
      </div>

      {/* Artisanal Jams Section */}
      <div>
        <h2 style={{ fontSize: "1.25rem", color: "#ffffff", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🍯</span> Artisanal Jams (Variant Jar Pricing)
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem", margin: "0 0 var(--space-4)" }}>
          Prices set here are fixed checkout prices charged to guests via Cash on Delivery.
        </p>

        {jams.map((jam) => (
          <ProductEditor key={jam.id} product={jam} />
        ))}
      </div>
    </div>
  );
}
