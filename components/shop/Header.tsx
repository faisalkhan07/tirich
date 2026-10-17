import Link from "next/link";
import { brand, nav } from "@/lib/content";
import CartButton from "./CartButton";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <svg className={styles.mountainMark} width="22" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true">
            {/* Twin peak icon with Tirich Mir primary peak & snowcap */}
            <path d="M11 2L1 16H23L16 6L12 12L11 2Z" fill="currentColor" fillOpacity="0.8" />
            <path d="M11 2L9 6.5L13 6.5L11 2Z" fill="#ffffff" />
            <path d="M16 6L14.5 9L17.5 9L16 6Z" fill="#ffffff" fillOpacity="0.9" />
          </svg>
          <span>{brand.name}.</span>
        </Link>
        <div className={styles.rightGroup}>
          <nav aria-label="Main">
            <ul className={styles.nav}>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
