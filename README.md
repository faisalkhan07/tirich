# 🏔️ Tirich — Fruit & Artisanal Jam from Chitral

<p align="center">
  <a href="https://tirich.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-tirich.vercel.app-10301A?style=for-the-badge&logo=vercel&logoColor=B8F25B" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js%2016-App%20Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React%2019-Strict%20Mode-20232A?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Prisma%207-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
</p>

---

## 🌟 Overview

**Tirich** is a modern, design-forward e-commerce platform dedicated to fresh seasonal orchard produce and small-batch artisanal jams grown at the base of **Tirich Mir** (7,708 m / 25,289 ft — the highest peak of the Hindu Kush range) in Chitral, Pakistan.

Built with Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS Modules, and PostgreSQL via Prisma 7.

[![Tirich Storefront Hero Banner](docs/screenshots/hero-banner.png)](https://tirich.vercel.app)

---

## 🌐 Live Deployment

* 🚀 **Public Storefront:** [https://tirich.vercel.app](https://tirich.vercel.app)
* 🍯 **Fresh Jams Catalog:** [https://tirich.vercel.app/jams](https://tirich.vercel.app/jams)
* 🍏 **Bulk Orchard Fruits:** [https://tirich.vercel.app/fruits](https://tirich.vercel.app/fruits)
* 📝 **Bulk Fruit Request:** [https://tirich.vercel.app/fruits/request](https://tirich.vercel.app/fruits/request)
* 🛡️ **Admin Portal:** [https://tirich.vercel.app/admin/login](https://tirich.vercel.app/admin/login)

---

## 📸 Visual Showcase

| Interactive Catalog & Ribbon | Complete Storefront Layout |
| :---: | :---: |
| ![Catalog and Marquee Ribbon](docs/screenshots/catalog-ribbon.png) | ![Full Storefront View](docs/screenshots/full-storefront.png) |

---

## ✨ Key Features

### 1. 🍯 Artisanal Jams Flow (Guest Checkout)
* **Size Variant Picker:** Interactive selection between 250g and 500g glass jars with live price updates.
* **Client-Side Cart:** Fast external reactive store (`useSyncExternalStore` + `localStorage`) with dynamic cart pill badge.
* **Free Shipping Tracker:** Sliding progress bar indicating qualification for free nationwide delivery (default threshold: Rs 5,000; flat fee: Rs 500).
* **Cash on Delivery (COD):** Streamlined guest checkout requiring zero account creation.
* **Pakistani Phone Normalization:** Accepts formats like `0300 1234567`, `0300-1234567`, or `+92 300 ...` and normalizes to standard `+923XXXXXXXXX`.
* **Unique Order Tracking:** Collision-safe reference generation (`JAM-YYYYMMDD-XXXX`).
* **Direct WhatsApp Connect:** Confirmation page features a pre-filled click-to-chat button opening customer WhatsApp directly to the owner.

### 2. 🍏 Bulk Orchard Fruit Flow (Quote Requests)
* **Harvest Guide Rates:** Daily market guidance prices for Chitrali Apples, Apricots, Mulberries, Cherries, and Pomegranates.
* **Minimum 5 kg Constraint:** Stepper strictly enforcing commercial and bulk order minimums (±1kg and ±5kg adjustments).
* **Transit Date Picker:** Lead-time date selector ensuring fruit is freshly picked and packed to order.
* **Reference Numbering:** Branded reference generation (`FRT-YYYYMMDD-XXXX`).
* **3-Step Process Timeline:** Clear visual guidance on Orchard Review → WhatsApp Quote → Fresh Dispatch.

### 3. 🛡️ Operations & Admin Portal (`/admin`)
* **Session Security:** Cryptographically signed HMAC-SHA256 session cookies with automatic route guards (`requireAdmin`).
* **Live Operations Dashboard:** Real-time KPI cards for Total COD Revenue, New Orders, Pending Quotes, and Active Products.
* **Order Pipeline Manager:** Filter by status (`NEW`, `CONFIRMED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`), search by reference/customer/phone, and status updates.
* **Printable Invoices:** Clean print view formatting professional receipts/packing slips with one click.
* **Bulk Quote Editor:** Record agreed PKR rates, add internal fulfillment notes, and message customers with one click on WhatsApp.
* **Daily Rates & Availability:** Toggle products in stock/out of stock and update guide rates instantly.
* **Store Configuration:** Manage WhatsApp routing number, delivery fee limits, and alert emails.

### 4. 🔔 Alerts, Webhooks & Anti-Spam
* **Email Alerts (Resend):** Sends instant HTML notification emails to the owner on new orders and quote requests.
* **Zapier / Make Webhooks:** Optional fire-and-forget JSON dispatch (`order.created`, `bulk_request.created`).
* **Anti-Bot Honeypot:** Transparent traps rejecting automated spam submissions.
* **IP Rate Limiting:** Database-backed sliding window rate limiters protecting checkout and quote APIs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **UI & State** | [React 19](https://react.dev), Vanilla CSS Modules, Design Tokens |
| **Typography** | Google Fonts: `Syne` (800 display), `Outfit` (sans), `Pacifico` (script) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **Database** | [PostgreSQL](https://www.postgresql.org) via [Supabase](https://supabase.com) (pgbouncer pooler) |
| **ORM** | [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` |
| **Validation** | [Zod 4](https://zod.dev) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/faisalkhan07/tirich.git
cd tirich
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
SESSION_SECRET="your-32-byte-random-secret"
ADMIN_EMAIL="owner@example.com"
ADMIN_PASSWORD="your-secure-admin-password"
RESEND_API_KEY="" # Optional (free at resend.com)
ZAPIER_WEBHOOK_URL="" # Optional
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Migrate and Seed Database
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the full end-to-end integration test suite:
```bash
npx tsx scripts/test-e2e-all.ts
```
Verifies:
* Phone normalization logic
* All 11 public storefront routes
* COD checkout & `JAM-` reference generation
* Bulk fruit minimum 5 kg constraint & `FRT-` reference generation
* Admin session cookie authentication & protected routes
* Status transitions, quote recordings, and settings updates
* Clean automatic test-record purging

---

## 📁 Project Structure

```text
hammadweb/
├── app/
│   ├── (admin)/admin/          # Protected Admin portal
│   │   ├── (dashboard)/        # Dashboard, Orders, Requests, Products, Settings
│   │   └── login/              # Admin session authentication
│   ├── (public)/               # Public storefront routes
│   │   ├── cart/               # Shopping cart & free delivery tracker
│   │   ├── checkout/           # Guest COD checkout
│   │   ├── fruits/             # Bulk fruit catalog & /request form
│   │   ├── jams/               # Artisanal jams catalog & [slug]
│   │   ├── order/[referenceNo] # Order confirmation page
│   │   └── request/[refNo]     # Bulk quote confirmation page
│   └── api/                    # Serverless API routes
├── components/
│   ├── admin/                  # Admin sidebar, editors, printable invoices
│   └── shop/                   # Hero parallax, variant picker, cards, marquee
├── docs/screenshots/           # High-resolution application screenshots
├── lib/                        # Auth, db, cart external store, validation, notifications
├── prisma/                     # Schema, migrations & seed script
└── styles/tokens.css           # Modern color palette & typography tokens
```

---

## 📄 License

This project is licensed under the MIT License.
