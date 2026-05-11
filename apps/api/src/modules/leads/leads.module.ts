import { Module } from '@nestjs/common';
import { LeadsAdminController } from './leads.admin.controller';
import { LeadsPublicController } from './leads.public.controller';
import { LeadsService } from './leads.service';

@Module({
  controllers: [LeadsPublicController, LeadsAdminController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
