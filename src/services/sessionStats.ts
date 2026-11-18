import { Session, SessionStats, ReactionLevel, summariseBySessionType } from '@/types';

const REACTION_VALUES: Record<ReactionLevel, number> = {
  '😰': 1,
  '😟': 2,
  '😐': 3,
  '😊': 4,
  '😍': 5,
};

/**
 * Pure function: compute aggregate session stats from a list of sessions.
 * No Firebase dependency — fully testable.
 */
export function computeSessionStats(sessions: Session[]): SessionStats {
  const totalSessions = sessions.length;

  const sessionsByType = summariseBySessionType(sessions, (sessionsOfType) => sessionsOfType.length);

  const averageReaction = totalSessions > 0
    ? sessions.reduce((sum, s) => {
        return sum + (REACTION_VALUES[s.reaction] || 3);
      }, 0) / totalSessions
    : 3;

  const recentSessions = sessions.slice(0, 5);

  return {
    totalSessions,
    sessionsByType,
    averageReaction,
    recentSessions,
  };
}
