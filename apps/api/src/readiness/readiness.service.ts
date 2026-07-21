import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { ReadinessResult, ReadinessTestSummary, ReadinessScores } from '@pathwise/shared';
import { READINESS_MODULES } from '@pathwise/shared';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { computeReadinessResult } from '@pathwise/shared';
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
    this.assertValidScores(dto.scores);
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

  async listForUser(userId: string): Promise<ReadinessTestSummary[]> {
    const records = await this.prisma.readinessTest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        average: true,
        passed: true,
      },
    });

    return records.map((record) => ({
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      average: record.average,
      passed: record.passed,
    }));
  }

  private assertValidScores(scores: ReadinessScores): void {
    for (const module of READINESS_MODULES) {
      const score = scores[module];
      if (!score || typeof score.correct !== 'number' || typeof score.total !== 'number') {
        throw new BadRequestException(`Missing or invalid score for module: ${module}`);
      }
      if (score.total < 1 || score.correct < 0 || score.correct > score.total) {
        throw new BadRequestException(`Score out of bounds for module: ${module}`);
      }
    }
  }
}
