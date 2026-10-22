/**
 * Firestore Security Rules Tests
 *
 * These tests validate the Firestore security rules defined in firestore.rules.
 * They require the Firebase Firestore emulator to be running on port 8080.
 *
 * Run with: npm run test:rules
 * Or manually: firebase emulators:exec --only firestore 'npx vitest run src/rules/'
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'puppy-steps-test',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// --- Helpers ---

type DocData = Record<string, unknown>;

/** Firestore client acting as the given user, or as an unauthenticated visitor when uid is null. */
const dbAs = (uid: string | null) =>
  (uid ? testEnv.authenticatedContext(uid) : testEnv.unauthenticatedContext()).firestore();

const readAs = (uid: string | null, path: string) => getDoc(doc(dbAs(uid), path));
const createAs = (uid: string, path: string, data: DocData) => setDoc(doc(dbAs(uid), path), data);
const updateAs = (uid: string, path: string, data: DocData) => updateDoc(doc(dbAs(uid), path), data);
const deleteAs = (uid: string, path: string) => deleteDoc(doc(dbAs(uid), path));

/** Writes a document with security rules disabled, as an admin would. */
const seed = (path: string, data: DocData) =>
  testEnv.withSecurityRulesDisabled((context) => setDoc(doc(context.firestore(), path), data));

// --- Users collection ---

describe('Users collection rules', () => {
  const ownUser = { email: 'test@example.com', createdAt: new Date() };

  it('allows a user to read their own document', async () => {
    await seed('users/user-1', ownUser);
    await assertSucceeds(readAs('user-1', 'users/user-1'));
  });

  it('denies a user from reading another user document', async () => {
    await seed('users/user-2', { email: 'other@example.com', createdAt: new Date() });
    await assertFails(readAs('user-1', 'users/user-2'));
  });

  it('denies unauthenticated access to user documents', async () => {
    await seed('users/user-1', { email: 'test@example.com' });
    await assertFails(readAs(null, 'users/user-1'));
  });

  it('allows a user to create their own document', () =>
    assertSucceeds(createAs('user-1', 'users/user-1', ownUser)));

  it('denies creating a user document without email', () =>
    assertFails(createAs('user-1', 'users/user-1', { name: 'Test', createdAt: new Date() })));

  it('allows a user to delete their own document', async () => {
    await seed('users/user-1', { email: 'test@example.com' });
    await assertSucceeds(deleteAs('user-1', 'users/user-1'));
  });
});

// --- Collections owned by a user via a userId field ---

/**
 * Defines the rules tests shared by every user-owned collection: owners can read,
 * create and delete their documents, and nobody can touch another user's documents.
 */
const describeOwnedCollection = (
  title: string,
  noun: string,
  path: string,
  validDoc: DocData,
  invalidDocs: Record<string, DocData>,
  extraTests: () => void = () => {}
) =>
  describe(title, () => {
    it(`allows owner to read their ${noun}`, async () => {
      await seed(path, validDoc);
      await assertSucceeds(readAs('user-1', path));
    });

    it(`denies reading another user's ${noun}`, async () => {
      await seed(path, validDoc);
      await assertFails(readAs('user-2', path));
    });

    it(`allows creating a ${noun} with valid data`, () => assertSucceeds(createAs('user-1', path, validDoc)));

    it(`denies creating a ${noun} for another user`, () =>
      assertFails(createAs('user-1', path, { ...validDoc, userId: 'user-2' })));

    it.each(Object.entries(invalidDocs))(`denies creating a ${noun} %s`, (_reason, data) =>
      assertFails(createAs('user-1', path, data)));

    it(`allows owner to delete their ${noun}`, async () => {
      await seed(path, validDoc);
      await assertSucceeds(deleteAs('user-1', path));
    });

    extraTests();
  });

const validDog = {
  userId: 'user-1',
  name: 'Buddy',
  age: 6,
  breed: 'Labrador',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describeOwnedCollection(
  'Dogs collection rules',
  'dog',
  'dogs/dog-1',
  validDog,
  {
    'without a name': { userId: 'user-1', age: 6, breed: 'Labrador' },
    'without a valid age': { userId: 'user-1', name: 'Buddy', age: 'six', breed: 'Labrador' },
  },
  () => {
    it('allows owner to update their dog', async () => {
      await seed('dogs/dog-1', validDog);
      await assertSucceeds(updateAs('user-1', 'dogs/dog-1', { name: 'Buddy Jr', userId: 'user-1' }));
    });

    it('denies updating a dog to change userId', async () => {
      await seed('dogs/dog-1', validDog);
      await assertFails(updateAs('user-1', 'dogs/dog-1', { userId: 'user-2' }));
    });
  }
);

describeOwnedCollection(
  'Sessions collection rules',
  'session',
  'sessions/s1',
  {
    userId: 'user-1',
    dogId: 'dog-1',
    date: new Date(),
    type: 'people',
    category: 'Men',
    reaction: '😊',
    createdAt: new Date(),
  },
  // Missing type, category and reaction
  { 'without required fields': { userId: 'user-1', dogId: 'dog-1' } }
);

describeOwnedCollection(
  'Goals collection rules',
  'goal',
  'goals/g1',
  {
    userId: 'user-1',
    dogId: 'dog-1',
    category: 'Men',
    type: 'people',
    targetCount: 5,
    currentCount: 0,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Missing category, type, targetCount and currentCount
  { 'without required fields': { userId: 'user-1', dogId: 'dog-1' } }
);

// --- Catch-all deny rule ---

describe('Default deny rule', () => {
  it('denies access to undefined collections', () => assertFails(readAs('user-1', 'unknown/doc-1')));

  it('denies unauthenticated access to all collections', async () => {
    for (const path of ['dogs/dog-1', 'sessions/s1', 'goals/g1']) {
      await assertFails(readAs(null, path));
    }
  });
});
