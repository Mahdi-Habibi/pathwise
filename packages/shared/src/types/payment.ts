export type ProductType = 'READINESS_TEST' | 'ROADMAP_BUNDLE' | 'COURSE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface CheckoutDto {
  productType: ProductType;
  productRef?: string;
}

export interface PaymentResponse {
  id: string;
  productType: ProductType;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  checkoutUrl?: string;
}

export const PRODUCT_PRICES: Record<ProductType, number> = {
  READINESS_TEST: 1900,
  ROADMAP_BUNDLE: 0,
  COURSE: 4900,
};
