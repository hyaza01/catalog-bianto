import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ProductStatus } from '@prisma/client';
import { toSlug, ensureUniqueSlug } from '../../common/utils/slug';
import { validateExternalHttpsImageUrl } from '../../common/utils/url-security';
import { PrismaService } from '../../database/prisma.service';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListPublicProductsDto, PublicProductSort } from './dto/list-public-products.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get allowedImageHosts(): string[] {
    const raw = this.configService.get<string>('NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS', '');
    return raw
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean);
  }

  private buildOrderBy(sort: PublicProductSort): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case PublicProductSort.OLDEST:
        return [{ createdAt: 'asc' }];
      case PublicProductSort.NAME_ASC:
        return [{ name: 'asc' }];
      case PublicProductSort.NAME_DESC:
        return [{ name: 'desc' }];
      case PublicProductSort.PRICE_ASC:
        return [{ basePriceCents: 'asc' }];
      case PublicProductSort.PRICE_DESC:
        return [{ basePriceCents: 'desc' }];
      case PublicProductSort.FEATURED:
        return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      case PublicProductSort.NEWEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  private buildPublicWhere(query: ListPublicProductsDto): Prisma.ProductWhereInput {
    const tags = query.tags?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: ProductStatus.PUBLISHED,
      ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
      ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured } : {}),
      ...(query.priceMode ? { priceMode: query.priceMode } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            basePriceCents: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.minQuantity ? { minQuantity: { gte: query.minQuantity } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: toSlug(query.search), mode: 'insensitive' } },
              { shortDescription: { contains: query.search, mode: 'insensitive' } },
              { longDescription: { contains: query.search, mode: 'insensitive' } },
              {
                category: {
                  name: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                tags: {
                  some: {
                    name: { contains: query.search, mode: 'insensitive' },
                  },
                },
              },
              {
                attributes: {
                  some: {
                    value: { contains: query.search, mode: 'insensitive' },
                  },
                },
              },
            ],
          }
        : {}),
      ...(query.categorySlug
        ? {
            category: {
              slug: query.categorySlug,
            },
          }
        : {}),
      ...(query.parentCategorySlug
        ? {
            category: {
              parent: {
                slug: query.parentCategorySlug,
              },
            },
          }
        : {}),
      ...(tags.length > 0
        ? {
            tags: {
              some: {
                slug: {
                  in: tags.map((tag) => toSlug(tag)),
                },
              },
            },
          }
        : {}),
    };

    return where;
  }

  private makeMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async listPublic(query: ListPublicProductsDto): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where = this.buildPublicWhere(query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: this.buildOrderBy(query.sort),
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          images: {
            where: { isActive: true },
            orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
          },
          tags: true,
          attributes: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
    ]);

    return {
      data,
      meta: this.makeMeta(page, limit, total),
    };
  }

  async listFeatured(limit = 8): Promise<unknown[]> {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: ProductStatus.PUBLISHED,
        isFeatured: true,
      },
      take: limit,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        tags: true,
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async getBySlug(slug: string): Promise<unknown> {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        images: {
          where: { isActive: true },
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        tags: true,
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return product;
  }

  async relatedBySlug(slug: string): Promise<unknown[]> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: ProductStatus.PUBLISHED,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        tags: true,
      },
    });
  }

  async listAdmin(page = 1, limit = 20): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          category: true,
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
      meta: this.makeMeta(page, limit, total),
    };
  }

  async getById(id: string): Promise<unknown> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        },
        tags: true,
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return product;
  }

  private validateImages(images: CreateProductDto['images']): void {
    const hasCover = images.some((image) => image.isCover);

    if (!hasCover) {
      images[0].isCover = true;
    }

    images.forEach((image) => {
      validateExternalHttpsImageUrl(image.url, this.allowedImageHosts);
    });
  }

  async create(dto: CreateProductDto): Promise<unknown> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!category) {
      throw new BadRequestException('Categoria invalida.');
    }

    this.validateImages(dto.images);

    const slug = await ensureUniqueSlug(this.prisma, 'product', dto.slug ?? dto.name);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        status: dto.status ?? ProductStatus.DRAFT,
        priceMode: dto.priceMode ?? 'ON_REQUEST',
        basePriceCents: dto.basePriceCents,
        minQuantity: dto.minQuantity,
        averageProductionDays: dto.averageProductionDays,
        isAvailable: dto.isAvailable ?? true,
        isFeatured: dto.isFeatured ?? false,
        isCustomizable: dto.isCustomizable ?? true,
        categoryId: dto.categoryId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
        publishedAt: dto.status === ProductStatus.PUBLISHED ? new Date() : null,
        images: {
          create: dto.images.map((image, index) => ({
            url: image.url,
            altText: image.altText,
            caption: image.caption,
            sortOrder: image.sortOrder ?? index,
            isCover: image.isCover ?? index === 0,
          })),
        },
        tags: {
          create: (dto.tags ?? []).map((tag) => ({
            name: tag.name,
            slug: toSlug(tag.name),
          })),
        },
        attributes: {
          create: (dto.attributes ?? []).map((attribute, index) => ({
            key: toSlug(attribute.key),
            label: attribute.label,
            value: attribute.value,
            unit: attribute.unit,
            sortOrder: index,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        tags: true,
        attributes: true,
      },
    });

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<unknown> {
    const existing = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        images: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    if (dto.images && dto.images.length > 0) {
      this.validateImages(dto.images);
    }

    const slug = dto.slug || dto.name ? await ensureUniqueSlug(this.prisma, 'product', dto.slug ?? dto.name ?? existing.name, id) : existing.slug;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      if (dto.tags) {
        await tx.productTag.deleteMany({ where: { productId: id } });
      }

      if (dto.attributes) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          slug,
          ...(dto.shortDescription ? { shortDescription: dto.shortDescription } : {}),
          ...(dto.longDescription ? { longDescription: dto.longDescription } : {}),
          ...(dto.status ? { status: dto.status, publishedAt: dto.status === ProductStatus.PUBLISHED ? new Date() : existing.publishedAt } : {}),
          ...(dto.priceMode ? { priceMode: dto.priceMode } : {}),
          ...(dto.basePriceCents !== undefined ? { basePriceCents: dto.basePriceCents } : {}),
          ...(dto.minQuantity !== undefined ? { minQuantity: dto.minQuantity } : {}),
          ...(dto.averageProductionDays !== undefined ? { averageProductionDays: dto.averageProductionDays } : {}),
          ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
          ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
          ...(dto.isCustomizable !== undefined ? { isCustomizable: dto.isCustomizable } : {}),
          ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
          ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
          ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
          ...(dto.canonicalUrl !== undefined ? { canonicalUrl: dto.canonicalUrl } : {}),
          ...(dto.images
            ? {
                images: {
                  create: dto.images.map((image, index) => ({
                    url: image.url,
                    altText: image.altText,
                    caption: image.caption,
                    sortOrder: image.sortOrder ?? index,
                    isCover: image.isCover ?? index === 0,
                  })),
                },
              }
            : {}),
          ...(dto.tags
            ? {
                tags: {
                  create: dto.tags.map((tag) => ({
                    name: tag.name,
                    slug: toSlug(tag.name),
                  })),
                },
              }
            : {}),
          ...(dto.attributes
            ? {
                attributes: {
                  create: dto.attributes.map((attribute, index) => ({
                    key: toSlug(attribute.key),
                    label: attribute.label,
                    value: attribute.value,
                    unit: attribute.unit,
                    sortOrder: index,
                  })),
                },
              }
            : {}),
        },
        include: {
          category: true,
          images: true,
          tags: true,
          attributes: true,
        },
      });
    });

    return updated;
  }

  async softDelete(id: string): Promise<{ success: boolean }> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ProductStatus.ARCHIVED,
      },
    });

    return { success: true };
  }

  async publish(id: string): Promise<{ success: boolean }> {
    await this.assertProductExists(id);

    await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return { success: true };
  }

  async unpublish(id: string): Promise<{ success: boolean }> {
    await this.assertProductExists(id);

    await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.DRAFT,
      },
    });

    return { success: true };
  }

  async feature(id: string, isFeatured = true): Promise<{ success: boolean }> {
    await this.assertProductExists(id);

    await this.prisma.product.update({
      where: { id },
      data: {
        isFeatured,
      },
    });

    return { success: true };
  }

  async addImage(productId: string, dto: AddProductImageDto): Promise<unknown> {
    await this.assertProductExists(productId);
    validateExternalHttpsImageUrl(dto.url, this.allowedImageHosts);

    if (dto.isCover) {
      await this.prisma.productImage.updateMany({
        where: {
          productId,
        },
        data: {
          isCover: false,
        },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url: dto.url,
        altText: dto.altText,
        caption: dto.caption,
        sortOrder: dto.sortOrder ?? 0,
        isCover: dto.isCover ?? false,
      },
    });
  }

  async updateImage(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ): Promise<unknown> {
    await this.assertProductExists(productId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Imagem nao encontrada.');
    }

    if (dto.url) {
      validateExternalHttpsImageUrl(dto.url, this.allowedImageHosts);
    }

    if (dto.isCover) {
      await this.prisma.productImage.updateMany({
        where: {
          productId,
        },
        data: {
          isCover: false,
        },
      });
    }

    return this.prisma.productImage.update({
      where: {
        id: imageId,
      },
      data: {
        ...(dto.url ? { url: dto.url } : {}),
        ...(dto.altText ? { altText: dto.altText } : {}),
        ...(dto.caption !== undefined ? { caption: dto.caption } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isCover !== undefined ? { isCover: dto.isCover } : {}),
      },
    });
  }

  async deleteImage(productId: string, imageId: string): Promise<{ success: boolean }> {
    await this.assertProductExists(productId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Imagem nao encontrada.');
    }

    await this.prisma.productImage.delete({
      where: {
        id: imageId,
      },
    });

    return { success: true };
  }

  async reorderImages(productId: string, dto: ReorderProductImagesDto): Promise<{ success: boolean }> {
    await this.assertProductExists(productId);

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.productImage.update({
          where: {
            id: item.imageId,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );

    return { success: true };
  }

  async setCoverImage(productId: string, imageId: string): Promise<{ success: boolean }> {
    await this.assertProductExists(productId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },
    });

    if (!image) {
      throw new NotFoundException('Imagem nao encontrada.');
    }

    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: {
          productId,
        },
        data: {
          isCover: false,
        },
      }),
      this.prisma.productImage.update({
        where: {
          id: imageId,
        },
        data: {
          isCover: true,
        },
      }),
    ]);

    return { success: true };
  }

  private async assertProductExists(id: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }
  }
}
