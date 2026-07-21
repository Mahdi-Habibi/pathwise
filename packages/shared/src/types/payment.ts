export type ProductType = 'READINESS_TEST' | 'ROADMAP_BUNDLE' | 'COURSE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface CheckoutDto {
  productType: ProductType;
  productRef?: string;
  /** When purchasing multiple courses independently from the roadmap bundle. */
  courseSlugs?: string[];
}

export interface PaymentResponse {
  id: string;
  productType: ProductType;
  /** Amount in IRR (Iranian Rials). Field name kept for API compatibility. */
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  checkoutUrl?: string;
}

/** Catalog prices in Iranian Rials (IRR). */
export const PRODUCT_PRICES: Record<ProductType, number> = {
  READINESS_TEST: 790_000,
  ROADMAP_BUNDLE: 0,
  COURSE: 1_490_000,
};

export const DEFAULT_CURRENCY = 'irr';
