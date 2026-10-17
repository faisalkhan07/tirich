import type { Metadata } from "next";
import { getFruits } from "@/lib/products";
import BulkRequestForm from "@/components/shop/BulkRequestForm";

export const metadata: Metadata = {
  title: "Request Bulk Fruit",
  description:
    "Order fresh Chitral orchard fruit in bulk (minimum 5 kg). Submit your request and our owner will contact you with today's locked price.",
};

type Props = {
  searchParams: Promise<{ fruit?: string }>;
};

export default async function BulkRequestPage({ searchParams }: Props) {
  const { fruit: fruitSlug } = await searchParams;
  const fruits = await getFruits();

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className="page-title">Bulk Fruit Order Request</h1>
      <p className="page-lead">
        Pure orchard fruit direct from Chitral. Minimum order: 5 kg per fruit.
      </p>

      <BulkRequestForm fruits={fruits} initialFruitSlug={fruitSlug} />
    </div>
  );
}
