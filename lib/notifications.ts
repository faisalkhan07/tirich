import { formatPKR } from "./format";
import { getSettings } from "./products";

type OrderItemSnapshot = {
  nameSnapshot: string;
  labelSnapshot: string;
  priceSnapshot: number;
  quantity: number;
};

type OrderData = {
  id: string;
  referenceNo: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItemSnapshot[];
};

type BulkRequestData = {
  id: string;
  referenceNo: string;
  customerName: string;
  phone: string;
  city: string;
  quantity: number;
  deliveryDate: Date | string;
  notes: string | null;
  product: {
    name: string;
    unitPrice: number | null;
  };
};

/**
 * Dispatches notifications (Resend Email & Zapier Webhook) for a new COD order.
 * Fails safely and non-blockingly.
 */
export async function notifyNewOrder(order: OrderData): Promise<void> {
  const settings = await getSettings().catch(() => ({ ownerEmail: process.env.ADMIN_EMAIL || "owner@example.com" }));
  const ownerEmail = settings.ownerEmail || process.env.ADMIN_EMAIL || "benekhan07@gmail.com";

  const totalJars = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsText = order.items
    .map((i) => `• ${i.quantity}x ${i.nameSnapshot} (${i.labelSnapshot}) - ${formatPKR(i.priceSnapshot * i.quantity)}`)
    .join("\n");

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee;">${i.quantity}x ${i.nameSnapshot} (${i.labelSnapshot})</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPKR(i.priceSnapshot * i.quantity)}</td>
        </tr>`
    )
    .join("");

  // 1. Resend Email Alert
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Tirich Orders <onboarding@resend.dev>",
          to: [ownerEmail],
          subject: `📦 [New Order] ${order.referenceNo} - ${formatPKR(order.total)} (COD)`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #10301A; padding: 20px;">
              <h2 style="color: #10301A; margin-bottom: 4px;">New Jam Order Received!</h2>
              <p style="color: #666; font-size: 14px; margin-top: 0;">Payment: Cash on Delivery (COD)</p>

              <div style="background: #f7f3e8; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 8px;"><strong>Reference:</strong> <span style="font-family: monospace; font-size: 16px; color: #10301A;">${order.referenceNo}</span></p>
                <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${order.customerName}</p>
                <p style="margin: 0 0 8px;"><strong>Phone:</strong> <a href="https://wa.me/${order.phone.replace(/\D/g, "")}">${order.phone}</a></p>
                <p style="margin: 0 0 8px;"><strong>City:</strong> ${order.city}</p>
                <p style="margin: 0 0 8px;"><strong>Address:</strong> ${order.address}</p>
                ${order.notes ? `<p style="margin: 0; color: #d97706;"><strong>Customer Notes:</strong> ${order.notes}</p>` : ""}
              </div>

              <h3>Ordered Items (${totalJars} jars)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background: #f0f0f0; text-align: left;">
                    <th style="padding: 6px 12px;">Item</th>
                    <th style="padding: 6px 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 8px 12px; font-weight: bold;">Subtotal:</td>
                    <td style="padding: 8px 12px; text-align: right;">${formatPKR(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 12px;">Delivery Fee:</td>
                    <td style="padding: 8px 12px; text-align: right;">${order.deliveryFee === 0 ? "FREE" : formatPKR(order.deliveryFee)}</td>
                  </tr>
                  <tr style="background: #e6f4ea; font-size: 16px;">
                    <td style="padding: 10px 12px; font-weight: bold; color: #10301A;">Total to Collect (COD):</td>
                    <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #10301A;">${formatPKR(order.total)}</td>
                  </tr>
                </tbody>
              </table>

              <p style="font-size: 12px; color: #888;">Manage this order in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/orders/${order.id}">Tirich Admin Portal</a>.</p>
            </div>
          `,
        }),
      });
      console.log(`[Notification] Resend email dispatched for order ${order.referenceNo} to ${ownerEmail}`);
    } catch (err) {
      console.error("[Notification] Resend order email failed:", err);
    }
  } else {
    console.log(`[Notification] RESEND_API_KEY not configured. Order alert for ${order.referenceNo} logged:\nCustomer: ${order.customerName} (${order.phone})\nTotal: ${formatPKR(order.total)}\nItems:\n${itemsText}`);
  }

  // 2. Zapier / Make Webhook
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL?.trim();
  if (zapierUrl) {
    try {
      await fetch(zapierUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order.created",
          orderId: order.id,
          referenceNo: order.referenceNo,
          customerName: order.customerName,
          phone: order.phone,
          address: order.address,
          city: order.city,
          notes: order.notes,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          totalJars,
          items: order.items,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log(`[Notification] Zapier webhook dispatched for order ${order.referenceNo}`);
    } catch (err) {
      console.error("[Notification] Zapier webhook failed:", err);
    }
  }
}

/**
 * Dispatches notifications (Resend Email & Zapier Webhook) for a new bulk fruit quote request.
 * Fails safely and non-blockingly.
 */
export async function notifyNewBulkRequest(request: BulkRequestData): Promise<void> {
  const settings = await getSettings().catch(() => ({ ownerEmail: process.env.ADMIN_EMAIL || "owner@example.com" }));
  const ownerEmail = settings.ownerEmail || process.env.ADMIN_EMAIL || "benekhan07@gmail.com";

  const targetDateStr = new Date(request.deliveryDate).toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Resend Email Alert
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Tirich Orders <onboarding@resend.dev>",
          to: [ownerEmail],
          subject: `🍏 [Fruit Quote Request] ${request.referenceNo} - ${request.quantity} KG of ${request.product.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #10301A; padding: 20px;">
              <h2 style="color: #10301A; margin-bottom: 4px;">New Bulk Fruit Quote Request!</h2>
              <p style="color: #666; font-size: 14px; margin-top: 0;">Customer is awaiting today's fresh harvest quote.</p>

              <div style="background: #f7f3e8; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 8px;"><strong>Reference:</strong> <span style="font-family: monospace; font-size: 16px; color: #10301A;">${request.referenceNo}</span></p>
                <p style="margin: 0 0 8px;"><strong>Fruit:</strong> <span style="font-size: 16px; font-weight: bold;">${request.product.name}</span></p>
                <p style="margin: 0 0 8px;"><strong>Requested Quantity:</strong> <span style="color: #10301A; font-weight: bold; font-size: 16px;">${request.quantity} KG</span></p>
                <p style="margin: 0 0 8px;"><strong>Target Delivery Date:</strong> ${targetDateStr}</p>
                <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${request.customerName}</p>
                <p style="margin: 0 0 8px;"><strong>Phone / WhatsApp:</strong> <a href="https://wa.me/${request.phone.replace(/\D/g, "")}">${request.phone}</a></p>
                <p style="margin: 0 0 8px;"><strong>Destination City:</strong> ${request.city}</p>
                ${request.notes ? `<p style="margin: 0; color: #d97706;"><strong>Customer Notes:</strong> ${request.notes}</p>` : ""}
              </div>

              <div style="margin-top: 25px;">
                <a href="https://wa.me/${request.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${request.customerName}! This is Tirich regarding your bulk request ${request.referenceNo} for ${request.quantity} KG of ${request.product.name}.`)}"
                   style="background: #25d366; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  💬 Open WhatsApp Chat with Customer
                </a>
              </div>

              <p style="font-size: 12px; color: #888; margin-top: 25px;">Manage this quote in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/requests">Tirich Admin Portal</a>.</p>
            </div>
          `,
        }),
      });
      console.log(`[Notification] Resend email dispatched for bulk request ${request.referenceNo} to ${ownerEmail}`);
    } catch (err) {
      console.error("[Notification] Resend bulk request email failed:", err);
    }
  } else {
    console.log(`[Notification] RESEND_API_KEY not configured. Bulk request alert for ${request.referenceNo} logged:\nFruit: ${request.product.name} (${request.quantity} KG)\nCustomer: ${request.customerName} (${request.phone})\nCity: ${request.city}\nDate: ${targetDateStr}`);
  }

  // 2. Zapier / Make Webhook
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL?.trim();
  if (zapierUrl) {
    try {
      await fetch(zapierUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "bulk_request.created",
          requestId: request.id,
          referenceNo: request.referenceNo,
          customerName: request.customerName,
          phone: request.phone,
          city: request.city,
          fruitName: request.product.name,
          quantityKg: request.quantity,
          deliveryDate: request.deliveryDate,
          notes: request.notes,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log(`[Notification] Zapier webhook dispatched for bulk request ${request.referenceNo}`);
    } catch (err) {
      console.error("[Notification] Zapier webhook failed:", err);
    }
  }
}
