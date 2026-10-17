import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/format";
import { getSettings, whatsappLink } from "@/lib/products";
import styles from "./request.module.css";

type Props = {
  params: Promise<{ referenceNo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { referenceNo } = await params;
  return {
    title: `Bulk Request ${referenceNo} Received`,
    description: `Your bulk fruit request ${referenceNo} has been received by Tirich.`,
  };
}

export default async function BulkRequestConfirmationPage({ params }: Props) {
  const { referenceNo } = await params;

  const [request, settings] = await Promise.all([
    db.bulkRequest.findUnique({
      where: { referenceNo },
      include: { product: true },
    }),
    getSettings(),
  ]);

  if (!request) {
    notFound();
  }

  const fruit = request.product;
  const formattedDeliveryDate = new Date(request.deliveryDate).toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const waMessage = `Hello Tirich! I submitted a bulk request (${request.referenceNo}) for ${request.quantity} kg of ${fruit.name} to ${request.city}. Please let me know today's fresh harvest rate.`;
  const waUrl = whatsappLink(settings.whatsappNumber, waMessage);

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)", maxWidth: "800px" }}>
      <div className={styles.confirmedCard}>
        {/* Header Block */}
        <div className={styles.headerBlock}>
          <div className={styles.successIcon}>🌿</div>
          <h1 className={styles.title}>Bulk Request Received!</h1>
          <p className={styles.lead}>
            Thank you, <strong>{request.customerName}</strong>. Your request for fresh orchard harvest
            has been sent to our team in Chitral.
          </p>

          <div className={styles.refBox}>
            <span className={styles.refLabel}>Request Reference Number</span>
            <strong className={styles.refCode}>{request.referenceNo}</strong>
          </div>
        </div>

        {/* Next Steps Guide */}
        <div className={styles.timelineBlock}>
          <h2 className={styles.timelineHeading}>What Happens Next?</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <div>
                <strong>Orchard Review</strong>
                <p>We check morning harvest volume and fruit quality in Susoom Valley.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <div>
                <strong>WhatsApp / Phone Quote</strong>
                <p>The owner will contact you directly with today&apos;s locked price.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <div>
                <strong>Dispatched Fresh</strong>
                <p>Once you approve the price, your crates are packed and dispatched.</p>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Direct Connect */}
        <div className={styles.waSection}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-lime ${styles.waBtn}`}
          >
            <span>💬</span> Message Owner on WhatsApp
          </a>
          <p className={styles.waHint}>
            Have an urgent requirement or want an immediate price quote? Tap above to chat with us directly on WhatsApp.
          </p>
        </div>

        {/* Request Summary */}
        <div className={styles.detailsBlock}>
          <h2 className={styles.sectionTitle}>Requested Harvest</h2>
          <div className={styles.fruitRow}>
            <div className={styles.fruitMedia}>
              {fruit.images[0] ? (
                <Image
                  src={fruit.images[0]}
                  alt={fruit.name}
                  width={80}
                  height={80}
                  className={styles.fruitImg}
                />
              ) : (
                <span>🍎</span>
              )}
            </div>
            <div className={styles.fruitInfo}>
              <strong className={styles.fruitName}>{fruit.name}</strong>
              <span className={styles.fruitMeta}>Origin: {fruit.origin || "Chitral"}</span>
              {fruit.unitPrice && (
                <span className={styles.fruitGuide}>
                  Guide Rate: ~{formatPKR(fruit.unitPrice)} / kg
                </span>
              )}
            </div>
            <div className={styles.qtyBox}>
              <span className={styles.qtyLabel}>Quantity</span>
              <strong className={styles.qtyValue}>{request.quantity} KG</strong>
            </div>
          </div>
        </div>

        {/* Delivery & Customer Info */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>Delivery Details</h3>
            <p><strong>Customer:</strong> {request.customerName}</p>
            <p><strong>Contact Phone:</strong> {request.phone}</p>
            <p><strong>Destination City:</strong> {request.city}</p>
            <p><strong>Target Delivery:</strong> {formattedDeliveryDate}</p>
            {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
          </div>

          <div className={styles.infoCard}>
            <h3>Request Status</h3>
            <p className={styles.statusRow}>
              <span>Current Status:</span>
              <span className={styles.statusBadge}>{request.status}</span>
            </p>
            <p className={styles.statusExpl}>
              No upfront payment required. Final rate will be agreed before packing.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={styles.footerNav}>
          <Link href="/fruits" className="btn btn-outline">
            ← Browse More Fruits
          </Link>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
