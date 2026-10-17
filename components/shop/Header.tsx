"use client";

import { useState } from "react";
import Link from "next/link";
import { brand, nav } from "@/lib/content";
import CartButton from "./CartButton";
import styles from "./Header.module.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <svg className={styles.mountainMark} width="22" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true">
            {/* Twin peak icon with Tirich Mir primary peak & snowcap */}
            <path d="M11 2L1 16H23L16 6L12 12L11 2Z" fill="currentColor" fillOpacity="0.8" />
            <path d="M11 2L9 6.5L13 6.5L11 2Z" fill="#ffffff" />
            <path d="M16 6L14.5 9L17.5 9L16 6Z" fill="#ffffff" fillOpacity="0.9" />
          </svg>
          <span>{brand.name}.</span>
        </Link>

        <div className={styles.rightGroup}>
          <nav aria-label="Main" className={styles.navDesktop}>
            <ul className={styles.nav}>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <CartButton />

          {/* Mobile hamburger button */}
          <button
            type="button"
            className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnActive : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className={styles.mobileDrawer}>
          <nav aria-label="Mobile Navigation">
            <ul className={styles.mobileNavList}>
              {nav.map((item) => (
                <li key={item.href} className={styles.mobileNavItem}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={styles.mobileNavLink}
                  >
                    <span>{item.label}</span>
                    <span className={styles.mobileNavArrow}>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
