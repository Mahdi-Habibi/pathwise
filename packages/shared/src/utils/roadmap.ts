import { GOAL_LABEL, STYLE_LABEL } from '../constants/labels';
import { MODULE_PRICES, TRACKS } from '../constants/tracks';
import type { AssessmentAnswers } from '../types/assessment';
import type { RoadmapResponse, TrackKey } from '../types/roadmap';

export type SkillLevelKey = 'absoluteBeginner' | 'confidentBeginner' | 'earlyIntermediate';

export function skillLevel(skills: AssessmentAnswers['skills']): SkillLevelKey {
  const vals = Object.values(skills);
  const score = vals.reduce((a, v) => a + (v === 'Never used' ? 0 : v === 'Beginner' ? 1 : 2), 0);
  if (score <= 1) return 'absoluteBeginner';
  if (score <= 4) return 'confidentBeginner';
  return 'earlyIntermediate';
}

export function buildRoadmapFromAnswers(
  answers: AssessmentAnswers,
  enrolled = false,
  id = 'local',
): RoadmapResponse {
  const primary = (answers.interests[0] || 'web') as TrackKey;
  const track = TRACKS[primary];
  const level = skillLevel(answers.skills);
  const total = MODULE_PRICES.reduce((a, b) => a + b, 0);
  const discounted = Math.round(total * 0.8);

  return {
    id,
    trackKey: primary,
    trackName: track.name,
    modules: track.modules,
    level,
    profile: {
      goal: answers.goal ? GOAL_LABEL[answers.goal] : '',
      level,
      style: answers.style ? STYLE_LABEL[answers.style] : '',
      hours: answers.hours,
    },
    pricing: {
      individual: MODULE_PRICES,
      total,
      discounted,
    },
    enrolled,
  };
}
