import { Body, Controller, Headers, Ip, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './leads.service';

@Controller('public/leads')
export class LeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(
    @Body() dto: CreateLeadDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ip: string,
    @Req() request: Request,
  ): Promise<{ success: boolean; leadId: string }> {
    return this.leadsService.createPublic(dto, {
      userAgent,
      ip: ip || request.ip,
    });
  }
}
