import { READINESS_MODULES } from '../constants/tracks';
import type { ReadinessResult, ReadinessScores } from '../types/readiness';

function normalizeModuleKey(key: string): string {
  const legacy: Record<string, string> = {
    'Computer Literacy': 'computerLiteracy',
    'English Readiness': 'englishReadiness',
    'Algorithmic Thinking': 'algorithmicThinking',
    Flowcharts: 'flowcharts',
    'Programming Fundamentals': 'programmingFundamentals',
  };
  return legacy[key] ?? key;
}

export function computeReadinessResult(scores: ReadinessScores): ReadinessResult {
  const percentages: Record<string, number> = {};
  READINESS_MODULES.forEach((m) => {
    const direct = scores[m];
    const legacyHit = Object.entries(scores).find(([k]) => normalizeModuleKey(k) === m)?.[1];
    const s = direct || legacyHit || { correct: 0, total: 1 };
    percentages[m] = Math.round((s.correct / s.total) * 100);
  });
  const avg = Math.round(
    Object.values(percentages).reduce((a, b) => a + b, 0) / READINESS_MODULES.length,
  );
  const passed = avg >= 60;

  if (passed) {
    return {
      percentages,
      average: avg,
      passed,
      verdict: {
        icon: '✅',
        title: "You're ready for the next module",
        message: `Overall score: ${avg}%. Your roadmap has been adjusted — the next module in your sequence is now unlocked.`,
        unlockTitle: "You're ready for the next module",
        unlockSub: 'Your roadmap has been updated — pick up where you left off.',
        variant: 'success',
      },
    };
  }

  return {
    percentages,
    average: avg,
    passed,
    verdict: {
      icon: '🧭',
      title: 'Almost there — one review module first',
      message: `Overall score: ${avg}%. We'll slot in a short refresher before unlocking the next stage, so you start it feeling confident.`,
      unlockTitle: 'A quick refresher is queued up',
      unlockSub: "It's short — about 20 minutes — then you're straight back on track.",
      variant: 'warning',
    },
  };
}
