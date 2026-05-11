import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(): Promise<Record<string, unknown>> {
    return this.dashboardService.summary();
  }

  @Get('recent-leads')
  recentLeads(): Promise<unknown[]> {
    return this.dashboardService.recentLeads();
  }

  @Get('top-products')
  topProducts(): Promise<unknown[]> {
    return this.dashboardService.topProducts();
  }
}
