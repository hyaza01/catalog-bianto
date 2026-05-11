import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductsService } from './products.service';

class AdminProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: AdminProductsQueryDto): Promise<{ data: unknown[]; meta: unknown }> {
    return this.productsService.listAdmin(query.page, query.limit);
  }

  @Post()
  create(@Body() dto: CreateProductDto): Promise<unknown> {
    return this.productsService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<unknown> {
    return this.productsService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<unknown> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.productsService.softDelete(id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.productsService.publish(id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.productsService.unpublish(id);
  }

  @Patch(':id/feature')
  feature(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.productsService.feature(id, true);
  }

  @Patch(':id/unfeature')
  unfeature(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.productsService.feature(id, false);
  }

  @Post(':productId/images')
  addImage(
    @Param('productId') productId: string,
    @Body() dto: AddProductImageDto,
  ): Promise<unknown> {
    return this.productsService.addImage(productId, dto);
  }

  @Patch(':productId/images/:imageId')
  updateImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
  ): Promise<unknown> {
    return this.productsService.updateImage(productId, imageId, dto);
  }

  @Delete(':productId/images/:imageId')
  deleteImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<{ success: boolean }> {
    return this.productsService.deleteImage(productId, imageId);
  }

  @Patch(':productId/images/reorder')
  reorderImages(
    @Param('productId') productId: string,
    @Body() dto: ReorderProductImagesDto,
  ): Promise<{ success: boolean }> {
    return this.productsService.reorderImages(productId, dto);
  }

  @Patch(':productId/images/:imageId/set-cover')
  setCoverImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<{ success: boolean }> {
    return this.productsService.setCoverImage(productId, imageId);
  }
}
