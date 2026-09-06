export type DemoFeeHead = {
  code: string;
  label: string;
  amountInr: number;
};

/** First-time starter. Publishing still creates an immutable version. */
export const DEMO_FEE_HEADS: DemoFeeHead[] = [
  { code: "registration", label: "Registration", amountInr: 5000 },
  { code: "tuition", label: "Annual tuition", amountInr: 30000 },
  { code: "examination", label: "Examination", amountInr: 2500 },
  { code: "transport", label: "Transport", amountInr: 8000 },
];
