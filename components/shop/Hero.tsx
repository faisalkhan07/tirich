"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { home } from "@/lib/content";
import styles from "./Hero.module.css";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Pointer parallax: sets CSS variables only, so React never re-renders on move.
  function onMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
  }

  function onLeave() {
    ref.current?.style.setProperty("--mx", "0");
    ref.current?.style.setProperty("--my", "0");
  }

  return (
    <section ref={ref} className={styles.hero} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={styles.heading}>
            <span className={styles.eyebrow}>{home.heroEyebrow}</span>
            <span className={styles.script}>{home.heroScript}</span>
          </h1>
          <p className={styles.text}>{home.heroText}</p>
          <div className={styles.actions}>
            <Link href="/jams" className="btn btn-lime">
              {home.heroCtaJam}
            </Link>
            <Link href="/fruits" className="btn btn-primary">
              {home.heroCtaFruit}
            </Link>
          </div>
        </div>
        <div className={styles.appleWrap}>
          <div className={styles.apple}>
            <Image
              src="/images/hero-apple.jpg"
              alt="A fresh red Chitral apple, cut open"
              width={900}
              height={900}
              priority
              sizes="(max-width: 900px) 90vw, 560px"
              className={styles.appleImg}
            />
          </div>
        </div>
      </div>

      {/* Mountain Silhouette: Tirich Mir (7,708m) - Hindu Kush Range */}
      <div className={styles.mountainLayer} aria-hidden="true">
        <svg
          className={styles.mountainSvg}
          viewBox="0 0 1440 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Subtle gradient definitions */}
          <defs>
            <linearGradient id="peakGlow" x1="600" y1="50" x2="600" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.28" />
              <stop offset="50%" stopColor="var(--color-forest)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-forest)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="snowHighlight" x1="570" y1="60" x2="630" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="distantRidge" x1="0" y1="200" x2="1440" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.05)" />
              <stop offset="50%" stopColor="rgba(184, 242, 91, 0.09)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
            </linearGradient>
          </defs>

          {/* Layer 1: Distant Hindu Kush jagged range */}
          <path
            d="M0 310 L90 270 L180 295 L290 230 L380 270 L480 215 L580 250 L680 190 L790 245 L910 205 L1020 260 L1130 220 L1240 275 L1350 240 L1440 280 L1440 400 L0 400 Z"
            fill="url(#distantRidge)"
          />

          {/* Layer 2: Tirich Mir (7,708m) Main Pyramid Massif */}
          <path
            d="M240 400 L380 270 L490 195 L600 60 L710 185 L830 260 L980 400 Z"
            fill="url(#peakGlow)"
          />

          {/* Faceted Ridge Shade (Adds 3D relief to the mountain) */}
          <path
            d="M600 60 L600 400 L710 185 L600 60 Z"
            fill="rgba(0, 0, 0, 0.22)"
          />

          {/* Glaciated / Snow Summit of Tirich Mir */}
          <path
            d="M600 60 L565 125 L590 115 L600 135 L615 118 L640 130 Z"
            fill="url(#snowHighlight)"
          />

          {/* Layer 3: Susoom Valley foothills in front */}
          <path
            d="M0 360 Q 320 290 640 355 T 1280 340 T 1440 370 L 1440 400 L0 400 Z"
            fill="rgba(16, 48, 26, 0.65)"
          />
        </svg>

        {/* Mountain Summit Marker */}
        <div className={styles.peakMarker}>
          <span className={styles.beaconDot} />
          <span className={styles.peakBadge}>Tirich Mir • 7,708m</span>
        </div>
      </div>
    </section>
  );
}
