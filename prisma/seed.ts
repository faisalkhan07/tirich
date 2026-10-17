import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/password";
import { defaultSettings } from "../lib/content";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const db = new PrismaClient({ adapter });

const jams = [
  {
    name: "Chitrali Apricot Jam",
    slug: "chitrali-apricot-jam",
    images: ["/images/jam-apricot.jpg"],
    description: "Slow-cooked from sun-ripened Chitral apricots.",
    ingredients: "Apricots, sugar, lemon juice",
    shelfLife: "12 months unopened. Refrigerate after opening.",
    isFeatured: true,
    variants: [
      { label: "250g", price: 650 },
      { label: "500g", price: 1200 },
    ],
  },
  {
    name: "Mulberry Jam",
    slug: "mulberry-jam",
    images: ["/images/jam-mulberry.jpg"],
    description: "Rich and sweet jam from dried-style Chitrali mulberries.",
    ingredients: "Mulberries, sugar, lemon juice",
    shelfLife: "12 months unopened. Refrigerate after opening.",
    isFeatured: true,
    variants: [
      { label: "250g", price: 700 },
      { label: "500g", price: 1300 },
    ],
  },
  {
    name: "Apple Jam",
    slug: "apple-jam",
    images: ["/images/jam-apple.jpg"],
    description: "Made from crisp Chitrali apples with a hint of cinnamon.",
    ingredients: "Apples, sugar, lemon juice, cinnamon",
    shelfLife: "12 months unopened. Refrigerate after opening.",
    isFeatured: true,
    variants: [
      { label: "250g", price: 600 },
      { label: "500g", price: 1100 },
    ],
  },
];

// Sample guide prices only. The owner edits real prices in admin.
const fruits = [
  { name: "Chitrali Apples", slug: "chitrali-apples", unitPrice: 300, seasonNote: "Sep to Nov", images: ["/images/fruit-apples.jpg"] },
  { name: "Apricots", slug: "apricots", unitPrice: 450, seasonNote: "Jun to Jul", images: ["/images/fruit-apricots.jpg"] },
  { name: "Mulberries", slug: "mulberries", unitPrice: 600, seasonNote: "May to Jun", images: ["/images/fruit-mulberries.jpg"] },
  { name: "Cherries", slug: "cherries", unitPrice: 900, seasonNote: "Jun", images: ["/images/fruit-cherries.jpg"] },
  { name: "Pomegranates", slug: "pomegranates", unitPrice: 500, seasonNote: "Oct to Dec", images: ["/images/fruit-pomegranates.jpg"] },
];

async function main() {
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  for (const jam of jams) {
    const { variants, ...data } = jam;
    const product = await db.product.upsert({
      where: { slug: jam.slug },
      update: { images: data.images },
      create: { ...data, type: "JAM" },
    });
    if ((await db.productVariant.count({ where: { productId: product.id } })) === 0) {
      await db.productVariant.createMany({
        data: variants.map((v, i) => ({ ...v, productId: product.id, sortOrder: i })),
      });
    }
  }

  for (const fruit of fruits) {
    await db.product.upsert({
      where: { slug: fruit.slug },
      update: { images: fruit.images },
      create: {
        ...fruit,
        type: "FRUIT",
        description: `${fruit.name} grown in Chitral. Sold in bulk only.`,
        origin: "Chitral",
        unit: "KG",
        minQty: 5,
      },
    });
  }

  const email = process.env.ADMIN_EMAIL ?? "owner@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: hashPassword(password) },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
