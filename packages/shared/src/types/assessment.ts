export type Goal = 'job' | 'startup' | 'freelance' | 'fun';
export type SkillLevel = 'Never used' | 'Beginner' | 'Comfortable';
export type Interest = 'web' | 'ai' | 'mobile' | 'game' | 'data' | 'backend';
export type LearningStyle = 'video' | 'reading' | 'building';

export interface PersonalityAnswers {
  teamwork: number;
  pace: number;
}

export interface AssessmentAnswers {
  goal: Goal | null;
  skills: Record<string, SkillLevel>;
  personality: PersonalityAnswers;
  interests: Interest[];
  style: LearningStyle | null;
  hours: number;
}

export interface AssessmentDto {
  answers: AssessmentAnswers;
  userId?: string;
}

export interface AssessmentResponse {
  id: string;
  answers: AssessmentAnswers;
  createdAt: string;
}
