export type ProductImage = {
  id: string;
  url: string;
  altText: string;
  caption?: string | null;
  isCover: boolean;
  sortOrder: number;
};

export type ProductTag = {
  id: string;
  name: string;
  slug: string;
};

export type ProductAttribute = {
  id: string;
  key: string;
  label: string;
  value: string;
  unit?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  priceMode: 'FIXED' | 'FROM' | 'ON_REQUEST';
  basePriceCents?: number | null;
  minQuantity: number;
  averageProductionDays?: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isCustomizable: boolean;
  category: Category;
  images: ProductImage[];
  tags: ProductTag[];
  attributes: ProductAttribute[];
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
