import { Module } from '@nestjs/common';
import { ProductsAdminController } from './products.admin.controller';
import { ProductsPublicController } from './products.public.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsPublicController, ProductsAdminController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
