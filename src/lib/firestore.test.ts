import { describe, it, expect } from 'vitest';
import { normalizeSessionType } from '@/types/session';

describe('normalizeSessionType', () => {
  it('passes through lowercase types unchanged', () => {
    expect(normalizeSessionType('people')).toBe('people');
    expect(normalizeSessionType('dogs')).toBe('dogs');
    expect(normalizeSessionType('environments')).toBe('environments');
    expect(normalizeSessionType('noises')).toBe('noises');
  });

  it('normalizes capitalized types from iOS', () => {
    expect(normalizeSessionType('People')).toBe('people');
    expect(normalizeSessionType('Dogs')).toBe('dogs');
    expect(normalizeSessionType('Environments')).toBe('environments');
    expect(normalizeSessionType('Noises')).toBe('noises');
  });

  it('normalizes all-caps types', () => {
    expect(normalizeSessionType('PEOPLE')).toBe('people');
    expect(normalizeSessionType('DOGS')).toBe('dogs');
  });

  it('handles legacy singular types', () => {
    expect(normalizeSessionType('person')).toBe('people');
    expect(normalizeSessionType('dog')).toBe('dogs');
    expect(normalizeSessionType('environment')).toBe('environments');
    expect(normalizeSessionType('noise')).toBe('noises');
  });

  it('handles legacy singular types with capitalization', () => {
    expect(normalizeSessionType('Person')).toBe('people');
    expect(normalizeSessionType('Dog')).toBe('dogs');
  });

  it('defaults to people for unknown types', () => {
    expect(normalizeSessionType('unknown')).toBe('people');
    expect(normalizeSessionType('')).toBe('people');
  });
});
