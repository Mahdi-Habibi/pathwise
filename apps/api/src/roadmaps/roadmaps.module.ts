import { Module } from '@nestjs/common';
import { AssessmentsModule } from '../assessments/assessments.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';

@Module({
  imports: [SiteSettingsModule, AssessmentsModule],
  controllers: [RoadmapsController],
  providers: [RoadmapsService],
  exports: [RoadmapsService],
})
export class RoadmapsModule {}
