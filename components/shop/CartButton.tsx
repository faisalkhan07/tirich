"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import styles from "./Header.module.css";

export default function CartButton() {
  const { itemsCount, isHydrated } = useCart();

  return (
    <Link href="/cart" className={styles.cartBtn} aria-label={`View Cart, ${itemsCount} items`}>
      <svg
        className={styles.cartIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span className={styles.cartLabel}>Cart</span>
      <span className={styles.cartBadge}>
        {isHydrated ? itemsCount : 0}
      </span>
    </Link>
  );
}
