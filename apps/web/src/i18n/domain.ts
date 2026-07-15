import type { Goal, Interest, LearningStyle, SkillLevel, TrackKey } from '@pathwise/shared';
import type { MessageKey } from './translate';

/** Stable readiness module keys used as score map keys and for lookup. */
export const READINESS_MODULE_KEYS = [
  'computerLiteracy',
  'englishReadiness',
  'algorithmicThinking',
  'flowcharts',
  'programmingFundamentals',
] as const;

export type ReadinessModuleKey = (typeof READINESS_MODULE_KEYS)[number];

/** Legacy English labels -> stable keys (for persisted localStorage / API payloads). */
export const READINESS_MODULE_LEGACY_TO_KEY: Record<string, ReadinessModuleKey> = {
  'Computer Literacy': 'computerLiteracy',
  'English Readiness': 'englishReadiness',
  'Algorithmic Thinking': 'algorithmicThinking',
  Flowcharts: 'flowcharts',
  'Programming Fundamentals': 'programmingFundamentals',
  computerLiteracy: 'computerLiteracy',
  englishReadiness: 'englishReadiness',
  algorithmicThinking: 'algorithmicThinking',
  flowcharts: 'flowcharts',
  programmingFundamentals: 'programmingFundamentals',
};

export const WIZARD_STAGE_KEYS = [
  'goal',
  'skill',
  'personality',
  'interest',
  'learningStyle',
  'time',
] as const;

export type SkillLevelKey = 'neverUsed' | 'beginner' | 'comfortable';

const GOAL_LEGACY_TO_KEY: Record<string, Goal> = {
  'Get a Job': 'job',
  'Build a Startup': 'startup',
  Freelance: 'freelance',
  'Learn for Fun': 'fun',
};

const STYLE_LEGACY_TO_KEY: Record<string, LearningStyle> = {
  'Video-first Learner': 'video',
  'Reading-first Learner': 'reading',
  'Project-based Learner': 'building',
};

export const SKILL_LEVEL_TO_KEY: Record<SkillLevel, SkillLevelKey> = {
  'Never used': 'neverUsed',
  Beginner: 'beginner',
  Comfortable: 'comfortable',
};

export const SKILL_LEVEL_FROM_KEY: Record<SkillLevelKey, SkillLevel> = {
  neverUsed: 'Never used',
  beginner: 'Beginner',
  comfortable: 'Comfortable',
};

export const MODULE_NAME_TO_KEY: Record<string, string> = {
  'HTML/CSS Foundations': 'htmlCssFoundations',
  'JavaScript Core': 'javascriptCore',
  'React Fundamentals': 'reactFundamentals',
  'Responsive Project Lab': 'responsiveProjectLab',
  'Portfolio & Career Prep': 'portfolioCareerPrep',
  'Python Foundations': 'pythonFoundations',
  'Data Handling with Pandas': 'dataHandlingPandas',
  'ML Fundamentals': 'mlFundamentals',
  'Applied Model Project': 'appliedModelProject',
  'Programming Foundations': 'programmingFoundations',
  'Swift/Kotlin Basics': 'swiftKotlinBasics',
  'Mobile UI Patterns': 'mobileUiPatterns',
  'App Build Project': 'appBuildProject',
  'C# Basics': 'csharpBasics',
  'Game Engine Essentials': 'gameEngineEssentials',
  'Playable Prototype': 'playablePrototype',
  'SQL & Databases': 'sqlDatabases',
  'Data Visualization': 'dataVisualization',
  'Analytics Project': 'analyticsProject',
  'APIs & Databases': 'apisDatabases',
  'Server Architecture': 'serverArchitecture',
  'Backend Project Lab': 'backendProjectLab',
};

export type LevelKey = 'absoluteBeginner' | 'confidentBeginner' | 'earlyIntermediate';

export const LEVEL_LEGACY_TO_KEY: Record<string, LevelKey> = {
  'Absolute Beginner': 'absoluteBeginner',
  'Confident Beginner': 'confidentBeginner',
  'Early Intermediate': 'earlyIntermediate',
  absoluteBeginner: 'absoluteBeginner',
  confidentBeginner: 'confidentBeginner',
  earlyIntermediate: 'earlyIntermediate',
};

export function trackMessageKey(track: TrackKey | string): MessageKey {
  return `domain.tracks.${track}`;
}

export function goalMessageKey(goal: Goal | string): MessageKey {
  return `domain.goals.${GOAL_LEGACY_TO_KEY[goal] ?? goal}`;
}

export function styleMessageKey(style: LearningStyle | string): MessageKey {
  return `domain.styles.${STYLE_LEGACY_TO_KEY[style] ?? style}`;
}

export function interestMessageKey(interest: Interest | string): MessageKey {
  return `domain.interests.${interest}`;
}

export function skillLevelMessageKey(level: SkillLevel | string): MessageKey {
  const key = SKILL_LEVEL_TO_KEY[level as SkillLevel] ?? (level as SkillLevelKey);
  return `domain.skillLevels.${key}`;
}

export function readinessModuleMessageKey(module: string): MessageKey {
  const key = READINESS_MODULE_LEGACY_TO_KEY[module] ?? module;
  return `domain.readinessModules.${key}`;
}

export function moduleMessageKey(moduleName: string): MessageKey {
  const key = MODULE_NAME_TO_KEY[moduleName] ?? moduleName;
  return `domain.modules.${key}`;
}

export function levelMessageKey(level: string): MessageKey {
  const key = LEVEL_LEGACY_TO_KEY[level] ?? level;
  return `domain.levels.${key}`;
}

export function normalizeReadinessScores(
  scores: Record<string, { correct: number; total: number }>,
): Record<string, { correct: number; total: number }> {
  const next: Record<string, { correct: number; total: number }> = {};
  for (const [key, value] of Object.entries(scores)) {
    const normalized = READINESS_MODULE_LEGACY_TO_KEY[key] ?? key;
    next[normalized] = value;
  }
  return next;
}
