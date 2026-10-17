import { home } from "@/lib/content";
import styles from "./Marquee.module.css";

// Endless scrolling ribbon of product names. Never goes blank on wide screens, never stops on cursor hover.
export default function Marquee() {
  const items = home.marquee;
  // Repeat items inside each list block so each list is wider than any ultrawide display
  const repeated = [...items, ...items, ...items];

  return (
    <div className={styles.band} aria-hidden="true">
      <div className={styles.track}>
        <ul className={styles.list}>
          {repeated.map((item, idx) => (
            <li key={`track1-${idx}`}>{item}</li>
          ))}
        </ul>
        <ul className={styles.list}>
          {repeated.map((item, idx) => (
            <li key={`track2-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
