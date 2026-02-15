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

function authedDb(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

function unauthedDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// --- Users collection ---

describe('Users collection rules', () => {
  it('allows a user to read their own document', async () => {
    const db = authedDb('user-1');
    // Seed data as admin
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-1'), {
        email: 'test@example.com',
        createdAt: new Date(),
      });
    });

    await assertSucceeds(getDoc(doc(db, 'users', 'user-1')));
  });

  it('denies a user from reading another user document', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-2'), {
        email: 'other@example.com',
        createdAt: new Date(),
      });
    });

    await assertFails(getDoc(doc(db, 'users', 'user-2')));
  });

  it('denies unauthenticated access to user documents', async () => {
    const db = unauthedDb();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-1'), {
        email: 'test@example.com',
      });
    });

    await assertFails(getDoc(doc(db, 'users', 'user-1')));
  });

  it('allows a user to create their own document', async () => {
    const db = authedDb('user-1');
    await assertSucceeds(
      setDoc(doc(db, 'users', 'user-1'), {
        email: 'test@example.com',
        createdAt: new Date(),
      })
    );
  });

  it('denies creating a user document without email', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'users', 'user-1'), {
        name: 'Test',
        createdAt: new Date(),
      })
    );
  });

  it('allows a user to delete their own document', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-1'), {
        email: 'test@example.com',
      });
    });

    await assertSucceeds(deleteDoc(doc(db, 'users', 'user-1')));
  });
});

// --- Dogs collection ---

describe('Dogs collection rules', () => {
  const validDog = {
    userId: 'user-1',
    name: 'Buddy',
    age: 6,
    breed: 'Labrador',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('allows owner to read their dog', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'dogs/dog-1'), validDog);
    });

    await assertSucceeds(getDoc(doc(db, 'dogs', 'dog-1')));
  });

  it('denies reading another user\'s dog', async () => {
    const db = authedDb('user-2');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'dogs/dog-1'), validDog);
    });

    await assertFails(getDoc(doc(db, 'dogs', 'dog-1')));
  });

  it('allows creating a dog with valid data', async () => {
    const db = authedDb('user-1');
    await assertSucceeds(setDoc(doc(db, 'dogs', 'dog-1'), validDog));
  });

  it('denies creating a dog for another user', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'dogs', 'dog-1'), {
        ...validDog,
        userId: 'user-2',
      })
    );
  });

  it('denies creating a dog without a name', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'dogs', 'dog-1'), {
        userId: 'user-1',
        age: 6,
        breed: 'Labrador',
      })
    );
  });

  it('denies creating a dog without a valid age', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'dogs', 'dog-1'), {
        userId: 'user-1',
        name: 'Buddy',
        age: 'six', // not a number
        breed: 'Labrador',
      })
    );
  });

  it('allows owner to update their dog', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'dogs/dog-1'), validDog);
    });

    await assertSucceeds(
      updateDoc(doc(db, 'dogs', 'dog-1'), {
        name: 'Buddy Jr',
        userId: 'user-1',
      })
    );
  });

  it('denies updating a dog to change userId', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'dogs/dog-1'), validDog);
    });

    await assertFails(
      updateDoc(doc(db, 'dogs', 'dog-1'), {
        userId: 'user-2',
      })
    );
  });

  it('allows owner to delete their dog', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'dogs/dog-1'), validDog);
    });

    await assertSucceeds(deleteDoc(doc(db, 'dogs', 'dog-1')));
  });
});

// --- Sessions collection ---

describe('Sessions collection rules', () => {
  const validSession = {
    userId: 'user-1',
    dogId: 'dog-1',
    date: new Date(),
    type: 'people',
    category: 'Men',
    reaction: '😊',
    createdAt: new Date(),
  };

  it('allows owner to read their session', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'sessions/s1'), validSession);
    });

    await assertSucceeds(getDoc(doc(db, 'sessions', 's1')));
  });

  it('denies reading another user\'s session', async () => {
    const db = authedDb('user-2');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'sessions/s1'), validSession);
    });

    await assertFails(getDoc(doc(db, 'sessions', 's1')));
  });

  it('allows creating a session with valid data', async () => {
    const db = authedDb('user-1');
    await assertSucceeds(setDoc(doc(db, 'sessions', 's1'), validSession));
  });

  it('denies creating a session without required fields', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'sessions', 's1'), {
        userId: 'user-1',
        dogId: 'dog-1',
        // missing type, category, reaction
      })
    );
  });

  it('denies creating a session for another user', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'sessions', 's1'), {
        ...validSession,
        userId: 'user-2',
      })
    );
  });

  it('allows owner to delete their session', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'sessions/s1'), validSession);
    });

    await assertSucceeds(deleteDoc(doc(db, 'sessions', 's1')));
  });
});

// --- Goals collection ---

describe('Goals collection rules', () => {
  const validGoal = {
    userId: 'user-1',
    dogId: 'dog-1',
    category: 'Men',
    type: 'people',
    targetCount: 5,
    currentCount: 0,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('allows owner to read their goal', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'goals/g1'), validGoal);
    });

    await assertSucceeds(getDoc(doc(db, 'goals', 'g1')));
  });

  it('denies reading another user\'s goal', async () => {
    const db = authedDb('user-2');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'goals/g1'), validGoal);
    });

    await assertFails(getDoc(doc(db, 'goals', 'g1')));
  });

  it('allows creating a goal with valid data', async () => {
    const db = authedDb('user-1');
    await assertSucceeds(setDoc(doc(db, 'goals', 'g1'), validGoal));
  });

  it('denies creating a goal for another user', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'goals', 'g1'), {
        ...validGoal,
        userId: 'user-2',
      })
    );
  });

  it('denies creating a goal without required fields', async () => {
    const db = authedDb('user-1');
    await assertFails(
      setDoc(doc(db, 'goals', 'g1'), {
        userId: 'user-1',
        dogId: 'dog-1',
        // missing category, type, targetCount, currentCount
      })
    );
  });

  it('allows owner to delete their goal', async () => {
    const db = authedDb('user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'goals/g1'), validGoal);
    });

    await assertSucceeds(deleteDoc(doc(db, 'goals', 'g1')));
  });
});

// --- Catch-all deny rule ---

describe('Default deny rule', () => {
  it('denies access to undefined collections', async () => {
    const db = authedDb('user-1');
    await assertFails(getDoc(doc(db, 'unknown', 'doc-1')));
  });

  it('denies unauthenticated access to all collections', async () => {
    const db = unauthedDb();
    await assertFails(getDoc(doc(db, 'dogs', 'dog-1')));
    await assertFails(getDoc(doc(db, 'sessions', 's1')));
    await assertFails(getDoc(doc(db, 'goals', 'g1')));
  });
});
