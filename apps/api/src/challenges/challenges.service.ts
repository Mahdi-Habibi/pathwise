import { Injectable, NotFoundException } from '@nestjs/common';
import type { ChallengeScoreResult } from '@pathwise/shared';
import { PrismaService } from '../prisma/prisma.service';
import { buildChallengeResult } from './challenge.utils';
import { CreateChallengeSubmissionDto } from './dto/create-challenge-submission.dto';

export interface ChallengeSubmissionResponse extends ChallengeScoreResult {
  id: string;
  createdAt: string;
}

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateChallengeSubmissionDto,
    userId: string,
  ): Promise<ChallengeSubmissionResponse> {
    const result = buildChallengeResult(dto.code);

    const record = await this.prisma.challengeSubmission.create({
      data: {
        userId,
        code: dto.code,
        score: result.score,
        topScore: result.topScore,
        result: JSON.stringify(result),
      },
    });

    if (result.topScore) {
      await this.prisma.bootcampProfile.updateMany({
        where: { userId },
        data: { rank: 1, points: result.score },
      });
    }

    return {
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      ...result,
    };
  }

  async findOne(id: string, userId: string): Promise<ChallengeSubmissionResponse> {
    const record = await this.prisma.challengeSubmission.findFirst({
      where: { id, userId },
    });
    if (!record) {
      throw new NotFoundException(`Challenge submission ${id} not found`);
    }

    const result = JSON.parse(record.result) as ChallengeScoreResult;
    return {
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      ...result,
    };
  }
}
