import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { PrismaService } from '../../database/prisma.service';
import { hashIp } from '../../common/utils/hash';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(
    dto: CreateAnalyticsEventDto,
    metadata: { userAgent?: string; ip?: string },
  ): Promise<{ success: boolean }> {
    await this.prisma.analyticsEvent.create({
      data: {
        type: dto.type,
        productId: dto.productId,
        leadId: dto.leadId,
        pageUrl: dto.pageUrl,
        sessionId: dto.sessionId,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        userAgent: metadata.userAgent,
        ipHash: hashIp(metadata.ip) ?? undefined,
      },
    });

    return { success: true };
  }
}
