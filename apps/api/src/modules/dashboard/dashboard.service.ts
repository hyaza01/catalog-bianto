import { Injectable } from '@nestjs/common';
import { LeadStatus, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<Record<string, unknown>> {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      totalLeads,
      newLeads,
      inProgressLeads,
      convertedLeads,
      lostLeads,
      spamLeads,
      whatsappClicks,
    ] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null, status: ProductStatus.PUBLISHED } }),
      this.prisma.product.count({
        where: {
          deletedAt: null,
          OR: [{ status: ProductStatus.DRAFT }, { isAvailable: false }],
        },
      }),
      this.prisma.product.count({ where: { deletedAt: null, isFeatured: true } }),
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: LeadStatus.NEW } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: LeadStatus.IN_PROGRESS } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: LeadStatus.CONVERTED } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: LeadStatus.LOST } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: LeadStatus.SPAM } }),
      this.prisma.analyticsEvent.count({
        where: {
          type: 'WHATSAPP_CLICK',
        },
      }),
    ]);

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        featured: featuredProducts,
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        inProgress: inProgressLeads,
        converted: convertedLeads,
        lost: lostLeads,
        spam: spamLeads,
      },
      whatsappClicks,
    };
  }

  recentLeads(): Promise<unknown[]> {
    return this.prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  topProducts(): Promise<unknown[]> {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [
        {
          leadProducts: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      include: {
        _count: {
          select: {
            leadProducts: true,
            analyticsEvents: true,
          },
        },
      },
      take: 10,
    });
  }
}
