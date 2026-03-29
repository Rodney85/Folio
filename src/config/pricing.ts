export type PricingTier = {
  id: string; // Identifier for logic (e.g., 'og', 'pro')
  dodoProductIdEnvVar: string; // The import.meta.env key to use
  name: string;
  description: string;
  priceAmount: number; // e.g., 99.00 or 9.00
  priceCurrency: string; // e.g., '$'
  billingPeriod: string; // e.g., 'Lifetime', 'per month'
  features: string[];
  ctaText: string;
  isPopular?: boolean;
};

export const pricingConfig: PricingTier[] = [
  {
    id: "pro",
    dodoProductIdEnvVar: "VITE_DODO_PRODUCT_PRO_MONTHLY",
    name: "Founder Tier",
    description: "Monetize your builds & track performance.",
    priceAmount: 5.99,
    priceCurrency: "$",
    billingPeriod: "month",
    features: [
      "Access up to 5 cars", 
      "Basic stats", 
      "Ad-Supported profile"
    ],
    ctaText: "Upgrade to Founder",
  },
  {
    id: "og",
    dodoProductIdEnvVar: "VITE_DODO_PRODUCT_OG_LIFETIME",
    name: "OG Tier",
    description: "Launch price — everything in Pro, forever.",
    priceAmount: 49,
    priceCurrency: "$",
    billingPeriod: "one-time",
    features: [
      "Unlimited cars",
      "Affiliate links",
      "Analytics dashboard",
      "Ad-Free profile",
      "Lifetime Access",
    ],
    ctaText: "Get Lifetime Access",
    isPopular: true,
  },
];

// Helper to reliably get the product ID from env config
export const getProductId = (tierId: string): string => {
  if (tierId === 'og') {
    const id = import.meta.env.VITE_DODO_PRODUCT_OG_LIFETIME;
    if (!id) throw new Error('VITE_DODO_PRODUCT_OG_LIFETIME is not configured — check your .env file');
    return id;
  }
  if (tierId === 'pro') {
    const id = import.meta.env.VITE_DODO_PRODUCT_PRO_MONTHLY;
    if (!id) throw new Error('VITE_DODO_PRODUCT_PRO_MONTHLY is not configured — check your .env file');
    return id;
  }
  throw new Error(`Unknown pricing tier: ${tierId}`);
};
