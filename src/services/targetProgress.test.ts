import { describe, it, expect } from 'vitest';
import { computeTargetProgress, isCalm, getCoachingTip } from './targetProgress';
import { Goal } from '@/types/goal';
import { Session, ReactionLevel } from '@/types/session';
import { makeGoal, makeProgress, makeSession } from '@/test/fixtures';

// ---------- Helpers ----------

/** Progress computed for a single goal (the default "Men" people goal unless given). */
const progressFor = (sessions: Session[], goal: Goal = makeGoal()) =>
  computeTargetProgress([goal], sessions)[goal.id];

// ---------- isCalm ----------

describe('isCalm', () => {
  it.each<{ label: string; reaction: ReactionLevel; calm: boolean }>([
    { label: 'neutral is calm', reaction: '😐', calm: true },
    { label: 'positive is calm', reaction: '😊', calm: true },
    { label: 'very positive is calm', reaction: '😍', calm: true },
    { label: 'negative is NOT calm', reaction: '😟', calm: false },
    { label: 'very negative is NOT calm', reaction: '😰', calm: false },
  ])('$label', ({ reaction, calm }) => expect(isCalm(reaction)).toBe(calm));
});

// ---------- computeTargetProgress ----------

describe('computeTargetProgress', () => {
  it('returns empty record for no goals', () => {
    expect(computeTargetProgress([], [])).toEqual({});
  });

  it('returns zero progress when no matching sessions', () => {
    expect(progressFor([])).toMatchObject({ calmCount: 0, varietyCount: 0, isComplete: false, lastLogged: null });
  });

  it.each<{ scenario: string; reaction: ReactionLevel; calmCount: number }>([
    { scenario: 'counts neutral reaction as calm', reaction: '😐', calmCount: 1 },
    { scenario: 'counts positive reaction as calm', reaction: '😊', calmCount: 1 },
    { scenario: 'does NOT count negative reaction as calm', reaction: '😟', calmCount: 0 },
    { scenario: 'does NOT count very negative reaction as calm', reaction: '😰', calmCount: 0 },
  ])('$scenario', ({ reaction, calmCount }) => {
    expect(progressFor([makeSession({ reaction })]).calmCount).toBe(calmCount);
  });

  it.each<{ scenario: string; goal?: Goal; sessions: Session[]; varietyCount: number }>([
    {
      scenario: 'counts context variety from placeType + intensity',
      sessions: [
        makeSession({ id: 's1', placeType: 'Park', intensity: 'low' }),
        makeSession({ id: 's2', placeType: 'Park', intensity: 'medium' }),
        makeSession({ id: 's3', placeType: 'Cafe', intensity: 'low' }),
      ],
      varietyCount: 3,
    },
    {
      scenario: 'does NOT double-count duplicate variety keys',
      sessions: [
        makeSession({ id: 's1', placeType: 'Park', intensity: 'low' }),
        makeSession({ id: 's2', placeType: 'Park', intensity: 'low' }),
      ],
      varietyCount: 1,
    },
    {
      // 1 context key (Park:low) + 1 new key (new:2024-06-01) = 2
      scenario: 'adds variety for isNewToDog on people type',
      sessions: [makeSession({ placeType: 'Park', intensity: 'low', isNewToDog: true, date: new Date('2024-06-01') })],
      varietyCount: 2,
    },
    {
      scenario: 'adds variety for isNewToDog on dogs type',
      goal: makeGoal({ id: 'g-dogs', type: 'dogs', category: 'Small Dogs' }),
      sessions: [
        makeSession({
          type: 'dogs',
          category: 'Small Dogs',
          placeType: 'Street',
          intensity: 'medium',
          isNewToDog: true,
          date: new Date('2024-06-02'),
        }),
      ],
      varietyCount: 2,
    },
    {
      // Only 1 context key; isNewToDog ignored for non-people/dogs
      scenario: 'does NOT add isNewToDog variety for environments type',
      goal: makeGoal({ id: 'g-env', type: 'environments', category: 'Park' }),
      sessions: [
        makeSession({ type: 'environments', category: 'Park', placeType: 'Park', intensity: 'low', isNewToDog: true }),
      ],
      varietyCount: 1,
    },
    {
      // 2 context keys (Park:low, Park:medium) + 1 new key (new:2024-06-01) = 3
      scenario: 'caps isNewToDog variety at 1 per day',
      sessions: [
        makeSession({ id: 's1', placeType: 'Park', intensity: 'low', isNewToDog: true, date: new Date('2024-06-01') }),
        makeSession({ id: 's2', placeType: 'Park', intensity: 'medium', isNewToDog: true, date: new Date('2024-06-01') }),
      ],
      varietyCount: 3,
    },
  ])('$scenario', ({ goal, sessions, varietyCount }) => {
    expect(progressFor(sessions, goal).varietyCount).toBe(varietyCount);
  });

  const calmReactions: ReactionLevel[] = ['😊', '😍'];
  const anxiousReactions: ReactionLevel[] = ['😟', '😰'];
  // Variety counts distinct place + intensity contexts
  const distinctContexts: Partial<Session>[] = [{ placeType: 'Park', intensity: 'low' }, { placeType: 'Cafe', intensity: 'medium' }];
  const repeatedContext: Partial<Session>[] = [{ placeType: 'Park', intensity: 'low' }, { placeType: 'Park', intensity: 'low' }];

  it.each([
    {
      scenario: 'marks target complete when both thresholds met',
      calmTargetCount: 2, varietyTargetCount: 2, reactions: calmReactions, contexts: distinctContexts,
      calmCount: 2, varietyCount: 2, isComplete: true,
    },
    {
      scenario: 'is NOT complete when calm met but variety not met',
      calmTargetCount: 2, varietyTargetCount: 3, reactions: calmReactions, contexts: repeatedContext,
      calmCount: 2, varietyCount: 1, isComplete: false,
    },
    {
      scenario: 'is NOT complete when variety met but calm not met',
      calmTargetCount: 3, varietyTargetCount: 2, reactions: anxiousReactions, contexts: distinctContexts,
      calmCount: 0, varietyCount: 2, isComplete: false,
    },
  ])('$scenario', ({ calmTargetCount, varietyTargetCount, reactions, contexts, calmCount, varietyCount, isComplete }) => {
    const sessions = reactions.map((reaction, i) => makeSession({ id: `s${i + 1}`, reaction, ...contexts[i] }));

    expect(progressFor(sessions, makeGoal({ calmTargetCount, varietyTargetCount }))).toMatchObject({
      calmCount,
      varietyCount,
      isComplete,
    });
  });

  it('tracks lastLogged as the most recent session date', () => {
    const sessions = [
      makeSession({ id: 's1', date: new Date('2024-06-01') }),
      makeSession({ id: 's2', date: new Date('2024-06-15') }),
      makeSession({ id: 's3', date: new Date('2024-06-10') }),
    ];

    expect(progressFor(sessions).lastLogged!.getTime()).toBe(new Date('2024-06-15').getTime());
  });

  it('defaults missing placeType and intensity gracefully', () => {
    // Old data: placeType, intensity and isNewToDog are all undefined.
    // Calm still counts and the variety key falls back to context:Other:low.
    expect(progressFor([makeSession({ reaction: '😊' })])).toMatchObject({ calmCount: 1, varietyCount: 1 });
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
    expect(result['g1']).toMatchObject({ calmCount: 2, varietyCount: 2 });
    expect(result['g2']).toMatchObject({ calmCount: 0, varietyCount: 1 });
  });

  it('uses fallback calmTargetCount from targetCount for legacy goals', () => {
    const legacyGoal = makeGoal({
      calmTargetCount: undefined as unknown as number,
      varietyTargetCount: undefined as unknown as number,
      targetCount: 3,
    });

    expect(progressFor([], legacyGoal)).toMatchObject({ calmTarget: 3, varietyTarget: 3 });
  });
});

// ---------- getCoachingTip ----------

describe('getCoachingTip', () => {
  it.each([
    { scenario: 'returns complete message when target is done', progress: { calmCount: 5, varietyCount: 3, isComplete: true }, tip: 'complete' },
    { scenario: 'returns starter tip when no progress', progress: { calmCount: 0, varietyCount: 0, lastLogged: null }, tip: 'Start small' },
    { scenario: 'encourages variety when calm is met but variety is not', progress: { calmCount: 5, varietyCount: 1 }, tip: 'new context' },
    { scenario: 'encourages calm reps when variety is met but calm is not', progress: { calmCount: 2, varietyCount: 3 }, tip: 'calm' },
  ])('$scenario', ({ progress, tip }) => {
    expect(getCoachingTip(makeProgress(progress))).toContain(tip);
  });
});
