import { describe, it, expect } from 'vitest';
import { computeSessionStats } from './sessionStats';
import { Session } from '@/types';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 's-1',
    userId: 'u-1',
    dogId: 'd-1',
    date: new Date('2024-01-15'),
    type: 'people',
    category: 'Children',
    reaction: '😊',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('computeSessionStats', () => {
  it('returns correct defaults for empty sessions', () => {
    const stats = computeSessionStats([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.averageReaction).toBe(3);
    expect(stats.recentSessions).toEqual([]);
    expect(stats.sessionsByType.people).toBe(0);
    expect(stats.sessionsByType.dogs).toBe(0);
    expect(stats.sessionsByType.environments).toBe(0);
    expect(stats.sessionsByType.noises).toBe(0);
  });

  it('counts sessions by type', () => {
    const sessions = [
      makeSession({ id: '1', type: 'people' }),
      makeSession({ id: '2', type: 'people' }),
      makeSession({ id: '3', type: 'dogs' }),
      makeSession({ id: '4', type: 'environments' }),
      makeSession({ id: '5', type: 'noises' }),
      makeSession({ id: '6', type: 'noises' }),
    ];

    const stats = computeSessionStats(sessions);
    expect(stats.totalSessions).toBe(6);
    expect(stats.sessionsByType.people).toBe(2);
    expect(stats.sessionsByType.dogs).toBe(1);
    expect(stats.sessionsByType.environments).toBe(1);
    expect(stats.sessionsByType.noises).toBe(2);
  });

  it('computes average reaction correctly', () => {
    const sessions = [
      makeSession({ id: '1', reaction: '😰' }), // 1
      makeSession({ id: '2', reaction: '😍' }), // 5
    ];

    const stats = computeSessionStats(sessions);
    expect(stats.averageReaction).toBe(3); // (1+5)/2
  });

  it('computes average for all positive reactions', () => {
    const sessions = [
      makeSession({ id: '1', reaction: '😍' }),
      makeSession({ id: '2', reaction: '😍' }),
    ];

    const stats = computeSessionStats(sessions);
    expect(stats.averageReaction).toBe(5);
  });

  it('returns up to 5 recent sessions', () => {
    const sessions = Array.from({ length: 10 }, (_, i) =>
      makeSession({ id: `s-${i}` })
    );

    const stats = computeSessionStats(sessions);
    expect(stats.recentSessions.length).toBe(5);
  });

  it('returns all sessions if fewer than 5', () => {
    const sessions = [
      makeSession({ id: '1' }),
      makeSession({ id: '2' }),
    ];

    const stats = computeSessionStats(sessions);
    expect(stats.recentSessions.length).toBe(2);
  });
});
