import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(): Promise<unknown[]> {
    return this.categoriesService.listAdmin();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto): Promise<unknown> {
    return this.categoriesService.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<unknown> {
    return this.categoriesService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<unknown> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.categoriesService.softDelete(id);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderCategoriesDto): Promise<{ success: boolean }> {
    return this.categoriesService.reorder(dto);
  }
}
