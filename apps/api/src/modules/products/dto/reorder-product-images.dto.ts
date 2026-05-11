import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class ReorderProductImageItemDto {
  @IsString()
  imageId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class ReorderProductImagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderProductImageItemDto)
  items!: ReorderProductImageItemDto[];
}
