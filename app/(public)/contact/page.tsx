import type { Metadata } from "next";
import StaticPageView from "@/components/shop/StaticPageView";
import { home, pages } from "@/lib/content";
import { getSettings, whatsappLink } from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: pages.contact.title,
  description: pages.contact.description,
};

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <StaticPageView page={pages.contact}>
      <p>
        <a
          className="btn btn-primary"
          href={whatsappLink(settings.whatsappNumber, home.whatsappGreeting)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {home.contactCta}
        </a>
      </p>
      <p>
        Email: <a href={`mailto:${settings.ownerEmail}`}>{settings.ownerEmail}</a>
      </p>
    </StaticPageView>
  );
}
