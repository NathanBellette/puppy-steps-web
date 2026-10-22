import { describe, it, expect } from 'vitest';
import { computeSessionStats } from './sessionStats';
import { ReactionLevel } from '@/types';
import { makeSession, sixTypesSpread } from '@/test/fixtures';

describe('computeSessionStats', () => {
  it('returns correct defaults for empty sessions', () => {
    expect(computeSessionStats([])).toEqual({
      totalSessions: 0,
      averageReaction: 3,
      recentSessions: [],
      sessionsByType: { people: 0, dogs: 0, environments: 0, noises: 0 },
    });
  });

  it('counts sessions by type', () => {
    const sessions = sixTypesSpread.map((type, i) => makeSession({ id: `${i + 1}`, type }));

    const stats = computeSessionStats(sessions);
    expect(stats.totalSessions).toBe(6);
    expect(stats.sessionsByType).toEqual({ people: 2, dogs: 1, environments: 1, noises: 2 });
  });

  it.each<{ scenario: string; reactions: ReactionLevel[]; average: number }>([
    // (1 + 5) / 2
    { scenario: 'computes average reaction correctly', reactions: ['😰', '😍'], average: 3 },
    { scenario: 'computes average for all positive reactions', reactions: ['😍', '😍'], average: 5 },
  ])('$scenario', ({ reactions, average }) => {
    const sessions = reactions.map((reaction, i) => makeSession({ id: `${i + 1}`, reaction }));

    expect(computeSessionStats(sessions).averageReaction).toBe(average);
  });

  it.each([
    { scenario: 'returns up to 5 recent sessions', count: 10, recent: 5 },
    { scenario: 'returns all sessions if fewer than 5', count: 2, recent: 2 },
  ])('$scenario', ({ count, recent }) => {
    const sessions = Array.from({ length: count }, (_, i) => makeSession({ id: `s-${i}` }));

    expect(computeSessionStats(sessions).recentSessions.length).toBe(recent);
  });
});
