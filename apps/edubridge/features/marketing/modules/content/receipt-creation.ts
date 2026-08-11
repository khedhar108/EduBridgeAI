import type { ModulePage } from "../types";

export const receiptCreationPage: ModulePage = {
  slug: "receipt-creation",
  title: "Receipt Creation",
  tagline: "Printable receipts that match your fee ledger.",
  summary:
    "Issue receipts from collected payments with school branding, serial numbers, and a trail that reconciles to the fee structure.",
  audience: "Accounts staff, school admins",
  readingMinutes: 3,
  icon: "receipt",
  hero: {
    label: "Receipt print preview",
    aspect: "16 / 9",
  },
  highlights: [
    "Serials and school branding",
    "Amounts tied to fee structure",
    "Print and PDF without leaving the workspace",
  ],
  sections: [
    {
      heading: "What a receipt must do",
      body: "Prove payment, name the fee head, and leave a trail accounts can reconcile. Print and PDF stay on-brand without leaving the workspace.",
      media: {
        label: "Branded receipt sheet",
        aspect: "3 / 4",
      },
    },
    {
      heading: "Tied to fees",
      body: "Receipts never invent amounts. They reference the fee structure and recorded collections so the books stay coherent.",
      media: {
        label: "Ledger reconcile strip",
        aspect: "16 / 10",
      },
    },
  ],
};
