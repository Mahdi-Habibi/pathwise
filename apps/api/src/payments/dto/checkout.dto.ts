import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { CheckoutDto, ProductType } from '@pathwise/shared';

const PRODUCT_TYPES = ['READINESS_TEST', 'ROADMAP_BUNDLE', 'COURSE'] as const;

export class CheckoutBodyDto implements CheckoutDto {
  @IsEnum(PRODUCT_TYPES)
  productType!: ProductType;

  @IsOptional()
  @IsString()
  productRef?: string;
}
