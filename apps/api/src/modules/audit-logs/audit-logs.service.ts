import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type AuditLogInput = {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
};

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        summary: input.summary,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipHash: input.ipHash,
        userAgent: input.userAgent,
      },
    });
  }
}
