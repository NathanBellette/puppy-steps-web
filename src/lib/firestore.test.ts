import { describe, it, expect, vi } from 'vitest';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { convertTimestamps } from './firestore';

// Mock the firebase module so we don't need a real Firebase app
vi.mock('./firebase', () => ({
  db: {},
}));

const convert = (data: DocumentData) => convertTimestamps<Record<string, unknown>>(data);

const sessionDefaults = { placeType: 'Other', intensity: 'low', isNewToDog: false };

describe('convertTimestamps', () => {
  it('passes through plain values unchanged', () => {
    expect(convert({ id: 'doc-1', name: 'Buddy', age: 4 })).toEqual({ id: 'doc-1', name: 'Buddy', age: 4 });
  });

  it('converts Firestore Timestamps to JS Dates', () => {
    const ts = Timestamp.fromDate(new Date('2024-06-15T12:00:00Z'));
    const result = convertTimestamps<{ id: string; createdAt: Date; name: string }>({ id: 'doc-1', createdAt: ts, name: 'Buddy' });

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe('2024-06-15T12:00:00.000Z');
    expect(result.name).toBe('Buddy');
  });

  it('converts multiple Timestamp fields', () => {
    const result = convert({
      createdAt: Timestamp.fromDate(new Date('2024-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-06-01')),
    });

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  // --- photoURL normalization ---

  it.each([
    {
      scenario: 'normalizes photoURL to photoUrl for iOS compatibility',
      data: { id: 'dog-1', photoURL: 'https://example.com/photo.jpg' },
      photoUrl: 'https://example.com/photo.jpg',
      photoURL: undefined,
    },
    {
      // Should keep the existing photoUrl and not overwrite it
      scenario: 'does not overwrite existing photoUrl with photoURL',
      data: { id: 'dog-1', photoUrl: 'https://example.com/web.jpg', photoURL: 'https://example.com/ios.jpg' },
      photoUrl: 'https://example.com/web.jpg',
      photoURL: 'https://example.com/ios.jpg',
    },
    {
      scenario: 'handles documents without any photo field',
      data: { id: 'doc-1', name: 'Test' },
      photoUrl: undefined,
      photoURL: undefined,
    },
  ])('$scenario', ({ data, photoUrl, photoURL }) => {
    const result = convert(data);

    expect(result['photoUrl']).toBe(photoUrl);
    expect(result['photoURL']).toBe(photoURL);
  });

  // --- Session type normalization ---

  it.each([
    { scenario: 'normalizes capitalized session type', type: 'People', expected: 'people' },
    { scenario: 'normalizes all-caps session type', type: 'DOGS', expected: 'dogs' },
    { scenario: 'passes through already-lowercase session type', type: 'environments', expected: 'environments' },
    { scenario: 'does not normalize type field on non-string values', type: 42, expected: 42 },
  ])('$scenario', ({ type, expected }) => {
    expect(convert({ id: 's1', type, reaction: '😊' })['type']).toBe(expected);
  });

  // --- Session default fields ---

  it.each([
    {
      scenario: 'defaults missing session fields when reaction is present',
      data: { id: 's1', type: 'people', reaction: '😊', category: 'Men' },
      expected: sessionDefaults,
    },
    {
      scenario: 'preserves existing session fields when they have values',
      data: { id: 's1', type: 'people', reaction: '😊', placeType: 'Park', intensity: 'high', isNewToDog: true },
      expected: { placeType: 'Park', intensity: 'high', isNewToDog: true },
    },
    {
      scenario: 'defaults undefined session fields to defaults',
      data: { id: 's1', type: 'people', reaction: '😊', placeType: undefined, intensity: undefined, isNewToDog: undefined },
      expected: sessionDefaults,
    },
    {
      // No reaction field → not a session, so nothing is injected
      scenario: 'does not inject session fields on non-session documents',
      data: { id: 'g1', type: 'people', category: 'Men', targetCount: 5 },
      expected: { placeType: undefined, intensity: undefined, isNewToDog: undefined },
    },
  ])('$scenario', ({ data, expected }) => {
    const { placeType, intensity, isNewToDog } = convert(data);

    expect({ placeType, intensity, isNewToDog }).toEqual(expected);
  });

  // --- Legacy goal field migration ---

  it.each([
    {
      scenario: 'migrates legacy goal targetCount to calmTargetCount and varietyTargetCount',
      data: { id: 'g1', targetCount: 7, currentCount: 2, isCompleted: false },
      expected: { calmTargetCount: 7, varietyTargetCount: 3 },
    },
    {
      scenario: 'does not overwrite existing calmTargetCount',
      data: { id: 'g1', targetCount: 7, calmTargetCount: 10, varietyTargetCount: 5 },
      expected: { calmTargetCount: 10, varietyTargetCount: 5 },
    },
    {
      scenario: 'defaults to 5 when targetCount is falsy',
      data: { id: 'g1', targetCount: 0 },
      expected: { calmTargetCount: 5, varietyTargetCount: 3 },
    },
  ])('$scenario', ({ data, expected }) => {
    expect(convert(data)).toMatchObject(expected);
  });

  // --- Combined scenario ---

  it('handles a complete session document with Timestamps and iOS fields', () => {
    const result = convert({
      id: 's1',
      userId: 'u1',
      dogId: 'd1',
      date: Timestamp.fromDate(new Date('2024-03-10')),
      type: 'People',
      category: 'Men',
      reaction: '😊',
      photoURL: 'https://example.com/photo.jpg',
      createdAt: Timestamp.fromDate(new Date('2024-03-15')),
    });

    expect(result['date']).toBeInstanceOf(Date);
    expect(result['createdAt']).toBeInstanceOf(Date);
    expect(result['photoURL']).toBeUndefined();
    expect(result).toMatchObject({ type: 'people', photoUrl: 'https://example.com/photo.jpg', ...sessionDefaults });
  });
});
