import { Injectable, NotFoundException } from '@nestjs/common';
import type { RoadmapResponse } from '@pathwise/shared';
import { PrismaService } from '../prisma/prisma.service';
import { buildRoadmapFromAnswers } from './roadmap.utils';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';

@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoadmapDto, userId: string): Promise<RoadmapResponse> {
    const built = buildRoadmapFromAnswers(dto.answers);

    const record = await this.prisma.roadmap.create({
      data: {
        userId,
        assessmentId: dto.assessmentId,
        trackKey: built.trackKey,
        trackName: built.trackName,
        modules: JSON.stringify(built.modules),
        level: built.level,
        profile: JSON.stringify(built.profile),
        pricing: JSON.stringify(built.pricing),
        enrolled: false,
      },
    });

    return this.toResponse(record);
  }

  async findOne(id: string, userId: string): Promise<RoadmapResponse> {
    const record = await this.prisma.roadmap.findFirst({
      where: { id, userId },
    });
    if (!record) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    return this.toResponse(record);
  }

  async enroll(id: string, userId: string): Promise<RoadmapResponse> {
    const existing = await this.prisma.roadmap.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    if (existing.userId !== userId) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }

    const record = await this.prisma.roadmap.update({
      where: { id },
      data: { enrolled: true },
    });

    return this.toResponse(record);
  }

  private toResponse(record: {
    id: string;
    trackKey: string;
    trackName: string;
    modules: string;
    level: string;
    profile: string;
    pricing: string;
    enrolled: boolean;
  }): RoadmapResponse {
    return {
      id: record.id,
      trackKey: record.trackKey as RoadmapResponse['trackKey'],
      trackName: record.trackName,
      modules: JSON.parse(record.modules) as string[],
      level: record.level,
      profile: JSON.parse(record.profile) as RoadmapResponse['profile'],
      pricing: JSON.parse(record.pricing) as RoadmapResponse['pricing'],
      enrolled: record.enrolled,
    };
  }
}
