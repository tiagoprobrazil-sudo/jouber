/** Sizes offered in the quote-request form, with an approximate inch
 * equivalent shown alongside since the primary audience is US-based. */
export const QUOTE_SIZE_OPTIONS = [
  { value: "15 cm", label: "15 cm (~6 in)" },
  { value: "20 cm", label: "20 cm (~8 in)" },
  { value: "25 cm", label: "25 cm (~10 in)" },
  { value: "30 cm", label: "30 cm (~12 in)" },
  { value: "Custom size", label: "Custom size" },
] as const;

export const QUOTE_FINISH_OPTIONS = [
  "Standard finish",
  "Premium detailed finish",
  "Custom finish",
  "I'm not sure yet",
] as const;

export interface QuoteRequestInput {
  product: {
    id: string;
    title: string;
    url: string;
    image?: string;
    variantName?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  desiredSize: string;
  finish: string;
  customization: boolean;
  zipCode?: string;
  message?: string;
}

export interface QuoteRequestResult {
  requestId: string;
}
