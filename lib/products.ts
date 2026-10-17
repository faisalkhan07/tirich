import { db } from "./db";
import { defaultSettings } from "./content";

// Public catalog queries. Inactive products are never returned.

export async function getJams(opts: { featured?: boolean } = {}) {
  return db.product.findMany({
    where: { type: "JAM", isActive: true, ...(opts.featured ? { isFeatured: true } : {}) },
    include: { variants: { orderBy: { price: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getJamBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, type: "JAM", isActive: true },
    include: { variants: { orderBy: [{ sortOrder: "asc" }, { price: "asc" }] } },
  });
}

export async function getFruits() {
  return db.product.findMany({
    where: { type: "FRUIT", isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getSettings(): Promise<typeof defaultSettings> {
  const rows = await db.setting.findMany();
  const merged: Record<string, string> = { ...defaultSettings };
  for (const row of rows) merged[row.key] = row.value;
  return merged as typeof defaultSettings;
}

export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
