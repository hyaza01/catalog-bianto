import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('public/settings')
export class SettingsPublicController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getPublic(): Promise<Record<string, unknown>> {
    return this.settingsService.getPublic();
  }
}
