import type { Metadata } from "next";
import StaticPageView from "@/components/shop/StaticPageView";
import { home, pages } from "@/lib/content";
import { getSettings, whatsappLink } from "@/lib/products";

export const revalidate = 60;

export const metadata: Metadata = {
  title: pages.contact.title,
  description: pages.contact.description,
};

export default async function ContactPage() {
  const settings = await getSettings();
  const phone = "+92 343 6818227";
  const email = "hamadsultan662@gmail.com";
  const name = "Hamad Sultan";

  return (
    <StaticPageView page={pages.contact}>
      <div
        style={{
          marginTop: "var(--space-6)",
          padding: "var(--space-6)",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Contact Person
          </div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-forest)", marginTop: "2px" }}>
            {name}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Phone & WhatsApp
          </div>
          <div style={{ fontSize: "var(--text-base)", marginTop: "2px" }}>
            <a href="tel:+923436818227" style={{ color: "var(--color-forest)", textDecoration: "underline", fontWeight: 600 }}>
              {phone}
            </a>
          </div>
        </div>

        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Email
          </div>
          <div style={{ fontSize: "var(--text-base)", marginTop: "2px" }}>
            <a href={`mailto:${email}`} style={{ color: "var(--color-forest)", textDecoration: "underline", fontWeight: 600 }}>
              {email}
            </a>
          </div>
        </div>

        <div style={{ marginTop: "var(--space-2)", display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <a
            className="btn btn-primary"
            href={whatsappLink(settings.whatsappNumber || "923436818227", home.whatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {home.contactCta}
          </a>
          <a
            className="btn btn-outline"
            href={`mailto:${email}`}
          >
            Send Email
          </a>
        </div>
      </div>
    </StaticPageView>
  );
}
