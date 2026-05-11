import { PrismaService } from '../../database/prisma.service';

export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function ensureUniqueSlug(
  prisma: PrismaService,
  model: 'product' | 'category',
  rawValue: string,
  currentId?: string,
): Promise<string> {
  const base = toSlug(rawValue);
  if (!base) {
    return 'item';
  }

  let slug = base;
  let counter = 1;

  while (true) {
    const existing =
      model === 'product'
        ? await prisma.product.findFirst({ where: { slug } })
        : await prisma.category.findFirst({ where: { slug } });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    counter += 1;
    slug = `${base}-${counter}`;
  }
}
