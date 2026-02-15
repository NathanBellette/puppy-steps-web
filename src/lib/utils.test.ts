import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime, getAgeInMonths, capitalizeFirst, getReactionEmoji, getReactionLabel } from './utils';

describe('formatDate', () => {
  it('formats a date in US locale', () => {
    const date = new Date('2024-01-15T00:00:00');
    const result = formatDate(date);
    expect(result).toBe('Jan 15, 2024');
  });

  it('formats a date at year boundary', () => {
    const date = new Date('2024-12-31T00:00:00');
    const result = formatDate(date);
    expect(result).toBe('Dec 31, 2024');
  });
});

describe('formatTime', () => {
  it('formats morning time', () => {
    const date = new Date('2024-01-15T09:30:00');
    const result = formatTime(date);
    expect(result).toMatch(/9:30\s*AM/);
  });

  it('formats afternoon time', () => {
    const date = new Date('2024-01-15T14:05:00');
    const result = formatTime(date);
    expect(result).toMatch(/2:05\s*PM/);
  });

  it('formats midnight', () => {
    const date = new Date('2024-01-15T00:00:00');
    const result = formatTime(date);
    expect(result).toMatch(/12:00\s*AM/);
  });
});

describe('formatDateTime', () => {
  it('combines date and time with "at"', () => {
    const date = new Date('2024-01-15T09:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('Jan 15, 2024');
    expect(result).toContain('at');
    expect(result).toMatch(/9:30\s*AM/);
  });
});

describe('getAgeInMonths', () => {
  it('returns 0 for a date today', () => {
    const today = new Date();
    const result = getAgeInMonths(today);
    expect(result).toBe(0);
  });

  it('returns approximately 12 for a date one year ago', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const result = getAgeInMonths(oneYearAgo);
    // Should be approximately 12, accounting for month length variance
    expect(result).toBeGreaterThanOrEqual(11);
    expect(result).toBeLessThanOrEqual(12);
  });

  it('returns approximately 6 for a date six months ago', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const result = getAgeInMonths(sixMonthsAgo);
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(6);
  });
});

describe('capitalizeFirst', () => {
  it('capitalizes the first character', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
  });

  it('handles already-capitalized string', () => {
    expect(capitalizeFirst('Hello')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalizeFirst('')).toBe('');
  });

  it('handles single character', () => {
    expect(capitalizeFirst('a')).toBe('A');
  });

  it('preserves the rest of the string', () => {
    expect(capitalizeFirst('hELLO wORLD')).toBe('HELLO wORLD');
  });
});

describe('getReactionEmoji', () => {
  it('returns the matching emoji', () => {
    expect(getReactionEmoji('😊')).toBe('😊');
    expect(getReactionEmoji('😰')).toBe('😰');
    expect(getReactionEmoji('😍')).toBe('😍');
  });

  it('defaults to neutral for unknown reaction', () => {
    expect(getReactionEmoji('unknown')).toBe('😐');
  });
});

describe('getReactionLabel', () => {
  it('returns correct labels for all reactions', () => {
    expect(getReactionLabel('😰')).toBe('Very Negative');
    expect(getReactionLabel('😟')).toBe('Negative');
    expect(getReactionLabel('😐')).toBe('Neutral');
    expect(getReactionLabel('😊')).toBe('Positive');
    expect(getReactionLabel('😍')).toBe('Very Positive');
  });

  it('defaults to Neutral for unknown reaction', () => {
    expect(getReactionLabel('unknown')).toBe('Neutral');
  });
});
