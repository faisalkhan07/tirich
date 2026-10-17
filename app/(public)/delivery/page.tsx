import type { Metadata } from "next";
import StaticPageView from "@/components/shop/StaticPageView";
import { pages } from "@/lib/content";
import { getSettings } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: pages.delivery.title,
  description: pages.delivery.description,
};

export default async function DeliveryPage() {
  const settings = await getSettings();
  return (
    <StaticPageView page={pages.delivery}>
      <h2>Delivery fee</h2>
      <p>
        Jam delivery is Rs {Number(settings.deliveryFee).toLocaleString("en-PK")}. It is free on
        orders above Rs {Number(settings.freeDeliveryThreshold).toLocaleString("en-PK")}.
      </p>
      <p>{settings.deliveryNote}</p>
    </StaticPageView>
  );
}
