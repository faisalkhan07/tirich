import type { Metadata } from "next";
import FruitCard from "@/components/shop/FruitCard";
import { catalog } from "@/lib/content";
import { getFruits } from "@/lib/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fruits",
  description: "Fresh Chitral fruit in bulk, minimum 5 kg. Send a request and we confirm the price.",
};

export default async function FruitsPage() {
  const fruits = await getFruits();
  return (
    <div className="container">
      <h1 className="page-title">{catalog.fruitsTitle}</h1>
      <p className="page-lead">{catalog.fruitsLead}</p>
      {fruits.length ? (
        <div className="card-grid">
          {fruits.map((fruit) => (
            <FruitCard key={fruit.id} fruit={fruit} />
          ))}
        </div>
      ) : (
        <p className="empty">{catalog.fruitsEmpty}</p>
      )}
    </div>
  );
}
