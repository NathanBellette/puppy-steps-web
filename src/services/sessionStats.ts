import { Session, SessionStats, SessionType, ReactionLevel } from '@/types';

const REACTION_VALUES: Record<ReactionLevel, number> = {
  '😰': 1,
  '😟': 2,
  '😐': 3,
  '😊': 4,
  '😍': 5,
};

const SESSION_TYPES: SessionType[] = ['people', 'dogs', 'environments', 'noises'];

/**
 * Pure function: compute aggregate session stats from a list of sessions.
 * No Firebase dependency — fully testable.
 */
export function computeSessionStats(sessions: Session[]): SessionStats {
  const totalSessions = sessions.length;

  const sessionsByType: Record<SessionType, number> = {} as Record<SessionType, number>;
  for (const type of SESSION_TYPES) {
    sessionsByType[type] = sessions.filter(s => s.type === type).length;
  }

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
