import type { Metadata } from "next";
import StaticPageView from "@/components/shop/StaticPageView";
import { pages } from "@/lib/content";

export const metadata: Metadata = { title: pages.faq.title, description: pages.faq.description };

export default function FaqPage() {
  return <StaticPageView page={pages.faq} />;
}
