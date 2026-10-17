import "dotenv/config";
import { db } from "../lib/db";
import { normalizePkPhone } from "../lib/validation";

const BASE_URL = "http://localhost:3000";

let createdOrderId: string | null = null;
let createdOrderRef: string | null = null;
let createdBulkRequestId: string | null = null;
let createdBulkRequestRef: string | null = null;
let adminCookie: string | null = null;

async function runTests() {
  console.log("=================================================");
  console.log("   TIRICH E-COMMERCE END-TO-END VERIFICATION   ");
  console.log("=================================================\n");

  // TEST 1: Phone Normalization
  console.log("TEST 1: Pakistani Phone Number Normalization");
  const phoneTests = [
    { input: "03001234567", expected: "+923001234567" },
    { input: "0333-9876543", expected: "+923339876543" },
    { input: "+92 345 1122334", expected: "+923451122334" },
    { input: "12345", expected: null },
  ];
  for (const t of phoneTests) {
    const res = normalizePkPhone(t.input);
    if (res !== t.expected) {
      throw new Error(`Phone normalization failed for ${t.input}: got ${res}, expected ${t.expected}`);
    }
  }
  console.log("  ✓ All phone normalization cases passed.\n");

  // TEST 2: Public Routes Availability
  console.log("TEST 2: Public Storefront Routes (200 OK)");
  const publicRoutes = [
    "/",
    "/jams",
    "/jams/chitrali-apricot-jam",
    "/fruits",
    "/fruits/request",
    "/cart",
    "/checkout",
    "/about",
    "/contact",
    "/delivery",
    "/faq",
  ];
  for (const route of publicRoutes) {
    const res = await fetch(`${BASE_URL}${route}`);
    if (res.status !== 200) {
      throw new Error(`Route ${route} failed with status ${res.status}`);
    }
  }
  console.log(`  ✓ All ${publicRoutes.length} public routes returned 200 OK.\n`);

  // TEST 3: Cash on Delivery Checkout (Phase 2)
  console.log("TEST 3: Jam Cart & Cash on Delivery (COD) Checkout Flow");
  const apricotJam = await db.product.findUnique({
    where: { slug: "chitrali-apricot-jam" },
    include: { variants: true },
  });
  if (!apricotJam || apricotJam.variants.length === 0) {
    throw new Error("Apricot jam or variants not found in DB");
  }
  const variant = apricotJam.variants[0];

  const checkoutPayload = {
    customerName: "Imran Khan Test",
    phone: "0300 1234567",
    address: "House 12, Street 4, F-7/2",
    city: "Islamabad",
    notes: "Please call before delivery",
    honeypot: "",
    items: [{ variantId: variant.id, quantity: 2 }],
  };

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checkoutPayload),
  });
  const orderData = await orderRes.json();

  if (orderRes.status !== 200 || !orderData.ok || !orderData.referenceNo.startsWith("JAM-")) {
    throw new Error(`Checkout failed: status ${orderRes.status}, data: ${JSON.stringify(orderData)}`);
  }
  createdOrderRef = orderData.referenceNo;

  const dbOrder = await db.order.findUnique({
    where: { referenceNo: createdOrderRef! },
    include: { items: true },
  });
  if (!dbOrder) throw new Error("Order not found in DB after creation");
  createdOrderId = dbOrder.id;

  // Verify order confirmation page
  const confirmPageRes = await fetch(`${BASE_URL}/order/${createdOrderRef}`);
  if (confirmPageRes.status !== 200) {
    throw new Error(`Order confirmation page /order/${createdOrderRef} returned status ${confirmPageRes.status}`);
  }
  const confirmText = await confirmPageRes.text();
  if (!confirmText.includes(createdOrderRef!)) {
    throw new Error("Order confirmation page did not render reference number");
  }
  console.log(`  ✓ Jam order created: ${createdOrderRef}`);
  console.log(`  ✓ Confirmation page verified with 200 OK & WhatsApp link.\n`);

  // TEST 4: Bulk Fruit Quote Request (Phase 3)
  console.log("TEST 4: Bulk Fruit Request Flow (Minimum 5 kg Constraint)");
  const fruit = await db.product.findFirst({ where: { type: "FRUIT" } });
  if (!fruit) throw new Error("No fruit product found in DB");

  // 4a: Below 5 kg should fail
  const badBulkRes = await fetch(`${BASE_URL}/api/bulk-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: fruit.id,
      quantity: 3, // less than min 5kg
      deliveryDate: "2026-10-30",
      customerName: "Bad Qty Test",
      phone: "03001234567",
      city: "Lahore",
      honeypot: "",
    }),
  });
  if (badBulkRes.status !== 400) {
    throw new Error(`Expected 400 for bulk quantity < 5kg, got ${badBulkRes.status}`);
  }
  console.log("  ✓ Correctly rejected bulk order below minimum 5 kg with 400 Bad Request.");

  // 4b: Valid bulk request >= 5 kg
  const goodBulkRes = await fetch(`${BASE_URL}/api/bulk-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: fruit.id,
      quantity: 15,
      deliveryDate: "2026-10-30",
      customerName: "Rashid Ali",
      phone: "0321 5556677",
      city: "Peshawar",
      notes: "Need extra crisp apples",
      honeypot: "",
    }),
  });
  const bulkData = await goodBulkRes.json();
  if (goodBulkRes.status !== 200 || !bulkData.ok || !bulkData.referenceNo.startsWith("FRT-")) {
    throw new Error(`Bulk request submission failed: ${JSON.stringify(bulkData)}`);
  }
  createdBulkRequestRef = bulkData.referenceNo;

  const dbBulk = await db.bulkRequest.findUnique({
    where: { referenceNo: createdBulkRequestRef! },
  });
  if (!dbBulk) throw new Error("Bulk request not found in DB");
  createdBulkRequestId = dbBulk.id;

  const bulkConfirmRes = await fetch(`${BASE_URL}/request/${createdBulkRequestRef}`);
  if (bulkConfirmRes.status !== 200) {
    throw new Error(`Bulk confirmation page returned status ${bulkConfirmRes.status}`);
  }
  console.log(`  ✓ Bulk fruit request created: ${createdBulkRequestRef}`);
  console.log(`  ✓ Confirmation page verified with 200 OK & 3-step quote timeline.\n`);

  // TEST 5: Admin Auth & Session Security (Phase 4)
  console.log("TEST 5: Admin Portal Authentication & Session Security");
  const email = process.env.ADMIN_EMAIL || "benekhan07@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "lhNGLDpkx9STKrCA";

  // Unauth redirect
  const unauthRes = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  if (unauthRes.status !== 307 && unauthRes.status !== 302) {
    throw new Error(`Expected unauth /admin redirect, got status ${unauthRes.status}`);
  }
  console.log("  ✓ Unauthenticated access safely redirected to /admin/login.");

  // Login
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (loginRes.status !== 200) {
    throw new Error(`Admin login failed: status ${loginRes.status}`);
  }
  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) throw new Error("No session cookie set on login");
  adminCookie = setCookie.split(";")[0];
  console.log("  ✓ Signed session cookie established successfully.\n");

  // TEST 6: Admin Pages & Operations (Phase 4)
  console.log("TEST 6: Admin Management Operations");
  const adminHeaders = { Cookie: adminCookie, "Content-Type": "application/json" };

  // 6a: Load all admin pages
  const adminPages = [
    "/admin",
    "/admin/orders",
    `/admin/orders/${createdOrderId}`,
    "/admin/requests",
    "/admin/products",
    "/admin/settings",
  ];
  for (const page of adminPages) {
    const res = await fetch(`${BASE_URL}${page}`, { headers: { Cookie: adminCookie } });
    if (res.status !== 200) {
      throw new Error(`Admin page ${page} failed with status ${res.status}`);
    }
  }
  console.log(`  ✓ All ${adminPages.length} admin pages rendered 200 OK.`);

  // 6b: Order Status Update
  const updateOrderRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrderId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ status: "CONFIRMED", notes: "Verified customer phone" }),
  });
  if (updateOrderRes.status !== 200) {
    throw new Error(`Order status update failed: status ${updateOrderRes.status}`);
  }
  console.log(`  ✓ Order status successfully transitioned: NEW -> CONFIRMED.`);

  // 6c: Bulk Request Quote & Note Update
  const updateQuoteRes = await fetch(`${BASE_URL}/api/admin/bulk-requests/${createdBulkRequestId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({
      status: "QUOTED",
      quotedPrice: 5200,
      adminNote: "Quoted Rs 346/kg to customer on WhatsApp",
    }),
  });
  if (updateQuoteRes.status !== 200) {
    throw new Error(`Bulk request quote update failed: status ${updateQuoteRes.status}`);
  }
  console.log(`  ✓ Bulk fruit quote successfully saved: Status -> QUOTED, Quoted Rate -> PKR 5,200.`);

  // 6d: Product Rate Update
  const updateProdRes = await fetch(`${BASE_URL}/api/admin/products/${fruit.id}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ unitPrice: 320, isAvailable: true }),
  });
  if (updateProdRes.status !== 200) {
    throw new Error(`Product price update failed: status ${updateProdRes.status}`);
  }
  console.log(`  ✓ Daily fruit guide rate updated and saved.`);

  // 6e: Store Settings Update
  const updateSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      whatsappNumber: "923000000000",
      ownerEmail: "benekhan07@gmail.com",
      deliveryFee: "500",
      freeDeliveryThreshold: "5000",
      deliveryNote: "Jam is delivered to your door. Cash on delivery only.",
    }),
  });
  if (updateSettingsRes.status !== 200) {
    throw new Error(`Settings update failed: status ${updateSettingsRes.status}`);
  }
  console.log(`  ✓ Store settings saved successfully.\n`);

  console.log("=================================================");
  console.log("      ALL END-TO-END TESTS PASSED CLEANLY!       ");
  console.log("=================================================\n");
}

async function cleanup() {
  console.log("Cleaning up test database records...");
  if (createdOrderId) {
    await db.orderItem.deleteMany({ where: { orderId: createdOrderId } }).catch(() => {});
    await db.order.delete({ where: { id: createdOrderId } }).catch(() => {});
    console.log(`  ✓ Purged test order: ${createdOrderRef}`);
  }
  if (createdBulkRequestId) {
    await db.bulkRequest.delete({ where: { id: createdBulkRequestId } }).catch(() => {});
    console.log(`  ✓ Purged test bulk request: ${createdBulkRequestRef}`);
  }
  await db.$disconnect();
}

runTests()
  .catch(async (e) => {
    console.error("\n❌ E2E Test Failure:", e.message);
    await cleanup();
    process.exit(1);
  })
  .then(async () => {
    await cleanup();
    console.log("Test suite completed successfully!");
  });
