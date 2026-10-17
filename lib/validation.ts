import { z } from "zod";

/**
 * Normalizes Pakistani mobile phone numbers to standard format (e.g., +923XXXXXXXXX).
 * Accepts: 03001234567, 0300-1234567, +92 300 1234567, 923001234567, etc.
 */
export function normalizePkPhone(phone: string): string | null {
  // Remove all non-digits except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+92")) {
    cleaned = cleaned.substring(1); // "923001234567"
  } else if (cleaned.startsWith("0092")) {
    cleaned = cleaned.substring(2); // "923001234567"
  } else if (cleaned.startsWith("03")) {
    cleaned = "92" + cleaned.substring(1); // "923001234567"
  } else if (cleaned.startsWith("3") && cleaned.length === 10) {
    cleaned = "92" + cleaned;
  }

  // Must be 12 digits starting with 923...
  if (/^923\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

export const orderItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Max 50 items per jar"),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name (at least 2 characters)"),
  phone: z.string().trim().refine((val) => normalizePkPhone(val) !== null, {
    message: "Please enter a valid Pakistani mobile number (e.g. 0300 1234567)",
  }),
  address: z.string().trim().min(5, "Please enter your complete street address"),
  city: z.string().trim().min(2, "Please enter your city"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
  honeypot: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const bulkRequestSchema = z.object({
  productId: z.string().min(1, "Please select a fruit"),
  quantity: z.number().int().min(1, "Quantity must be at least 1 kg"),
  deliveryDate: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, {
    message: "Requested delivery date must be today or in the future",
  }),
  customerName: z.string().trim().min(2, "Please enter your full name (at least 2 characters)"),
  phone: z.string().trim().refine((val) => normalizePkPhone(val) !== null, {
    message: "Please enter a valid Pakistani mobile number (e.g. 0300 1234567)",
  }),
  city: z.string().trim().min(2, "Please enter your delivery city"),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
  honeypot: z.string().optional(),
});

export type BulkRequestInput = z.infer<typeof bulkRequestSchema>;
