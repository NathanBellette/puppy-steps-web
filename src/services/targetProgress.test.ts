import { describe, it, expect } from 'vitest';
import { computeTargetProgress, isCalm, getCoachingTip } from './targetProgress';
import { Goal } from '@/types/goal';
import { Session, ReactionLevel, PlaceType, Intensity } from '@/types/session';

// ---------- Helpers ----------

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    userId: 'u1',
    dogId: 'd1',
    category: 'Men',
    type: 'people',
    calmTargetCount: 5,
    varietyTargetCount: 3,
    isCompleted: false,
    targetCount: 5,
    currentCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    userId: 'u1',
    dogId: 'd1',
    date: new Date('2024-06-01'),
    type: 'people',
    category: 'Men',
    reaction: '😐' as ReactionLevel,
    placeType: 'Park' as PlaceType,
    intensity: 'low' as Intensity,
    isNewToDog: false,
    createdAt: new Date('2024-06-01'),
    ...overrides,
  };
}

// ---------- isCalm ----------

describe('isCalm', () => {
  it('neutral is calm', () => expect(isCalm('😐')).toBe(true));
  it('positive is calm', () => expect(isCalm('😊')).toBe(true));
  it('very positive is calm', () => expect(isCalm('😍')).toBe(true));
  it('negative is NOT calm', () => expect(isCalm('😟')).toBe(false));
  it('very negative is NOT calm', () => expect(isCalm('😰')).toBe(false));
});

// ---------- computeTargetProgress ----------

describe('computeTargetProgress', () => {
  it('returns empty record for no goals', () => {
    const result = computeTargetProgress([], []);
    expect(result).toEqual({});
  });

  it('returns zero progress when no matching sessions', () => {
    const goal = makeGoal();
    const result = computeTargetProgress([goal], []);
    expect(result['goal-1'].calmCount).toBe(0);
    expect(result['goal-1'].varietyCount).toBe(0);
    expect(result['goal-1'].isComplete).toBe(false);
    expect(result['goal-1'].lastLogged).toBeNull();
  });

  it('counts neutral reaction as calm', () => {
    const goal = makeGoal();
    const session = makeSession({ reaction: '😐' });
    const result = computeTargetProgress([goal], [session]);
    expect(result['goal-1'].calmCount).toBe(1);
  });

  it('counts positive reaction as calm', () => {
    const goal = makeGoal();
    const session = makeSession({ reaction: '😊' });
    const result = computeTargetProgress([goal], [session]);
    expect(result['goal-1'].calmCount).toBe(1);
  });

  it('does NOT count negative reaction as calm', () => {
    const goal = makeGoal();
    const session = makeSession({ reaction: '😟' });
    const result = computeTargetProgress([goal], [session]);
    expect(result['goal-1'].calmCount).toBe(0);
  });

  it('does NOT count very negative reaction as calm', () => {
    const goal = makeGoal();
    const session = makeSession({ reaction: '😰' });
    const result = computeTargetProgress([goal], [session]);
    expect(result['goal-1'].calmCount).toBe(0);
  });

  it('counts context variety from placeType + intensity', () => {
    const goal = makeGoal();
    const sessions = [
      makeSession({ id: 's1', placeType: 'Park', intensity: 'low' }),
      makeSession({ id: 's2', placeType: 'Park', intensity: 'medium' }),
      makeSession({ id: 's3', placeType: 'Cafe', intensity: 'low' }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['goal-1'].varietyCount).toBe(3);
  });

  it('does NOT double-count duplicate variety keys', () => {
    const goal = makeGoal();
    const sessions = [
      makeSession({ id: 's1', placeType: 'Park', intensity: 'low' }),
      makeSession({ id: 's2', placeType: 'Park', intensity: 'low' }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['goal-1'].varietyCount).toBe(1);
  });

  it('adds variety for isNewToDog on people type', () => {
    const goal = makeGoal({ type: 'people' });
    const sessions = [
      makeSession({
        id: 's1',
        type: 'people',
        placeType: 'Park',
        intensity: 'low',
        isNewToDog: true,
        date: new Date('2024-06-01'),
      }),
    ];
    const result = computeTargetProgress([goal], sessions);
    // 1 context key (Park:low) + 1 new key (new:2024-06-01) = 2
    expect(result['goal-1'].varietyCount).toBe(2);
  });

  it('adds variety for isNewToDog on dogs type', () => {
    const goal = makeGoal({ id: 'g-dogs', type: 'dogs', category: 'Small Dogs' });
    const sessions = [
      makeSession({
        id: 's1',
        type: 'dogs',
        category: 'Small Dogs',
        placeType: 'Street',
        intensity: 'medium',
        isNewToDog: true,
        date: new Date('2024-06-02'),
      }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['g-dogs'].varietyCount).toBe(2);
  });

  it('does NOT add isNewToDog variety for environments type', () => {
    const goal = makeGoal({ id: 'g-env', type: 'environments', category: 'Park' });
    const sessions = [
      makeSession({
        id: 's1',
        type: 'environments',
        category: 'Park',
        placeType: 'Park',
        intensity: 'low',
        isNewToDog: true,
      }),
    ];
    const result = computeTargetProgress([goal], sessions);
    // Only 1 context key; isNewToDog ignored for non-people/dogs
    expect(result['g-env'].varietyCount).toBe(1);
  });

  it('caps isNewToDog variety at 1 per day', () => {
    const goal = makeGoal();
    const sessions = [
      makeSession({
        id: 's1',
        placeType: 'Park',
        intensity: 'low',
        isNewToDog: true,
        date: new Date('2024-06-01'),
      }),
      makeSession({
        id: 's2',
        placeType: 'Park',
        intensity: 'medium',
        isNewToDog: true,
        date: new Date('2024-06-01'),
      }),
    ];
    const result = computeTargetProgress([goal], sessions);
    // 2 context keys (Park:low, Park:medium) + 1 new key (new:2024-06-01) = 3
    expect(result['goal-1'].varietyCount).toBe(3);
  });

  it('marks target complete when both thresholds met', () => {
    const goal = makeGoal({ calmTargetCount: 2, varietyTargetCount: 2 });
    const sessions = [
      makeSession({ id: 's1', placeType: 'Park', intensity: 'low', reaction: '😊' }),
      makeSession({ id: 's2', placeType: 'Cafe', intensity: 'medium', reaction: '😍' }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['goal-1'].calmCount).toBe(2);
    expect(result['goal-1'].varietyCount).toBe(2);
    expect(result['goal-1'].isComplete).toBe(true);
  });

  it('is NOT complete when calm met but variety not met', () => {
    const goal = makeGoal({ calmTargetCount: 2, varietyTargetCount: 3 });
    const sessions = [
      makeSession({ id: 's1', placeType: 'Park', intensity: 'low', reaction: '😊' }),
      makeSession({ id: 's2', placeType: 'Park', intensity: 'low', reaction: '😍' }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['goal-1'].calmCount).toBe(2);
    expect(result['goal-1'].varietyCount).toBe(1); // same context
    expect(result['goal-1'].isComplete).toBe(false);
  });

  it('is NOT complete when variety met but calm not met', () => {
    const goal = makeGoal({ calmTargetCount: 3, varietyTargetCount: 2 });
    const sessions = [
      makeSession({ id: 's1', placeType: 'Park', intensity: 'low', reaction: '😟' }),
      makeSession({ id: 's2', placeType: 'Cafe', intensity: 'medium', reaction: '😰' }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['goal-1'].calmCount).toBe(0);
    expect(result['goal-1'].varietyCount).toBe(2);
    expect(result['goal-1'].isComplete).toBe(false);
  });

  it('tracks lastLogged as the most recent session date', () => {
    const goal = makeGoal();
    const sessions = [
      makeSession({ id: 's1', date: new Date('2024-06-01') }),
      makeSession({ id: 's2', date: new Date('2024-06-15') }),
      makeSession({ id: 's3', date: new Date('2024-06-10') }),
    ];
    const result = computeTargetProgress([goal], sessions);
    expect(result['goal-1'].lastLogged!.getTime()).toBe(new Date('2024-06-15').getTime());
  });

  it('defaults missing placeType and intensity gracefully', () => {
    const goal = makeGoal();
    // Session without placeType or intensity (old data)
    const session: Session = {
      id: 's1',
      userId: 'u1',
      dogId: 'd1',
      date: new Date('2024-06-01'),
      type: 'people',
      category: 'Men',
      reaction: '😊',
      createdAt: new Date('2024-06-01'),
      // placeType, intensity, isNewToDog all undefined
    };
    const result = computeTargetProgress([goal], [session]);
    // Should still count calm
    expect(result['goal-1'].calmCount).toBe(1);
    // Should create a variety key with defaults: context:undefined:undefined
    expect(result['goal-1'].varietyCount).toBe(1);
  });

  it('handles multiple goals independently', () => {
    const goal1 = makeGoal({ id: 'g1', category: 'Men', type: 'people' });
    const goal2 = makeGoal({ id: 'g2', category: 'Children', type: 'people' });

    const sessions = [
      makeSession({ id: 's1', category: 'Men', reaction: '😊' }),
      makeSession({ id: 's2', category: 'Men', reaction: '😊', placeType: 'Cafe', intensity: 'medium' }),
      makeSession({ id: 's3', category: 'Children', reaction: '😟' }),
    ];

    const result = computeTargetProgress([goal1, goal2], sessions);
    expect(result['g1'].calmCount).toBe(2);
    expect(result['g1'].varietyCount).toBe(2);
    expect(result['g2'].calmCount).toBe(0);
    expect(result['g2'].varietyCount).toBe(1);
  });

  it('uses fallback calmTargetCount from targetCount for legacy goals', () => {
    const legacyGoal = makeGoal({
      calmTargetCount: undefined as unknown as number,
      varietyTargetCount: undefined as unknown as number,
      targetCount: 3,
    });
    const result = computeTargetProgress([legacyGoal], []);
    expect(result['goal-1'].calmTarget).toBe(3);
    expect(result['goal-1'].varietyTarget).toBe(3);
  });
});

// ---------- getCoachingTip ----------

describe('getCoachingTip', () => {
  it('returns complete message when target is done', () => {
    const tip = getCoachingTip({
      goalId: 'g1',
      category: 'Men',
      type: 'people',
      calmCount: 5,
      calmTarget: 5,
      varietyCount: 3,
      varietyTarget: 3,
      isComplete: true,
      lastLogged: new Date(),
      varietyKeys: new Set(),
    });
    expect(tip).toContain('complete');
  });

  it('returns starter tip when no progress', () => {
    const tip = getCoachingTip({
      goalId: 'g1',
      category: 'Men',
      type: 'people',
      calmCount: 0,
      calmTarget: 5,
      varietyCount: 0,
      varietyTarget: 3,
      isComplete: false,
      lastLogged: null,
      varietyKeys: new Set(),
    });
    expect(tip).toContain('Start small');
  });

  it('encourages variety when calm is met but variety is not', () => {
    const tip = getCoachingTip({
      goalId: 'g1',
      category: 'Men',
      type: 'people',
      calmCount: 5,
      calmTarget: 5,
      varietyCount: 1,
      varietyTarget: 3,
      isComplete: false,
      lastLogged: new Date(),
      varietyKeys: new Set(),
    });
    expect(tip).toContain('new context');
  });

  it('encourages calm reps when variety is met but calm is not', () => {
    const tip = getCoachingTip({
      goalId: 'g1',
      category: 'Men',
      type: 'people',
      calmCount: 2,
      calmTarget: 5,
      varietyCount: 3,
      varietyTarget: 3,
      isComplete: false,
      lastLogged: new Date(),
      varietyKeys: new Set(),
    });
    expect(tip).toContain('calm');
  });
});
