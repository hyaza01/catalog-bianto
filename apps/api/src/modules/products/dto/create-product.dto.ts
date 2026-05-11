import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PriceMode, ProductStatus } from '@prisma/client';

class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;

  @IsString()
  @Min(3)
  @MaxLength(180)
  altText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  caption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

class ProductTagDto {
  @IsString()
  @Min(2)
  @MaxLength(80)
  name!: string;
}

class ProductAttributeDto {
  @IsString()
  @Min(2)
  @MaxLength(60)
  key!: string;

  @IsString()
  @Min(2)
  @MaxLength(80)
  label!: string;

  @IsString()
  @Min(1)
  @MaxLength(120)
  value!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}

export class CreateProductDto {
  @IsString()
  @Min(3)
  @MaxLength(180)
  name!: string;

  @IsOptional()
  @IsString()
  @Min(3)
  @MaxLength(200)
  slug?: string;

  @IsString()
  @Min(10)
  @MaxLength(280)
  shortDescription!: string;

  @IsString()
  @Min(20)
  longDescription!: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(PriceMode)
  priceMode?: PriceMode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePriceCents?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  minQuantity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  averageProductionDays?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images!: ProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTagDto)
  tags?: ProductTagDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;
}

export { ProductImageDto, ProductTagDto, ProductAttributeDto };
