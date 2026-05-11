import { PrismaClient, PriceMode, ProductStatus, UserRole } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function upsertAdmin(): Promise<void> {
  const name = process.env.ADMIN_SEED_NAME ?? 'Admin Bianto';
  const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@bianto.local';
  const password = process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMe123!';
  const pepper = process.env.PASSWORD_HASH_PEPPER ?? '';
  const passwordHash = await argon2.hash(`${password}${pepper}`);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
}

async function seedCategories(): Promise<Record<string, string>> {
  const mainCategory = await prisma.category.upsert({
    where: { slug: 'canecas' },
    update: {
      name: 'Canecas',
      isActive: true,
    },
    create: {
      name: 'Canecas',
      slug: 'canecas',
      isActive: true,
      sortOrder: 1,
      seoTitle: 'Canecas Personalizadas',
      seoDescription: 'Canecas personalizadas para brindes, presentes e eventos.',
    },
  });

  const subcategories = [
    'Canecas de cerâmica',
    'Canecas mágicas',
    'Canecas com foto',
    'Canecas corporativas',
    'Canecas para datas comemorativas',
    'Canecas minimalistas',
    'Canecas coloridas',
  ];

  const bySlug: Record<string, string> = {
    canecas: mainCategory.id,
  };

  for (let index = 0; index < subcategories.length; index += 1) {
    const name = subcategories[index];
    const slug = slugify(name);

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        isActive: true,
        parentId: mainCategory.id,
        sortOrder: index + 1,
      },
      create: {
        name,
        slug,
        parentId: mainCategory.id,
        isActive: true,
        sortOrder: index + 1,
      },
    });

    bySlug[slug] = category.id;
  }

  return bySlug;
}

type SeedProduct = {
  name: string;
  shortDescription: string;
  longDescription: string;
  categorySlug: string;
  tags: string[];
  attributes: Array<{ key: string; label: string; value: string; unit?: string }>;
  imageUrl: string;
};

const seedProducts: SeedProduct[] = [
  {
    name: 'Caneca Cerâmica Personalizada 325ml',
    shortDescription: 'Caneca clássica em cerâmica com impressão premium.',
    longDescription:
      'Caneca de cerâmica com acabamento brilhante, ideal para brindes corporativos e presentes personalizados.',
    categorySlug: 'canecas-de-ceramica',
    tags: ['Brinde corporativo', 'Presente personalizado', 'Empresa'],
    attributes: [
      { key: 'capacidade_ml', label: 'Capacidade', value: '325', unit: 'ml' },
      { key: 'material', label: 'Material', value: 'Cerâmica' },
      { key: 'tipo_estampa', label: 'Tipo de estampa', value: 'Sublimação total' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1200',
  },
  {
    name: 'Caneca Mágica Personalizada',
    shortDescription: 'Caneca térmica que revela a arte ao receber bebida quente.',
    longDescription:
      'Caneca mágica com revestimento termossensível e alto impacto visual para campanhas e datas especiais.',
    categorySlug: 'canecas-magicas',
    tags: ['Foto personalizada', 'Aniversário'],
    attributes: [
      { key: 'capacidade_ml', label: 'Capacidade', value: '325', unit: 'ml' },
      { key: 'material', label: 'Material', value: 'Cerâmica' },
      { key: 'acabamento', label: 'Acabamento', value: 'Termossensível preto' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200',
  },
  {
    name: 'Caneca com Foto',
    shortDescription: 'Caneca para fotos pessoais e frases especiais.',
    longDescription:
      'Caneca com área ampla de impressão para fotos de alta resolução, ideal para presentes afetivos.',
    categorySlug: 'canecas-com-foto',
    tags: ['Dia das mães', 'Presente personalizado'],
    attributes: [
      { key: 'capacidade_ml', label: 'Capacidade', value: '325', unit: 'ml' },
      { key: 'personalizacao_foto', label: 'Personalização com foto', value: 'Sim' },
      { key: 'cores', label: 'Cores disponíveis', value: 'Branca, preta, azul' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
  },
  {
    name: 'Caneca Corporativa com Logo',
    shortDescription: 'Caneca para ações de marca e kits corporativos.',
    longDescription:
      'Caneca para empresas com impressão de logo e identidade visual, ideal para eventos e onboarding.',
    categorySlug: 'canecas-corporativas',
    tags: ['Brinde corporativo', 'Empresa'],
    attributes: [
      { key: 'capacidade_ml', label: 'Capacidade', value: '350', unit: 'ml' },
      { key: 'material', label: 'Material', value: 'Porcelana' },
      { key: 'publico', label: 'Público recomendado', value: 'Clientes e colaboradores' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=1200',
  },
  {
    name: 'Caneca Colorida Personalizada',
    shortDescription: 'Caneca com interior colorido e alto contraste visual.',
    longDescription:
      'Caneca com alça e interior colorido, excelente para campanhas promocionais e coleções temáticas.',
    categorySlug: 'canecas-coloridas',
    tags: ['Dia dos professores', 'Casamento'],
    attributes: [
      { key: 'capacidade_ml', label: 'Capacidade', value: '300', unit: 'ml' },
      { key: 'cores', label: 'Cores disponíveis', value: 'Vermelho, azul, verde, amarelo' },
      { key: 'acabamento', label: 'Acabamento', value: 'Brilho' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=1200',
  },
  {
    name: 'Caneca para Presente Personalizado',
    shortDescription: 'Caneca com embalagem individual para presente.',
    longDescription:
      'Caneca premium com opção de caixa individual, ideal para lembranças de eventos e datas comemorativas.',
    categorySlug: 'canecas-para-datas-comemorativas',
    tags: ['Presente personalizado', 'Aniversário', 'Casamento'],
    attributes: [
      { key: 'capacidade_ml', label: 'Capacidade', value: '325', unit: 'ml' },
      { key: 'embalagem_individual', label: 'Embalagem individual', value: 'Sim' },
      { key: 'prazo', label: 'Prazo médio de produção', value: '7', unit: 'dias' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200',
  },
];

async function seedProductsData(categoryBySlug: Record<string, string>): Promise<void> {
  for (const item of seedProducts) {
    const slug = slugify(item.name);
    const categoryId = categoryBySlug[item.categorySlug] ?? categoryBySlug.canecas;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: item.name,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        status: ProductStatus.PUBLISHED,
        priceMode: PriceMode.ON_REQUEST,
        minQuantity: 10,
        isAvailable: true,
        isFeatured: true,
        isCustomizable: true,
        categoryId,
        publishedAt: new Date(),
      },
      create: {
        name: item.name,
        slug,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        status: ProductStatus.PUBLISHED,
        priceMode: PriceMode.ON_REQUEST,
        minQuantity: 10,
        isAvailable: true,
        isFeatured: true,
        isCustomizable: true,
        categoryId,
        publishedAt: new Date(),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productTag.deleteMany({ where: { productId: product.id } });
    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.imageUrl,
        altText: `${item.name} com personalização`,
        isCover: true,
        isActive: true,
        sortOrder: 1,
      },
    });

    await prisma.productTag.createMany({
      data: item.tags.map((name) => ({
        productId: product.id,
        name,
        slug: slugify(name),
      })),
    });

    await prisma.productAttribute.createMany({
      data: item.attributes.map((attribute, index) => ({
        productId: product.id,
        key: attribute.key,
        label: attribute.label,
        value: attribute.value,
        unit: attribute.unit,
        sortOrder: index,
      })),
    });
  }
}

async function seedPublicSettings(): Promise<void> {
  const defaults = [
    {
      key: 'store',
      isPublic: true,
      value: {
        name: 'Bianto Store',
        slogan: 'Canecas personalizadas para marcas e momentos especiais',
      },
    },
    {
      key: 'contact',
      isPublic: true,
      value: {
        whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999',
        email: 'contato@biantostore.com.br',
        instagram: 'https://instagram.com/biantostore',
      },
    },
    {
      key: 'seo',
      isPublic: true,
      value: {
        title: 'Bianto Store | Canecas Personalizadas',
        description:
          'Catálogo digital da Bianto Store para orçamento de canecas personalizadas e brindes corporativos.',
      },
    },
  ];

  for (const setting of defaults) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        isPublic: setting.isPublic,
      },
      create: {
        key: setting.key,
        value: setting.value,
        isPublic: setting.isPublic,
      },
    });
  }
}

async function main(): Promise<void> {
  await upsertAdmin();
  const categoryBySlug = await seedCategories();
  await seedProductsData(categoryBySlug);
  await seedPublicSettings();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
