import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthUser, ReadinessTestSummary } from '@pathwise/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProfileCompleteGuard } from '../common/guards/profile-complete.guard';
import { ReadinessService } from './readiness.service';
import { CreateReadinessTestDto } from './dto/create-readiness-test.dto';

@Controller('readiness')
@UseGuards(JwtAuthGuard, ProfileCompleteGuard)
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReadinessTestDto) {
    return this.readinessService.create(dto, user.id);
  }

  @Get()
  listMine(@CurrentUser() user: AuthUser): Promise<ReadinessTestSummary[]> {
    return this.readinessService.listForUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.readinessService.findOne(id, user.id);
  }
}
