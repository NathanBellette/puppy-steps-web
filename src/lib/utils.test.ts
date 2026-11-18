import { describe, it, expect } from 'vitest';
import { formatDate, formatDateLong, formatTime, formatDateTime, capitalizeFirst, getReactionEmoji, getReactionLabel } from './utils';

describe.each([
  {
    name: 'formatDateLong',
    format: formatDateLong,
    cases: {
      '2024-01-15T00:00:00': 'Monday, January 15, 2024',
      '2024-12-31T00:00:00': 'Tuesday, December 31, 2024',
      '2026-03-01T00:00:00': 'Sunday, March 1, 2026',
    },
  },
  {
    name: 'formatDate',
    format: formatDate,
    cases: { '2024-01-15T00:00:00': 'Jan 15, 2024', '2024-12-31T00:00:00': 'Dec 31, 2024' },
  },
  {
    name: 'formatTime',
    format: formatTime,
    cases: { '2024-01-15T09:30:00': '9:30 AM', '2024-01-15T14:05:00': '2:05 PM', '2024-01-15T00:00:00': '12:00 AM' },
  },
  {
    name: 'formatDateTime',
    format: formatDateTime,
    cases: { '2024-01-15T09:30:00': 'Jan 15, 2024 at 9:30 AM' },
  },
])('$name', ({ format, cases }) => {
  it.each(Object.entries(cases))('formats %s as %s', (iso, expected) => {
    // ICU may separate AM/PM with a narrow no-break space
    expect(format(new Date(iso)).replace(/\s/g, ' ')).toBe(expected);
  });
});

describe('capitalizeFirst', () => {
  it.each([
    { scenario: 'capitalizes the first character', input: 'hello', expected: 'Hello' },
    { scenario: 'handles already-capitalized string', input: 'Hello', expected: 'Hello' },
    { scenario: 'handles empty string', input: '', expected: '' },
    { scenario: 'handles single character', input: 'a', expected: 'A' },
    { scenario: 'preserves the rest of the string', input: 'hELLO wORLD', expected: 'HELLO wORLD' },
  ])('$scenario', ({ input, expected }) => {
    expect(capitalizeFirst(input)).toBe(expected);
  });
});

describe('getReactionEmoji and getReactionLabel', () => {
  it.each([
    { reaction: '😰', emoji: '😰', label: 'Very Negative' },
    { reaction: '😟', emoji: '😟', label: 'Negative' },
    { reaction: '😐', emoji: '😐', label: 'Neutral' },
    { reaction: '😊', emoji: '😊', label: 'Positive' },
    { reaction: '😍', emoji: '😍', label: 'Very Positive' },
    // Unknown values, including inherited object keys, fall back to neutral
    { reaction: 'unknown', emoji: '😐', label: 'Neutral' },
    { reaction: 'toString', emoji: '😐', label: 'Neutral' },
  ])('maps $reaction to $emoji $label', ({ reaction, emoji, label }) => {
    expect(getReactionEmoji(reaction)).toBe(emoji);
    expect(getReactionLabel(reaction)).toBe(label);
  });
});
