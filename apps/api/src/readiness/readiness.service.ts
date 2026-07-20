import { Injectable, NotFoundException } from '@nestjs/common';
import type { ReadinessResult } from '@pathwise/shared';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { computeReadinessResult } from './readiness.utils';
import { CreateReadinessTestDto } from './dto/create-readiness-test.dto';

export interface ReadinessTestResponse extends ReadinessResult {
  id: string;
  createdAt: string;
}

@Injectable()
export class ReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  async create(dto: CreateReadinessTestDto, userId: string): Promise<ReadinessTestResponse> {
    const settings = await this.siteSettings.get();
    const result = computeReadinessResult(dto.scores, settings.readiness);

    const record = await this.prisma.readinessTest.create({
      data: {
        userId,
        scores: JSON.stringify(dto.scores),
        percentages: JSON.stringify(result.percentages),
        average: result.average,
        passed: result.passed,
        verdict: JSON.stringify(result.verdict),
      },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    await this.emailService.sendReadinessResults(
      { id: user.id, name: user.name, email: user.email ?? 'noreply@kia.academy' },
      result,
    );

    return {
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      ...result,
    };
  }

  async findOne(id: string, userId: string): Promise<ReadinessTestResponse> {
    const record = await this.prisma.readinessTest.findFirst({
      where: { id, userId },
    });
    if (!record) {
      throw new NotFoundException(`Readiness test ${id} not found`);
    }

    return {
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      percentages: JSON.parse(record.percentages),
      average: record.average,
      passed: record.passed,
      verdict: JSON.parse(record.verdict),
    };
  }
}
