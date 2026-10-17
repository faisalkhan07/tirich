import type { Metadata } from "next";
import StaticPageView from "@/components/shop/StaticPageView";
import { pages } from "@/lib/content";

export const metadata: Metadata = { title: pages.about.title, description: pages.about.description };

export default function AboutPage() {
  return <StaticPageView page={pages.about} />;
}
