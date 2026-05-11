import { Controller, Get, Param, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { CategoriesService } from './categories.service';

class CategoryProductsQueryDto {
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
  limit = 12;
}

@Controller('public/categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(): Promise<unknown[]> {
    return this.categoriesService.listPublic();
  }

  @Get('tree')
  tree(): Promise<unknown[]> {
    return this.categoriesService.tree();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<unknown> {
    return this.categoriesService.getBySlug(slug);
  }

  @Get(':slug/products')
  getProductsBySlug(
    @Param('slug') slug: string,
    @Query() query: CategoryProductsQueryDto,
  ): Promise<{ data: unknown[]; meta: unknown }> {
    return this.categoriesService.getProductsBySlug(slug, query.page, query.limit);
  }
}
