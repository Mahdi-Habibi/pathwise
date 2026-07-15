import type { Goal, LearningStyle } from '../types/assessment';

/** Stable keys stored in roadmap profiles — translate on the client. */
export const GOAL_LABEL: Record<Goal, string> = {
  job: 'job',
  startup: 'startup',
  freelance: 'freelance',
  fun: 'fun',
};

export const STYLE_LABEL: Record<LearningStyle, string> = {
  video: 'video',
  reading: 'reading',
  building: 'building',
};

/** @deprecated Prefer goal/style keys + client translation. Kept for reverse lookups. */
export const GOAL_DISPLAY: Record<Goal, string> = {
  job: 'Get a Job',
  startup: 'Build a Startup',
  freelance: 'Freelance',
  fun: 'Learn for Fun',
};

export const STYLE_DISPLAY: Record<LearningStyle, string> = {
  video: 'Video-first Learner',
  reading: 'Reading-first Learner',
  building: 'Project-based Learner',
};
