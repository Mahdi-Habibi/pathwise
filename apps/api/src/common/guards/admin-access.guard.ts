import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { adminSectionAllowed, type AuthUser } from '@pathwise/shared';
import {
  ADMIN_ACCESS_KEY,
  type AdminAccessRequirement,
} from '../decorators/admin-access.decorator';
import { SiteSettingsService } from '../../site-settings/site-settings.service';

@Injectable()
export class AdminAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<AdminAccessRequirement>(
      ADMIN_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    if (user?.role === 'SUPER_ADMIN') {
      return true;
    }

    const settings = await this.siteSettings.get();
    if (!adminSectionAllowed(settings.adminAccess, requirement.section, requirement.level)) {
      throw new ForbiddenException('Admin access denied for this section');
    }

    return true;
  }
}
