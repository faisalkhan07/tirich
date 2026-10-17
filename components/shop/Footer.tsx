import Link from "next/link";
import { brand, footerLinks } from "@/lib/content";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <strong className={styles.logo}>{brand.name}.</strong>
          <p>{brand.tagline}</p>
        </div>
        <ul className={styles.links}>
          {footerLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={`container ${styles.copy}`}>
        &copy; {new Date().getFullYear()} {brand.name}. {brand.origin}.
      </div>
    </footer>
  );
}
