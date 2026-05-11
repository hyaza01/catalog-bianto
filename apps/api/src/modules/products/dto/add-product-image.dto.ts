import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddProductImageDto {
  @IsString()
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
