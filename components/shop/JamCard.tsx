import Image from "next/image";
import Link from "next/link";
import type { Product, ProductVariant } from "@/lib/generated/prisma/client";
import { catalog } from "@/lib/content";
import { formatPKR } from "@/lib/format";
import styles from "./Card.module.css";

type Props = { jam: Product & { variants: ProductVariant[] } };

export default function JamCard({ jam }: Props) {
  const start = jam.variants.length ? Math.min(...jam.variants.map((v) => v.price)) : null;
  return (
    <article className={styles.card}>
      <Link href={`/jams/${jam.slug}`} className={styles.media}>
        {jam.images[0] ? (
          <Image
            src={jam.images[0]}
            alt={jam.name}
            width={600}
            height={600}
            sizes="(max-width: 600px) 90vw, 300px"
            className={styles.img}
          />
        ) : null}
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={`/jams/${jam.slug}`}>{jam.name}</Link>
        </h3>
        <p className={styles.price}>
          {start !== null ? `From ${formatPKR(start)}` : ""}
          {!jam.isAvailable ? <span className="badge badge-muted"> {catalog.unavailable}</span> : null}
        </p>
        <Link href={`/jams/${jam.slug}`} className="btn btn-primary">
          View
        </Link>
      </div>
    </article>
  );
}
