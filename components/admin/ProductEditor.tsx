"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPKR } from "@/lib/format";
import styles from "./productEditor.module.css";

type Variant = {
  id: string;
  label: string;
  price: number;
};

type ProductProps = {
  id: string;
  name: string;
  slug: string;
  type: string;
  images: string[];
  unit: string | null;
  unitPrice: number | null;
  isActive: boolean;
  isAvailable: boolean;
  variants: Variant[];
};

export default function ProductEditor({ product }: { product: ProductProps }) {
  const router = useRouter();

  const [isActive, setIsActive] = useState(product.isActive);
  const [isAvailable, setIsAvailable] = useState(product.isAvailable);
  const [unitPrice, setUnitPrice] = useState<string>(
    product.unitPrice ? String(product.unitPrice) : ""
  );
  const [variants, setVariants] = useState<Variant[]>(product.variants || []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleVariantPriceChange(id: string, newPrice: number) {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, price: newPrice } : v))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: {
        isActive: boolean;
        isAvailable: boolean;
        unitPrice?: number | null;
        variants?: Variant[];
      } = {
        isActive,
        isAvailable,
      };

      if (product.type === "FRUIT") {
        payload.unitPrice = unitPrice ? Number(unitPrice) : null;
      } else {
        payload.variants = variants;
      }

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product.");
      }

      setSuccess("Changes saved successfully!");
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error updating product.");
      }
    } finally {
      setLoading(false);
    }
  }

  const thumb = product.images[0] || "/images/jam-apricot.jpg";

  return (
    <div className={styles.card}>
      <form onSubmit={handleSave} className={styles.row}>
        {/* Media & Identification */}
        <div className={styles.productMedia}>
          <Image
            src={thumb}
            alt={product.name}
            width={64}
            height={64}
            className={styles.img}
          />
          <div className={styles.prodInfo}>
            <div className={styles.titleRow}>
              <strong className={styles.name}>{product.name}</strong>
              <span className={`${styles.typeBadge} ${styles[`type${product.type}`]}`}>
                {product.type}
              </span>
            </div>
            <span className={styles.slug}>/{product.type === "JAM" ? "jams" : "fruits"}/{product.slug}</span>
          </div>
        </div>

        {/* Pricing Editor */}
        <div className={styles.pricingSection}>
          {product.type === "FRUIT" ? (
            <div className={styles.priceField}>
              <label className={styles.label}>Daily Guide Rate (PKR/KG)</label>
              <div className={styles.inputPrefix}>
                <span>Rs</span>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="300"
                  className={styles.priceInput}
                />
              </div>
            </div>
          ) : (
            <div className={styles.variantsRow}>
              {variants.map((v) => (
                <div key={v.id} className={styles.variantField}>
                  <label className={styles.label}>{v.label} Jar Price</label>
                  <div className={styles.inputPrefix}>
                    <span>Rs</span>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        handleVariantPriceChange(v.id, Number(e.target.value))
                      }
                      className={styles.priceInput}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className={styles.togglesSection}>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className={styles.checkbox}
            />
            <span style={{ fontSize: "0.85rem", color: isAvailable ? "var(--color-lime)" : "rgba(255,255,255,0.4)" }}>
              {isAvailable ? "In Stock / Available" : "Out of Stock"}
            </span>
          </label>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className={styles.checkbox}
            />
            <span style={{ fontSize: "0.85rem", color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)" }}>
              {isActive ? "Published on Store" : "Hidden (Draft)"}
            </span>
          </label>
        </div>

        {/* Actions & Feedback */}
        <div className={styles.actionCol}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-lime"
            style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem", width: "100%" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {success && <span className={styles.successMsg}>✓ Saved</span>}
          {error && <span className={styles.errorMsg}>{error}</span>}
        </div>
      </form>
    </div>
  );
}
