import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ensureUniqueSlug } from '../../common/utils/slug';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(): Promise<unknown[]> {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async tree(): Promise<unknown[]> {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        parentId: null,
      },
      include: {
        children: {
          where: {
            deletedAt: null,
            isActive: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getBySlug(slug: string): Promise<unknown> {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
        isActive: true,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null, isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada.');
    }

    return category;
  }

  async getProductsBySlug(slug: string, page = 1, limit = 12): Promise<{ data: unknown[]; meta: unknown }> {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada.');
    }

    const where = {
      categoryId: category.id,
      deletedAt: null,
      status: ProductStatus.PUBLISHED,
      isAvailable: true,
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          images: {
            where: { isActive: true },
            orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
          },
          tags: true,
          attributes: true,
        },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async listAdmin(): Promise<unknown[]> {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getById(id: string): Promise<unknown> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada.');
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<unknown> {
    if (dto.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: {
          id: dto.parentId,
          deletedAt: null,
        },
      });

      if (!parent) {
        throw new BadRequestException('Categoria pai invalida.');
      }
    }

    const slug = await ensureUniqueSlug(this.prisma, 'category', dto.slug ?? dto.name);

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<unknown> {
    const existing = await this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Categoria nao encontrada.');
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A categoria nao pode ser pai de si mesma.');
      }

      const parent = await this.prisma.category.findFirst({
        where: {
          id: dto.parentId,
          deletedAt: null,
        },
      });

      if (!parent) {
        throw new BadRequestException('Categoria pai invalida.');
      }
    }

    const slug = dto.slug || dto.name ? await ensureUniqueSlug(this.prisma, 'category', dto.slug ?? dto.name ?? existing.name, id) : existing.slug;

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        slug,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<{ success: boolean }> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada.');
    }

    await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  async reorder(dto: ReorderCategoriesDto): Promise<{ success: boolean }> {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { success: true };
  }
}
