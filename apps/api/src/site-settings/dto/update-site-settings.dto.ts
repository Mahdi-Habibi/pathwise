import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SiteGeneralDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  heroMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  heroRoadmapsCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  heroMatchPercent?: number;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;
}

export class SitePricingDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  readinessTestCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  courseCents?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  modulePrices?: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bundleDiscountPercent?: number;
}

export class SiteTrackDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  icon!: string;

  @IsString()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  modules!: string[];
}

export class SiteReadinessDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passThreshold?: number;

  @IsOptional()
  @IsString()
  passTitle?: string;

  @IsOptional()
  @IsString()
  passMessage?: string;

  @IsOptional()
  @IsString()
  failTitle?: string;

  @IsOptional()
  @IsString()
  failMessage?: string;
}

export class SiteBootcampDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  unlockScoreThreshold?: number;

  @IsOptional()
  @IsString()
  unlockCourseSlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultRank?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultPoints?: number;
}

export class SiteAdminAccessDto {
  @IsOptional()
  @IsBoolean()
  stats?: boolean;

  @IsOptional()
  @IsBoolean()
  settings?: boolean;

  @IsOptional()
  @IsBoolean()
  courses?: boolean;

  @IsOptional()
  @IsBoolean()
  challenges?: boolean;

  @IsOptional()
  @IsBoolean()
  users?: boolean;
}

export class UpdateSiteSettingsBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SiteGeneralDto)
  general?: SiteGeneralDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SitePricingDto)
  pricing?: SitePricingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteTrackDto)
  tracks?: SiteTrackDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SiteReadinessDto)
  readiness?: SiteReadinessDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SiteBootcampDto)
  bootcamp?: SiteBootcampDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SiteAdminAccessDto)
  adminAccess?: SiteAdminAccessDto;
}
