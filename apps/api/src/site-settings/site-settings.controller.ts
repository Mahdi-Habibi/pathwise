import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import type { SiteSettings, UpdateSiteSettingsDto } from '@pathwise/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateSiteSettingsBodyDto } from './dto/update-site-settings.dto';
import { SiteSettingsService } from './site-settings.service';

@Controller()
export class SiteSettingsController {
  constructor(private readonly siteSettings: SiteSettingsService) {}

  /** Public — landing, checkout, and wizard need current config. */
  @Get('settings')
  getPublic(): Promise<SiteSettings> {
    return this.siteSettings.get();
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdmin(): Promise<SiteSettings> {
    return this.siteSettings.get();
  }

  @Put('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateAdmin(@Body() dto: UpdateSiteSettingsBodyDto): Promise<SiteSettings> {
    return this.siteSettings.update(dto as UpdateSiteSettingsDto);
  }
}
