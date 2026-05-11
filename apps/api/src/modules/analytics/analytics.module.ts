import { Module } from '@nestjs/common';
import { AnalyticsPublicController } from './analytics.public.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AnalyticsPublicController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
