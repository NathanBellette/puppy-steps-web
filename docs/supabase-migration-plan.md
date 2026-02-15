# Supabase Migration Plan

Step-by-step plan for migrating Puppy Steps Web from Firebase to Supabase. This document builds on the analysis in [firebase-evaluation.md](./firebase-evaluation.md).

---

## Overview

| Aspect | Detail |
|--------|--------|
| **Source** | Firebase (Auth, Firestore, Storage, Hosting) |
| **Target** | Supabase (Auth, PostgreSQL, Storage) + Vercel/Netlify for hosting |
| **Strategy** | Full cutover (no dual-write period) — the app has a single user |
| **Data migration** | Export from Firestore, transform, import to Supabase |
| **Estimated scope** | ~10 files changed, ~400 lines rewritten |

---

## Prerequisites

Before starting any migration work:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Note the project credentials**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` (found in Settings > API)
3. **Install the Supabase CLI** for local development and migrations: `npm install -D supabase`
4. **Export existing data from Firestore** using the Firebase CLI or Admin SDK before starting
5. **Commit all current work** — create a `feature/supabase-migration` branch

---

## Phase 1: Database Schema & RLS Policies

Set up the PostgreSQL schema to replace Firestore collections.

### 1.1 Create the initial migration

```bash
npx supabase migration new initial_schema
```

### 1.2 Define tables, enums, and constraints

Write the migration SQL in `supabase/migrations/<timestamp>_initial_schema.sql`:

```sql
-- Enums (replace client-side string validation)
CREATE TYPE session_type AS ENUM ('people', 'dogs', 'environments', 'noises');
CREATE TYPE reaction_level AS ENUM ('😰', '😟', '😐', '😊', '😍');
CREATE TYPE place_type AS ENUM (
  'Home', 'Street', 'Park', 'Store', 'Cafe',
  'Car', 'Vet', 'PublicTransport', 'Other'
);
CREATE TYPE intensity AS ENUM ('low', 'medium', 'high');

-- Users (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  theme TEXT DEFAULT 'system',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dogs
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  age INTEGER,
  breed TEXT NOT NULL CHECK (char_length(breed) BETWEEN 1 AND 100),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  type session_type NOT NULL,
  category TEXT NOT NULL,
  reaction reaction_level NOT NULL,
  place_type place_type DEFAULT 'Other',
  intensity intensity DEFAULT 'low',
  is_new_to_dog BOOLEAN DEFAULT false,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  type session_type NOT NULL,
  calm_target_count INTEGER DEFAULT 5,
  variety_target_count INTEGER DEFAULT 3,
  is_completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_dogs_user ON dogs(user_id);
CREATE INDEX idx_sessions_dog ON sessions(dog_id);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX idx_goals_dog ON goals(dog_id);
```

### 1.3 Add Row Level Security policies

These replace `firestore.rules`:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own dogs" ON dogs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);
```

### 1.4 Add an `updated_at` trigger

Replaces the manual `updatedAt: new Date()` in `firestore.ts`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON dogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 1.5 Add a user-creation trigger

Replaces the manual user document creation in `auth.ts` `signUp()`:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 1.6 (Optional) Add a server-side progress view

Replaces client-side `computeTargetProgress()`:

```sql
CREATE VIEW goal_progress AS
SELECT
  g.id AS goal_id,
  g.dog_id,
  g.user_id,
  g.category,
  g.type,
  g.calm_target_count,
  g.variety_target_count,
  g.is_completed,
  COUNT(*) FILTER (WHERE s.reaction IN ('😐', '😊', '😍')) AS calm_count,
  COUNT(DISTINCT (s.place_type, s.intensity)) AS variety_count
FROM goals g
LEFT JOIN sessions s
  ON s.dog_id = g.dog_id
  AND s.type = g.type
  AND s.category = g.category
WHERE s.user_id = g.user_id
GROUP BY g.id;
```

### 1.7 Apply and verify

```bash
npx supabase db push        # apply to remote project
# or
npx supabase start          # apply locally for testing
```

---

## Phase 2: Storage Buckets

Replace Firebase Storage with Supabase Storage.

### 2.1 Create storage buckets

In the Supabase dashboard (Storage > New Bucket) or via SQL migration:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('dogs', 'dogs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('sessions', 'sessions', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
```

### 2.2 Add storage RLS policies

These replace `storage.rules`:

```sql
-- Dog photos: users can manage files in their own folder
CREATE POLICY "Users can upload dog photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dogs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view dog photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dogs');

CREATE POLICY "Users can delete own dog photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'dogs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Repeat for sessions and avatars buckets
-- (same pattern, swap bucket_id)
```

### 2.3 File size limits

Configure max file size (5 MB) in the Supabase dashboard under Storage > Settings, or enforce in code during upload.

---

## Phase 3: Install Dependencies

### 3.1 Add Supabase SDK

```bash
npm install @supabase/supabase-js
```

### 3.2 Generate TypeScript types

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
```

### 3.3 Remove Firebase SDK (defer until Phase 6 is complete)

Don't remove `firebase` yet — keep it until all code is migrated and verified.

---

## Phase 4: Rewrite the Data Layer

This is the core of the migration. Each file maps 1:1 from Firebase to Supabase.

### 4.1 `src/lib/firebase.ts` → `src/lib/supabase.ts`

**Before** (Firebase):
```typescript
import { initializeApp } from 'firebase/app';
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**After** (Supabase):
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

Single client replaces three separate service instances.

### 4.2 `src/lib/auth.ts`

| Firebase | Supabase |
|----------|----------|
| `signInWithEmailAndPassword(auth, email, password)` | `supabase.auth.signInWithPassword({ email, password })` |
| `createUserWithEmailAndPassword(auth, email, password)` | `supabase.auth.signUp({ email, password, options: { data: { display_name } } })` |
| `firebaseSignOut(auth)` | `supabase.auth.signOut()` |
| `sendPasswordResetEmail(auth, email)` | `supabase.auth.resetPasswordForEmail(email)` |
| `onAuthStateChanged(auth, callback)` | `supabase.auth.onAuthStateChange(callback)` |
| Manual user doc creation in `signUp()` | Handled by database trigger (Phase 1.5) |

### 4.3 `src/lib/firestore.ts` → `src/lib/database.ts`

Replace Firestore CRUD with Supabase queries:

| Operation | Firebase | Supabase |
|-----------|----------|----------|
| Create | `addDoc(collection(db, 'dogs'), data)` | `supabase.from('dogs').insert(data).select().single()` |
| Read (list) | `getDocs(query(collection(db, 'dogs'), where(...)))` | `supabase.from('dogs').select('*').eq('user_id', userId).order('created_at', { ascending: false })` |
| Update | `updateDoc(doc(db, 'dogs', id), data)` | `supabase.from('dogs').update(data).eq('id', id)` |
| Delete | `deleteDoc(doc(db, 'dogs', id))` | `supabase.from('dogs').delete().eq('id', id)` |
| Batch create | `writeBatch` + `batch.set` + `batch.commit` | `supabase.from('goals').insert(goalsArray)` |

Key differences:
- No `convertTimestamps()` needed — Supabase returns ISO strings, parse with `new Date()` if needed
- No `normalizeSessionType()` needed — enum types enforce valid values at the database level
- No `DEFAULT_QUERY_LIMIT` needed — PostgreSQL handles large result sets efficiently, and RLS scopes data automatically
- Column names use `snake_case` (e.g., `user_id` not `userId`) — map in the query layer or use a transform

### 4.4 `src/lib/storage.ts`

| Firebase | Supabase |
|----------|----------|
| `uploadBytes(ref(storage, path), file)` | `supabase.storage.from('dogs').upload(path, file)` |
| `getDownloadURL(snapshot.ref)` | `supabase.storage.from('dogs').getPublicUrl(path)` |

The path structure stays the same: `{userId}/{dogId}/{timestamp}_{filename}`.

### 4.5 `src/context/AuthContext.tsx`

Replace the `onAuthStateChanged` listener:

```typescript
// Before
const unsubscribe = onAuthStateChanged(auth, (user) => { ... });

// After
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    const user = session?.user ?? null;
    // map to AuthUser type
  }
);
return () => subscription.unsubscribe();
```

### 4.6 Hooks (`src/hooks/`)

The hooks (`useDogs.ts`, `useSessions.ts`, `useGoals.ts`) import from the `lib/` layer, so they only need import path changes:

```typescript
// Before
import { getUserDogs, createDog, updateDog, deleteDog } from '@/lib/firestore';

// After
import { getUserDogs, createDog, updateDog, deleteDog } from '@/lib/database';
```

React Query wrapping, cache invalidation, and optimistic updates stay the same.

### 4.7 `useTargetProgress.ts` (optional improvement)

If the `goal_progress` view was created in Phase 1.6, replace the client-side computation:

```typescript
// Before: fetch all sessions + all goals, compute in JS
// After:
const { data } = await supabase
  .from('goal_progress')
  .select('*')
  .eq('dog_id', dogId);
```

This eliminates the most expensive client-side operation.

---

## Phase 5: Environment & Configuration

### 5.1 Update environment variables

**`.env` / `.env.local`:**
```bash
# Remove
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Add
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 5.2 Update `env.example`

Replace Firebase placeholder variables with Supabase ones.

### 5.3 Update `.gitignore`

No changes needed — `.env` is already ignored.

---

## Phase 6: Data Migration

### 6.1 Export data from Firestore

Use the Firebase Admin SDK or CLI to export each collection as JSON:

```bash
# Option A: Firebase CLI export
firebase firestore:export ./firestore-export

# Option B: Write a small Node script using firebase-admin
```

### 6.2 Transform data

Write a transformation script (`scripts/migrate-data.ts`) that:

1. Reads the exported Firestore JSON
2. Converts Firestore document IDs to UUIDs (or generates new UUIDs and maintains a mapping)
3. Converts `camelCase` fields to `snake_case`
4. Converts Firestore Timestamps to ISO 8601 strings
5. Normalizes session types and other enum values
6. Drops legacy fields (`targetCount`, `currentCount`)
7. Outputs Supabase-compatible INSERT statements or CSV

### 6.3 Import data to Supabase

```bash
# Option A: Use the Supabase dashboard SQL editor to run INSERT statements
# Option B: Use psql to import CSV
psql $SUPABASE_DB_URL -c "\copy dogs FROM 'dogs.csv' WITH CSV HEADER"
```

Import order matters due to foreign keys: `users` → `dogs` → `sessions`, `goals`.

### 6.4 Migrate storage files

Download images from Firebase Storage and re-upload to Supabase Storage. A script using both SDKs can automate this:

```typescript
// For each image path in Firebase:
// 1. Download from Firebase Storage
// 2. Upload to Supabase Storage with the same path structure
// 3. Update the photo_url in the database
```

---

## Phase 7: Cleanup

### 7.1 Remove Firebase dependencies

```bash
npm uninstall firebase firebase-tools
```

### 7.2 Delete Firebase configuration files

- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firestore.indexes.json` (if present)
- `storage.rules`
- `src/lib/firebase.ts`

### 7.3 Update `package.json` scripts

Remove any `firebase deploy` or `firebase emulators` scripts.

### 7.4 Update hosting

Deploy to Vercel, Netlify, or Cloudflare Pages instead of Firebase Hosting. All three support Vite SPAs with zero configuration.

---

## Phase 8: Verification Checklist

Run through the entire app flow to verify everything works:

- [ ] **Auth**: Sign up, sign in, sign out, password reset
- [ ] **Dogs**: Create, edit, delete a dog profile; upload dog photo
- [ ] **Sessions**: Log a session, edit, delete; upload session photo; filter by dog/type/date
- [ ] **Goals**: Create goals (including batch creation on new dog); toggle completion; delete
- [ ] **Progress**: Goal progress correctly computed from sessions (calm count + variety count)
- [ ] **Dashboard**: Session stats, recent sessions, goal summary all display correctly
- [ ] **Calendar**: Sessions appear on correct dates
- [ ] **Settings**: Theme and notification preferences persist
- [ ] **RLS**: Verify data isolation — a user cannot access another user's data
- [ ] **Cascade deletes**: Deleting a dog removes its sessions and goals
- [ ] **Storage**: Dog photos and session photos display correctly from Supabase URLs

---

## File Change Summary

| File | Action |
|------|--------|
| `src/lib/firebase.ts` | **Delete** → replaced by `supabase.ts` |
| `src/lib/supabase.ts` | **Create** — Supabase client init |
| `src/lib/auth.ts` | **Rewrite** — Supabase Auth API |
| `src/lib/firestore.ts` | **Delete** → replaced by `database.ts` |
| `src/lib/database.ts` | **Create** — Supabase query functions |
| `src/lib/storage.ts` | **Rewrite** — Supabase Storage API |
| `src/context/AuthContext.tsx` | **Edit** — swap auth listener |
| `src/hooks/useDogProfile.ts` | **Edit** — update imports |
| `src/hooks/useGoals.ts` | **Edit** — update imports |
| `src/hooks/useSessions.ts` | **Edit** — update imports |
| `src/hooks/useTargetProgress.ts` | **Edit** — optionally use `goal_progress` view |
| `src/types/supabase.ts` | **Create** — auto-generated from schema |
| `env.example` | **Edit** — Supabase env vars |
| `firebase.json` | **Delete** |
| `.firebaserc` | **Delete** |
| `firestore.rules` | **Delete** |
| `storage.rules` | **Delete** |
| `supabase/migrations/*.sql` | **Create** — schema + RLS + triggers |

---

## Risk & Rollback

- **Low risk**: The app has a single active user and no production traffic concerns
- **Rollback**: Keep the Firebase project active until the migration is verified. If issues arise, revert to the pre-migration commit and re-enable Firebase env vars
- **Data safety**: Export all Firestore data before making any changes. Keep the export until migration is confirmed successful
