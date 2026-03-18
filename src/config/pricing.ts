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
  const isProd = import.meta.env.PROD; 
  if (tierId === 'og') {
    return isProd ? import.meta.env.VITE_DODO_PRODUCT_OG_LIFETIME : (import.meta.env.VITE_DODO_PRODUCT_OG_LIFETIME || 'pdt_0945z8b0mngv1ksabchpbgq11');
  }
  if (tierId === 'pro') {
    return isProd ? import.meta.env.VITE_DODO_PRODUCT_PRO_MONTHLY : (import.meta.env.VITE_DODO_PRODUCT_PRO_MONTHLY || 'pdt_0h6n66rbsmsnb581cv15w462j');
  }
  return '';
};
