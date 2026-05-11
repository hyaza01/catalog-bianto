import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ListPublicProductsDto } from './dto/list-public-products.dto';

@Controller('public/products')
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: ListPublicProductsDto): Promise<{ data: unknown[]; meta: unknown }> {
    return this.productsService.listPublic(query);
  }

  @Get('featured')
  featured(): Promise<unknown[]> {
    return this.productsService.listFeatured();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<unknown> {
    return this.productsService.getBySlug(slug);
  }

  @Get(':slug/related')
  related(@Param('slug') slug: string): Promise<unknown[]> {
    return this.productsService.relatedBySlug(slug);
  }
}
