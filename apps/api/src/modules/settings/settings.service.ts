import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic(): Promise<Record<string, unknown>> {
    const settings = await this.prisma.siteSetting.findMany({
      where: {
        isPublic: true,
      },
    });

    return settings.reduce<Record<string, unknown>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }

  listAdmin(): Promise<unknown[]> {
    return this.prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async update(dto: UpdateSettingsDto): Promise<{ success: boolean }> {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.siteSetting.upsert({
          where: { key: item.key },
          update: {
            value: item.value as Prisma.InputJsonValue,
            isPublic: item.isPublic ?? false,
          },
          create: {
            key: item.key,
            value: item.value as Prisma.InputJsonValue,
            isPublic: item.isPublic ?? false,
          },
        }),
      ),
    );

    return { success: true };
  }
}
