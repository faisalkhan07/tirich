import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import VariantPicker from "@/components/shop/VariantPicker";
import { getJamBySlug } from "@/lib/products";
import styles from "./jam.module.css";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const jam = await getJamBySlug(slug);
  if (!jam) return {};
  return { title: jam.name, description: jam.description.slice(0, 160) };
}

export default async function JamDetailPage({ params }: Props) {
  const { slug } = await params;
  const jam = await getJamBySlug(slug);
  if (!jam) notFound();

  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.media}>
        {jam.images[0] ? (
          <Image
            src={jam.images[0]}
            alt={jam.name}
            width={800}
            height={800}
            priority
            sizes="(max-width: 800px) 100vw, 520px"
            className={styles.img}
          />
        ) : null}
      </div>
      <div>
        <h1 className={styles.title}>{jam.name}</h1>
        <p>{jam.description}</p>
        <VariantPicker
          product={{
            id: jam.id,
            name: jam.name,
            slug: jam.slug,
            image: jam.images[0],
          }}
          variants={jam.variants.map((v) => ({ id: v.id, label: v.label, price: v.price }))}
          available={jam.isAvailable}
        />
        <dl className={styles.facts}>
          {jam.ingredients ? (
            <>
              <dt>Ingredients</dt>
              <dd>{jam.ingredients}</dd>
            </>
          ) : null}
          {jam.shelfLife ? (
            <>
              <dt>Shelf life</dt>
              <dd>{jam.shelfLife}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
