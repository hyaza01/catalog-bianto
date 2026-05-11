import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadNotesDto } from './dto/update-lead-notes.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class LeadsAdminController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  list(@Query() query: ListLeadsDto): Promise<{ data: unknown[]; meta: unknown }> {
    return this.leadsService.listAdmin(query);
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="leads.csv"')
  async export(@Res() response: Response): Promise<void> {
    const csv = await this.leadsService.exportCsv();
    response.send(csv);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<unknown> {
    return this.leadsService.getById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ): Promise<{ success: boolean }> {
    return this.leadsService.updateStatus(id, dto);
  }

  @Patch(':id/notes')
  updateNotes(
    @Param('id') id: string,
    @Body() dto: UpdateLeadNotesDto,
  ): Promise<{ success: boolean }> {
    return this.leadsService.updateNotes(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.leadsService.deleteOrAnonymize(id);
  }
}
