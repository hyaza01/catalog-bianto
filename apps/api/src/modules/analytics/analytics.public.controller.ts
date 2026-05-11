import { Body, Controller, Headers, Ip, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { AnalyticsService } from './analytics.service';

@Controller('public/analytics/events')
export class AnalyticsPublicController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  createEvent(
    @Body() dto: CreateAnalyticsEventDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ip: string,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    return this.analyticsService.createEvent(dto, {
      userAgent,
      ip: ip || request.ip,
    });
  }
}
