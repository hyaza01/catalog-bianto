import { PartialType } from '@nestjs/mapped-types';
import { AddProductImageDto } from './add-product-image.dto';

export class UpdateProductImageDto extends PartialType(AddProductImageDto) {}
