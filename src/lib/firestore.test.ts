import { describe, it, expect, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { convertTimestamps } from './firestore';

// Mock the firebase module so we don't need a real Firebase app
vi.mock('./firebase', () => ({
  db: {},
}));

describe('convertTimestamps', () => {
  it('passes through plain values unchanged', () => {
    const data = { id: 'doc-1', name: 'Buddy', age: 4 };
    const result = convertTimestamps<typeof data>(data);
    expect(result.id).toBe('doc-1');
    expect(result.name).toBe('Buddy');
    expect(result.age).toBe(4);
  });

  it('converts Firestore Timestamps to JS Dates', () => {
    const ts = Timestamp.fromDate(new Date('2024-06-15T12:00:00Z'));
    const data = { id: 'doc-1', createdAt: ts, name: 'Buddy' };
    const result = convertTimestamps<{ id: string; createdAt: Date; name: string }>(data);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe('2024-06-15T12:00:00.000Z');
    expect(result.name).toBe('Buddy');
  });

  it('converts multiple Timestamp fields', () => {
    const ts1 = Timestamp.fromDate(new Date('2024-01-01'));
    const ts2 = Timestamp.fromDate(new Date('2024-06-01'));
    const data = { createdAt: ts1, updatedAt: ts2 };
    const result = convertTimestamps<{ createdAt: Date; updatedAt: Date }>(data);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  // --- photoURL normalization ---

  it('normalizes photoURL to photoUrl for iOS compatibility', () => {
    const data = { id: 'dog-1', photoURL: 'https://example.com/photo.jpg' };
    const result = convertTimestamps<{ id: string; photoUrl: string }>(data);

    expect(result.photoUrl).toBe('https://example.com/photo.jpg');
    expect((result as Record<string, unknown>)['photoURL']).toBeUndefined();
  });

  it('does not overwrite existing photoUrl with photoURL', () => {
    const data = {
      id: 'dog-1',
      photoUrl: 'https://example.com/web.jpg',
      photoURL: 'https://example.com/ios.jpg',
    };
    const result = convertTimestamps<{ id: string; photoUrl: string }>(data);

    // Should keep the existing photoUrl and not overwrite it
    expect(result.photoUrl).toBe('https://example.com/web.jpg');
  });

  it('handles documents without any photo field', () => {
    const data = { id: 'doc-1', name: 'Test' };
    const result = convertTimestamps<{ id: string; name: string }>(data);

    expect(result.name).toBe('Test');
    expect((result as Record<string, unknown>)['photoUrl']).toBeUndefined();
    expect((result as Record<string, unknown>)['photoURL']).toBeUndefined();
  });

  // --- Session type normalization ---

  it('normalizes capitalized session type', () => {
    const data = { id: 's1', type: 'People', reaction: '😊' };
    const result = convertTimestamps<{ id: string; type: string; reaction: string }>(data);
    expect(result.type).toBe('people');
  });

  it('normalizes all-caps session type', () => {
    const data = { id: 's1', type: 'DOGS', reaction: '😊' };
    const result = convertTimestamps<{ id: string; type: string; reaction: string }>(data);
    expect(result.type).toBe('dogs');
  });

  it('passes through already-lowercase session type', () => {
    const data = { id: 's1', type: 'environments', reaction: '😐' };
    const result = convertTimestamps<{ id: string; type: string; reaction: string }>(data);
    expect(result.type).toBe('environments');
  });

  it('does not normalize type field on non-string values', () => {
    const data = { id: 's1', type: 42 };
    const result = convertTimestamps<{ id: string; type: number }>(data);
    expect(result.type).toBe(42);
  });

  // --- Session default fields ---

  it('defaults missing session fields when reaction is present', () => {
    const data = {
      id: 's1',
      type: 'people',
      reaction: '😊',
      category: 'Men',
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    expect(result['placeType']).toBe('Other');
    expect(result['intensity']).toBe('low');
    expect(result['isNewToDog']).toBe(false);
  });

  it('preserves existing session fields when they have values', () => {
    const data = {
      id: 's1',
      type: 'people',
      reaction: '😊',
      placeType: 'Park',
      intensity: 'high',
      isNewToDog: true,
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    expect(result['placeType']).toBe('Park');
    expect(result['intensity']).toBe('high');
    expect(result['isNewToDog']).toBe(true);
  });

  it('defaults undefined session fields to defaults', () => {
    const data = {
      id: 's1',
      type: 'people',
      reaction: '😊',
      placeType: undefined,
      intensity: undefined,
      isNewToDog: undefined,
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    expect(result['placeType']).toBe('Other');
    expect(result['intensity']).toBe('low');
    expect(result['isNewToDog']).toBe(false);
  });

  it('does not inject session fields on non-session documents', () => {
    const data = { id: 'g1', type: 'people', category: 'Men', targetCount: 5 };
    const result = convertTimestamps<Record<string, unknown>>(data);

    // No reaction field → should not inject placeType/intensity/isNewToDog
    expect(result['placeType']).toBeUndefined();
    expect(result['intensity']).toBeUndefined();
    expect(result['isNewToDog']).toBeUndefined();
  });

  // --- Legacy goal field migration ---

  it('migrates legacy goal targetCount to calmTargetCount and varietyTargetCount', () => {
    const data = {
      id: 'g1',
      targetCount: 7,
      currentCount: 2,
      isCompleted: false,
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    expect(result['calmTargetCount']).toBe(7);
    expect(result['varietyTargetCount']).toBe(3);
  });

  it('does not overwrite existing calmTargetCount', () => {
    const data = {
      id: 'g1',
      targetCount: 7,
      calmTargetCount: 10,
      varietyTargetCount: 5,
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    // Should keep existing values
    expect(result['calmTargetCount']).toBe(10);
    expect(result['varietyTargetCount']).toBe(5);
  });

  it('defaults to 5 when targetCount is falsy', () => {
    const data = {
      id: 'g1',
      targetCount: 0,
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    expect(result['calmTargetCount']).toBe(5);
    expect(result['varietyTargetCount']).toBe(3);
  });

  // --- Combined scenario ---

  it('handles a complete session document with Timestamps and iOS fields', () => {
    const createdTs = Timestamp.fromDate(new Date('2024-03-15'));
    const data = {
      id: 's1',
      userId: 'u1',
      dogId: 'd1',
      date: Timestamp.fromDate(new Date('2024-03-10')),
      type: 'People',
      category: 'Men',
      reaction: '😊',
      photoURL: 'https://example.com/photo.jpg',
      createdAt: createdTs,
    };
    const result = convertTimestamps<Record<string, unknown>>(data);

    expect(result['date']).toBeInstanceOf(Date);
    expect(result['createdAt']).toBeInstanceOf(Date);
    expect(result['type']).toBe('people');
    expect(result['photoUrl']).toBe('https://example.com/photo.jpg');
    expect(result['photoURL']).toBeUndefined();
    expect(result['placeType']).toBe('Other');
    expect(result['intensity']).toBe('low');
    expect(result['isNewToDog']).toBe(false);
  });
});
