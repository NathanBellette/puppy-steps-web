import { Goal } from '@/types/goal';
import { Session, ReactionLevel, SessionType } from '@/types/session';

/** Per-target computed progress */
export interface TargetProgress {
  goalId: string;
  category: string;
  type: SessionType;
  calmCount: number;
  calmTarget: number;
  varietyCount: number;
  varietyTarget: number;
  isComplete: boolean;
  lastLogged: Date | null;
  varietyKeys: Set<string>;
}

/** Reactions considered "calm" (neutral or better) */
const CALM_REACTIONS: Set<ReactionLevel> = new Set(['😐', '😊', '😍']);

/**
 * Determines whether a reaction counts as calm.
 */
export function isCalm(reaction: ReactionLevel): boolean {
  return CALM_REACTIONS.has(reaction);
}

/**
 * Builds a context-based variety key from a session.
 * Format: `context:<placeType>:<intensity>`
 */
function contextVarietyKey(session: Session): string {
  const place = session.placeType ?? 'Other';
  const intensity = session.intensity ?? 'low';
  return `context:${place}:${intensity}`;
}

/**
 * Builds a "new individual" variety key from a session date.
 * Only applicable to people/dogs types with isNewToDog=true.
 * Capped at 1 per day: `new:<YYYY-MM-DD>`
 */
function newIndividualVarietyKey(session: Session): string | null {
  if (!session.isNewToDog) return null;
  if (session.type !== 'people' && session.type !== 'dogs') return null;

  const d = new Date(session.date);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `new:${dateStr}`;
}

/**
 * Pure computation: derives calm + variety progress for every goal
 * based solely on session data.
 *
 * No Firebase dependencies — fully testable.
 */
export function computeTargetProgress(
  goals: Goal[],
  sessions: Session[]
): Record<string, TargetProgress> {
  // Index sessions by (type, category) for O(1) lookup
  const sessionIndex = new Map<string, Session[]>();
  for (const session of sessions) {
    const key = `${session.type}::${session.category}`;
    if (!sessionIndex.has(key)) {
      sessionIndex.set(key, []);
    }
    sessionIndex.get(key)!.push(session);
  }

  const result: Record<string, TargetProgress> = {};

  for (const goal of goals) {
    const calmTarget = goal.calmTargetCount ?? goal.targetCount ?? 5;
    const varietyTarget = goal.varietyTargetCount ?? 3;

    const matchingSessions = sessionIndex.get(`${goal.type}::${goal.category}`) ?? [];

    let calmCount = 0;
    const varietyKeys = new Set<string>();
    let lastLogged: Date | null = null;

    for (const session of matchingSessions) {
      // Track last logged date
      const sessionDate = new Date(session.date);
      if (!lastLogged || sessionDate > lastLogged) {
        lastLogged = sessionDate;
      }

      // Calm count: only count sessions where reaction is neutral or better
      if (isCalm(session.reaction)) {
        calmCount++;
      }

      // Variety: context key (always)
      varietyKeys.add(contextVarietyKey(session));

      // Variety: new individual bonus (people/dogs only, 1 per day)
      const newKey = newIndividualVarietyKey(session);
      if (newKey) {
        varietyKeys.add(newKey);
      }
    }

    const isComplete = calmCount >= calmTarget && varietyKeys.size >= varietyTarget;

    result[goal.id] = {
      goalId: goal.id,
      category: goal.category,
      type: goal.type,
      calmCount,
      calmTarget,
      varietyCount: varietyKeys.size,
      varietyTarget,
      isComplete,
      lastLogged,
      varietyKeys,
    };
  }

  return result;
}

/**
 * Coaching tips based on progress state
 */
export function getCoachingTip(progress: TargetProgress): string {
  if (progress.isComplete) {
    return 'Great work! This target is complete.';
  }

  if (progress.calmCount === 0 && progress.varietyCount === 0) {
    return 'Start small — try a calm, low-intensity introduction.';
  }

  if (progress.calmCount < progress.calmTarget && progress.varietyCount >= progress.varietyTarget) {
    return 'Good variety! Focus on calm, positive repetitions now.';
  }

  if (progress.varietyCount < progress.varietyTarget && progress.calmCount >= progress.calmTarget) {
    return 'Almost there! Try a new context (different place or intensity).';
  }

  if (progress.varietyCount < progress.varietyTarget) {
    return 'Try a new context (cafe, park) to build variety.';
  }

  return 'Keep going with calm, positive exposures!';
}
