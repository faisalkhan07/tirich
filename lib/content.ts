// All site copy lives here so the design and wording can change in one place.

export const brand = {
  name: "Tirich",
  tagline: "Fruit and jam from the foot of Tirich Mir, Chitral.",
  origin: "Chitral, Pakistan",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Jams", href: "/jams" },
  { label: "Fruits", href: "/fruits" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks = [
  { label: "Delivery", href: "/delivery" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const defaultSettings = {
  whatsappNumber: "923436818227",
  ownerEmail: "hamadsultan662@gmail.com",
  deliveryNote: "Jam is delivered to your door. Cash on delivery only.",
  deliveryFee: "500",
  freeDeliveryThreshold: "5000",
};

export const home = {
  heroEyebrow: "Fresh from",
  heroScript: "Chitral",
  heroText:
    "Orchard fruit and homemade jam, picked and packed in the mountains of Chitral.",
  heroCtaJam: "Fresh jams",
  heroCtaFruit: "Bulk fruit",
  bigWord: "TIRICH",
  marquee: [
    "Apples",
    "Apricots",
    "Mulberries",
    "Pears",
    "Cherries",
    "Pomegranates",
    "Walnuts",
    "Chilghoza",
    "Kilao",
    "Blackberry Jam",
    "Fresh jams",
  ],
  featuredJamsTitle: "Featured jams",
  featuredJamsLead: "Small-batch jam, delivered to your door. Pay on delivery.",
  availableFruitsTitle: "Fruit available in bulk",
  availableFruitsLead:
    "Sold by the kg, minimum 5 kg. Prices change daily, so we confirm every order by WhatsApp or call.",
  contactTitle: "Talk to us on WhatsApp",
  contactText: "Ask about bulk fruit, jam orders or delivery. We usually reply the same day.",
  contactCta: "Chat on WhatsApp",
  whatsappGreeting: "Hello Tirich, I would like to ask about ",
};

export const catalog = {
  jamsTitle: "Jams",
  jamsLead: "Made from Chitral fruit. Choose a size and order online.",
  jamsEmpty: "No jams are available right now. Please check back soon.",
  fruitsTitle: "Fruits",
  fruitsLead:
    "Fresh Chitral fruit sold in bulk only. Prices are approximate guides. The owner confirms the final price and availability with you.",
  fruitsEmpty: "No fruit is listed right now. Please check back soon.",
  priceGuideNote: "Approximate price guide",
  unavailable: "Currently unavailable",
  requestBulk: "Request bulk",
  minQtyLabel: "Minimum",
  originLabel: "Origin",
  seasonLabel: "Season",
};

export type StaticPage = {
  title: string;
  description: string;
  sections: { heading?: string; body: string }[];
};

export const pages: Record<"about" | "contact" | "delivery" | "faq", StaticPage> = {
  about: {
    title: "About Tirich",
    description: "Fruit and jam from Chitral, grown and made at the foot of Tirich Mir.",
    sections: [
      {
        body: "Tirich brings fruit and jam from Chitral, in northern Pakistan, to your table. Our fruit grows in orchards in the valleys beneath Tirich Mir, the highest peak of the Hindu Kush.",
      },
      {
        heading: "Jam",
        body: "We make small batches of apricot, mulberry and apple jam from the same fruit we sell. No shortcuts, just fruit, sugar and lemon.",
      },
      {
        heading: "Bulk fruit",
        body: "Restaurants, shops and families can order fruit in bulk. Prices change daily with the harvest, so we confirm every order personally.",
      },
    ],
  },
  contact: {
    title: "Contact",
    description: "Contact Tirich by WhatsApp, phone or email.",
    sections: [
      {
        body: "The fastest way to reach us is WhatsApp. Send a message or tap the button below.",
      },
    ],
  },
  delivery: {
    title: "Delivery",
    description: "Delivery information for Tirich jam and bulk fruit orders.",
    sections: [
      {
        heading: "Jam orders",
        body: "Jam is delivered to your door anywhere in Pakistan. Payment is cash on delivery.",
      },
      {
        heading: "Bulk fruit",
        body: "Fruit is delivered on the date we agree with you by WhatsApp or call. Final price and delivery are confirmed before dispatch.",
      },
    ],
  },
  faq: {
    title: "FAQ",
    description: "Answers to common questions about Tirich orders and delivery.",
    sections: [
      {
        heading: "How do I pay?",
        body: "Jam orders are cash on delivery. Bulk fruit payment is arranged with you when we confirm the order.",
      },
      {
        heading: "Why is fruit not priced at checkout?",
        body: "Bulk fruit prices change daily. You send a request and we confirm the price and availability.",
      },
      {
        heading: "What is the minimum fruit order?",
        body: "5 kg per request.",
      },
      {
        heading: "How long does jam last?",
        body: "Unopened jars keep for 12 months. Keep opened jars in the fridge.",
      },
    ],
  },
};
