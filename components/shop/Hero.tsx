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

  // Touch parallax/tilt for mobile responsiveness
  function onTouch(e: React.TouchEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || !e.touches[0]) return;
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
  }

  return (
    <section
      ref={ref}
      className={styles.hero}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onTouchMove={onTouch}
    >
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
          <div className={styles.apple} title="Fresh Chitral Apple - tap to interact">
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
          <div className={styles.appleShadow} aria-hidden="true" />
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
          {/* Vibrant gradient definitions for Hindu Kush / Tirich Mir visibility */}
          <defs>
            <linearGradient id="peakGlow" x1="600" y1="40" x2="600" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b8f25b" stopOpacity="0.65" />
              <stop offset="25%" stopColor="#246a3a" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#144222" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0b2212" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="snowHighlight" x1="600" y1="50" x2="600" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="60%" stopColor="#e8ffd1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#b8f25b" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="distantRidge" x1="0" y1="180" x2="1440" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.18)" />
              <stop offset="45%" stopColor="rgba(184, 242, 91, 0.28)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.12)" />
            </linearGradient>
          </defs>

          {/* Layer 1: Distant Hindu Kush jagged range */}
          <path
            d="M0 310 L90 260 L180 290 L290 220 L380 265 L480 205 L580 245 L680 175 L790 235 L910 195 L1020 255 L1130 210 L1240 270 L1350 230 L1440 270 L1440 400 L0 400 Z"
            fill="url(#distantRidge)"
          />

          {/* Layer 2: Tirich Mir (7,708m) Main Pyramid Massif */}
          <path
            d="M200 400 L360 260 L480 180 L600 50 L720 175 L850 255 L1020 400 Z"
            fill="url(#peakGlow)"
          />

          {/* Faceted Ridge Shade (Adds true 3D alpine relief to the mountain) */}
          <path
            d="M600 50 L600 400 L720 175 L600 50 Z"
            fill="rgba(0, 0, 0, 0.32)"
          />

          {/* Glaciated / Snow Summit of Tirich Mir */}
          <path
            d="M600 50 L535 140 L575 125 L600 150 L625 128 L665 142 Z"
            fill="url(#snowHighlight)"
          />

          {/* Layer 3: Susoom Valley foothills in front */}
          <path
            d="M0 350 Q 320 275 640 345 T 1280 330 T 1440 360 L 1440 400 L0 400 Z"
            fill="rgba(16, 48, 26, 0.85)"
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
