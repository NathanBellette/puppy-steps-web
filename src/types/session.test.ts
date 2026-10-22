import { describe, it, expect } from 'vitest';
import { normalizeSessionType, SessionType } from '@/types/session';
import { capitalizeFirst } from '@/lib/utils';

describe('normalizeSessionType', () => {
  it.each<{ type: SessionType; legacy: string }>([
    { type: 'people', legacy: 'person' },
    { type: 'dogs', legacy: 'dog' },
    { type: 'environments', legacy: 'environment' },
    { type: 'noises', legacy: 'noise' },
  ])('normalizes any casing of $type and legacy singular $legacy', ({ type, legacy }) => {
    // Lowercase passes through; capitalized and all-caps values come from iOS
    const spellings = [type, legacy].flatMap((word) => [word, capitalizeFirst(word), word.toUpperCase()]);

    expect(spellings.map(normalizeSessionType)).toEqual(spellings.map(() => type));
  });

  it.each(['unknown', ''])('defaults %j to people', (input) => {
    expect(normalizeSessionType(input)).toBe('people');
  });
});
