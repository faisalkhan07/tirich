"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPKR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import styles from "./VariantPicker.module.css";

type Variant = { id: string; label: string; price: number };

type ProductInfo = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

export default function VariantPicker({
  product,
  variants,
  available,
}: {
  product: ProductInfo;
  variants: Variant[];
  available: boolean;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const selected = variants.find((v) => v.id === selectedId);

  if (!variants.length) return <p>No sizes available.</p>;

  function handleAddToCart() {
    if (!selected || !available) return;

    addItem(
      {
        productId: product.id,
        variantId: selected.id,
        name: product.name,
        slug: product.slug,
        label: selected.label,
        price: selected.price,
        image: product.image,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  }

  return (
    <div className={styles.container}>
      <fieldset className={styles.sizes}>
        <legend className={styles.legend}>Choose Size</legend>
        {variants.map((v) => (
          <label
            key={v.id}
            className={`${styles.size} ${v.id === selectedId ? styles.active : ""}`}
          >
            <input
              type="radio"
              name="variant"
              value={v.id}
              checked={v.id === selectedId}
              onChange={() => setSelectedId(v.id)}
            />
            <span className={styles.sizeLabel}>{v.label}</span>
            <strong className={styles.sizePrice}>{formatPKR(v.price)}</strong>
          </label>
        ))}
      </fieldset>

      <div className={styles.priceRow}>
        <span className={styles.priceLabel}>Price:</span>
        <span className={styles.priceVal}>{selected ? formatPKR(selected.price) : null}</span>
      </div>

      {available ? (
        <div className={styles.actionBlock}>
          {/* Quantity selector */}
          <div className={styles.qtyGroup}>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`btn btn-primary ${styles.addBtn} ${added ? styles.addedBtn : ""}`}
          >
            {added ? "Added to Cart! ✓" : "Add to Cart"}
          </button>

          {/* Direct link to view cart */}
          {added && (
            <Link href="/cart" className={`btn btn-lime ${styles.viewCartLink}`}>
              View Cart →
            </Link>
          )}
        </div>
      ) : (
        <p className="badge badge-muted">Currently unavailable</p>
      )}
    </div>
  );
}
