import Link from "next/link";
import Hero from "@/components/shop/Hero";
import JamCard from "@/components/shop/JamCard";
import FruitCard from "@/components/shop/FruitCard";
import { home, catalog } from "@/lib/content";
import { getFruits, getJams, getSettings, whatsappLink } from "@/lib/products";
import BigWord from "@/components/shop/BigWord";
import Marquee from "@/components/shop/Marquee";
import styles from "./home.module.css";

export const revalidate = 60;

export default async function HomePage() {
  const [jams, fruits, settings] = await Promise.all([
    getJams({ featured: true }),
    getFruits(),
    getSettings(),
  ]);

  return (
    <>
      <Hero />

      <BigWord />

      <Marquee />

      <section className={`container ${styles.section}`} aria-labelledby="jams-title">
        <h2 id="jams-title" className={styles.title}>
          {home.featuredJamsTitle}
        </h2>
        <p className="page-lead">{home.featuredJamsLead}</p>
        {jams.length ? (
          <div className="card-grid">
            {jams.map((jam) => (
              <JamCard key={jam.id} jam={jam} />
            ))}
          </div>
        ) : (
          <p className="empty">{catalog.jamsEmpty}</p>
        )}
        <p className={styles.more}>
          <Link href="/jams" className="btn btn-outline">
            All jams
          </Link>
        </p>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="fruits-title">
        <h2 id="fruits-title" className={styles.title}>
          {home.availableFruitsTitle}
        </h2>
        <p className="page-lead">{home.availableFruitsLead}</p>
        {fruits.length ? (
          <div className="card-grid">
            {fruits.map((fruit) => (
              <FruitCard key={fruit.id} fruit={fruit} />
            ))}
          </div>
        ) : (
          <p className="empty">{catalog.fruitsEmpty}</p>
        )}
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="contact-title">
        <div className={styles.contact}>
          <h2 id="contact-title" className={styles.contactTitle}>
            {home.contactTitle}
          </h2>
          <p>{home.contactText}</p>
          <a
            className="btn btn-lime"
            href={whatsappLink(settings.whatsappNumber, home.whatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {home.contactCta}
          </a>
        </div>
      </section>
    </>
  );
}
