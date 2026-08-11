import type { ModulePage } from "../types";

export const feeStructurePage: ModulePage = {
  slug: "fee-structure",
  title: "Fee Structure",
  tagline: "Plans, installments, and clear parent-facing totals.",
  summary:
    "Define fee heads, class bands, and payment schedules once. Parents see what they owe without spreadsheet archaeology.",
  audience: "School admins, accounts staff",
  readingMinutes: 4,
  icon: "wallet",
  hero: {
    label: "Fee plan builder",
    aspect: "16 / 9",
  },
  highlights: [
    "Fee heads mapped to classes and terms",
    "Installments parents can understand",
    "Foundation for receipts and balances",
  ],
  sections: [
    {
      heading: "Structure first",
      body: "Define what the school charges once. Map heads to classes and terms. Installments stay explicit so collections teams and parents share one truth.",
      media: {
        label: "Fee head matrix",
        aspect: "4 / 3",
      },
    },
    {
      heading: "Coming later",
      body: "Full fees and spending analytics land in a later phase. The structure module is the foundation receipts and parent app balances build on.",
      media: {
        label: "Parent totals preview",
        aspect: "16 / 10",
      },
    },
  ],
};
