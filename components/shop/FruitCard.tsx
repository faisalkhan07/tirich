import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/generated/prisma/client";
import { catalog } from "@/lib/content";
import { formatPKR } from "@/lib/format";
import styles from "./Card.module.css";

export default function FruitCard({ fruit }: { fruit: Product }) {
  const unit = fruit.unit?.toLowerCase() ?? "kg";
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {fruit.images[0] ? (
          <Image
            src={fruit.images[0]}
            alt={fruit.name}
            width={600}
            height={600}
            sizes="(max-width: 600px) 90vw, 300px"
            className={styles.img}
          />
        ) : null}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{fruit.name}</h3>
        <ul className={styles.facts}>
          {fruit.origin ? (
            <li>
              {catalog.originLabel}: {fruit.origin}
            </li>
          ) : null}
          {fruit.seasonNote ? (
            <li>
              {catalog.seasonLabel}: {fruit.seasonNote}
            </li>
          ) : null}
          {fruit.minQty ? (
            <li>
              {catalog.minQtyLabel}: {fruit.minQty} {unit}
            </li>
          ) : null}
        </ul>
        {fruit.unitPrice ? (
          <p className={styles.price}>
            About {formatPKR(fruit.unitPrice)} / {unit}
            <span className={styles.note}>{catalog.priceGuideNote}</span>
          </p>
        ) : null}
        {fruit.isAvailable ? (
          <Link href={`/fruits/request?fruit=${fruit.slug}`} className="btn btn-primary">
            {catalog.requestBulk}
          </Link>
        ) : (
          <span className="badge badge-muted">{catalog.unavailable}</span>
        )}
      </div>
    </article>
  );
}
