import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsEventType, LeadStatus, Prisma } from '@prisma/client';
import { stringify } from 'csv-stringify/sync';
import { hashIp } from '../../common/utils/hash';
import { isValidPhone, normalizePhone } from '../../common/utils/phone';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadNotesDto } from './dto/update-lead-notes.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublic(
    dto: CreateLeadDto,
    metadata: { userAgent?: string; ip?: string },
  ): Promise<{ success: boolean; leadId: string }> {
    if ((dto.honeypot ?? '').trim().length > 0) {
      throw new BadRequestException('Falha de validacao anti-spam.');
    }

    if (!dto.consentAccepted) {
      throw new BadRequestException('Consentimento LGPD obrigatorio.');
    }

    if (!isValidPhone(dto.whatsapp)) {
      throw new BadRequestException('WhatsApp invalido.');
    }

    if (dto.productId) {
      const product = await this.prisma.product.findFirst({
        where: {
          id: dto.productId,
          deletedAt: null,
        },
      });

      if (!product) {
        throw new BadRequestException('Produto de interesse invalido.');
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name,
        whatsapp: normalizePhone(dto.whatsapp),
        email: dto.email,
        city: dto.city,
        state: dto.state,
        desiredQuantity: dto.desiredQuantity,
        message: dto.message,
        desiredDeadline: dto.desiredDeadline,
        personalizationType: dto.personalizationType,
        consentAccepted: dto.consentAccepted,
        source: dto.source,
        pageUrl: dto.pageUrl,
        referrer: dto.referrer,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        utmTerm: dto.utmTerm,
        utmContent: dto.utmContent,
        userAgent: metadata.userAgent,
        ipHash: hashIp(metadata.ip) ?? undefined,
        products: dto.productId
          ? {
              create: {
                productId: dto.productId,
                quantity: dto.desiredQuantity,
                notes: dto.message,
              },
            }
          : undefined,
      },
    });

    await this.prisma.analyticsEvent.create({
      data: {
        type: AnalyticsEventType.LEAD_SUBMIT,
        leadId: lead.id,
        productId: dto.productId,
        pageUrl: dto.pageUrl,
        metadata: {
          source: dto.source,
          desiredQuantity: dto.desiredQuantity,
        },
        userAgent: metadata.userAgent,
        ipHash: hashIp(metadata.ip) ?? undefined,
      },
    });

    return {
      success: true,
      leadId: lead.id,
    };
  }

  async listAdmin(query: ListLeadsDto): Promise<{ data: unknown[]; meta: unknown }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { whatsapp: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.productId
        ? {
            products: {
              some: {
                productId: query.productId,
              },
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          products: {
            include: {
              product: true,
            },
          },
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

  async getById(id: string): Promise<unknown> {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead nao encontrado.');
    }

    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<{ success: boolean }> {
    await this.ensureLeadExists(id);

    await this.prisma.lead.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    return { success: true };
  }

  async updateNotes(id: string, dto: UpdateLeadNotesDto): Promise<{ success: boolean }> {
    await this.ensureLeadExists(id);

    await this.prisma.lead.update({
      where: { id },
      data: {
        internalNotes: dto.internalNotes,
      },
    });

    return { success: true };
  }

  async deleteOrAnonymize(id: string): Promise<{ success: boolean }> {
    await this.ensureLeadExists(id);

    await this.prisma.lead.update({
      where: { id },
      data: {
        name: 'Lead anonimizado',
        whatsapp: '00000000000',
        email: null,
        message: null,
        internalNotes: null,
        deletedAt: new Date(),
        status: LeadStatus.SPAM,
      },
    });

    return { success: true };
  }

  async exportCsv(): Promise<string> {
    const leads = await this.prisma.lead.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = leads.map((lead) => ({
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
      name: lead.name,
      whatsapp: lead.whatsapp,
      email: lead.email ?? '',
      status: lead.status,
      source: lead.source ?? '',
      products: lead.products.map((item) => item.product.name).join(' | '),
      desiredQuantity: lead.desiredQuantity ?? '',
      message: lead.message ?? '',
    }));

    return stringify(rows, {
      header: true,
    });
  }

  private async ensureLeadExists(id: string): Promise<void> {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead nao encontrado.');
    }
  }
}
