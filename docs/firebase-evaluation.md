# Firebase Evaluation: Puppy Steps Web

An analysis of how this project uses Firebase, where it fits well, where it works against us, and a recommendation to migrate to Supabase (PostgreSQL).

## Table of Contents

- [Current Firebase Usage](#current-firebase-usage)
- [Data Model](#data-model)
- [What Firebase Does Well](#what-firebase-does-well)
- [Where Firebase Works Against Us](#where-firebase-works-against-us)
- [Recommendation: Migrate to Supabase](#recommendation-migrate-to-supabase)
- [Migration Scope](#migration-scope)

---

## Current Firebase Usage

The app uses four Firebase services:

| Service | Purpose |
|---------|---------|
| **Authentication** | Email/password sign-up and sign-in |
| **Cloud Firestore** | NoSQL document database for all application data |
| **Firebase Storage** | Image uploads for dog photos and session photos |
| **Firebase Hosting** | SPA hosting with cache headers and SPA rewrites |

Services **not** used: Cloud Functions, Realtime Database, Analytics, Remote Config, or any other Firebase product.

### Authentication

- Single provider: email and password
- Auth state managed via `onAuthStateChanged` listener in `AuthContext`
- On sign-up, a user document is created in Firestore with default preferences

### Storage

Images are stored in user-scoped paths:

```
dogs/{userId}/{dogId}/{timestamp}_{filename}
sessions/{userId}/{sessionId}/{timestamp}_{filename}
avatars/{userId}/{filename}
```

- 5 MB max file size (enforced by security rules)
- Image content types only

### Security Rules

Firestore rules enforce:

- All operations require authentication (`request.auth != null`)
- Users can only access documents where `resource.data.userId == request.auth.uid`
- Field validation on writes (name/breed length, required fields on sessions and goals)
- Default deny on all unmatched paths

Storage rules enforce:

- Authenticated access only
- User-scoped paths
- 5 MB size limit
- Image content types only

---

## Data Model

Four collections with clear relational structure:

```
users/{userId}
├── id, email, displayName, photoURL
├── createdAt, updatedAt
└── preferences { theme, notifications }

dogs/{dogId}
├── id, userId (FK → users)
├── name, age, breed, photoUrl
└── createdAt, updatedAt

sessions/{sessionId}
├── id, userId (FK → users), dogId (FK → dogs)
├── date, type, category, reaction
├── placeType, intensity, isNewToDog
├── notes, photoUrl
└── createdAt, updatedAt

goals/{goalId}
├── id, userId (FK → users), dogId (FK → dogs)
├── category, type
├── calmTargetCount, varietyTargetCount
├── isCompleted, completedDate
├── targetCount, currentCount (legacy fields)
└── createdAt, updatedAt
```

### Relationships

- **users → dogs**: One user has many dogs
- **dogs → sessions**: One dog has many training sessions
- **dogs → goals**: One dog has many goals
- **sessions ↔ goals**: Sessions are matched to goals by `(type, category)` pair for progress computation

### Query Patterns

All queries are simple single-collection lookups with `userId` filtering:

| Query | Pattern |
|-------|---------|
| Get user's dogs | `where('userId', '==', userId)`, `orderBy('createdAt', 'desc')`, limit 100 |
| Get sessions | `where('userId', '==', userId)`, optional `dogId`/`type`/date filters, `orderBy('date', 'desc')`, limit 100 |
| Get goals | `where('userId', '==', userId)`, optional `dogId`, `orderBy('createdAt', 'desc')`, limit 100 |

No real-time listeners (`onSnapshot`) are used. All data is fetched on-demand via React Query with `getDocs`.

### Client-Side Computation

Goal progress and session statistics are computed entirely client-side:

- `computeTargetProgress()` — fetches all sessions for a dog, then loops through goals matching by `(type, category)`, counting calm reactions and unique contexts
- `computeSessionStats()` — aggregates session counts by type, reaction distributions, and streaks
- `computeGoalStats()` — computes completion percentages from raw goal data

These are implemented as pure functions called from `useMemo` hooks.

---

## What Firebase Does Well

### Zero Backend Maintenance

No Cloud Functions, no server code, no infrastructure to manage. The client talks directly to Firestore with security rules handling authorization. For a solo developer, this removes an entire class of operational concerns.

### Quick Setup

Auth, database, storage, and hosting from a single SDK. The initial development velocity is high — the entire data layer (`src/lib/auth.ts`, `firestore.ts`, `storage.ts`) is roughly 400 lines of straightforward code.

### Security Rules Fit the Access Pattern

Every collection uses the same `userId == request.auth.uid` pattern. This maps cleanly to Firestore rules without complex logic.

### Hosting Is Effortless

SPA with static assets, cache headers, and a catch-all rewrite. Firebase Hosting handles this well and the free tier is generous for a personal project.

---

## Where Firebase Works Against Us

### 1. The Data Is Relational, Not Document-Oriented

The schema is four flat collections with foreign keys (`dogs.userId`, `sessions.dogId`, `goals.dogId`). Progress is computed by joining sessions to goals on `(type, category)`. There are no subcollections, no nested documents, no denormalization — nothing that leverages Firestore's document model.

This is a textbook relational schema stored in a document database.

### 2. Client-Side Aggregation Is an Anti-Pattern

The progress computation workflow:

1. Fetch up to 100 session documents from Firestore (one read per document billed)
2. Fetch all goal documents
3. Loop through sessions, matching each to goals by `(type, category)`
4. Count calm reactions, compute variety from `(placeType, intensity)` combinations
5. Return computed progress

In a relational database, this is a single query:

```sql
SELECT
  g.id,
  g.category,
  g.type,
  g.calm_target_count,
  g.variety_target_count,
  COUNT(*) FILTER (WHERE s.reaction >= '😐') AS calm_count,
  COUNT(DISTINCT (s.place_type, s.intensity)) AS variety_count
FROM goals g
LEFT JOIN sessions s
  ON s.dog_id = g.dog_id
  AND s.type = g.type
  AND s.category = g.category
WHERE g.dog_id = $1
GROUP BY g.id;
```

The current approach has three problems:

- **Cost**: every page view that shows progress reads potentially hundreds of documents, each billed individually
- **Performance**: degrades linearly as users log more sessions
- **Correctness**: the 100-document limit means progress may be computed from incomplete data for active users

### 3. No Real-Time Features Are Used

Firestore's primary differentiator is real-time sync via `onSnapshot`. This app uses none of it — all reads go through `getDocs` (one-time fetch) wrapped in React Query. We're paying Firestore's per-read pricing model without benefiting from its real-time capabilities.

### 4. No Schema Enforcement at the Database Level

Data integrity depends entirely on client-side code. The Firestore security rules validate some fields on write, but they can't enforce:

- Foreign key constraints (deleting a dog doesn't cascade to its sessions/goals)
- Enum values for `type`, `reaction`, `placeType`, `intensity`
- Uniqueness constraints

The legacy field normalization in the codebase (`'People'` → `'people'`, `'person'` → `'people'`) is evidence of data consistency issues that a schema-enforced database would prevent.

### 5. Vendor Lock-In

The Firebase SDK is proprietary. The data access patterns, security rules syntax, and storage API are Firebase-specific. Skills learned here transfer to Firebase projects only. SQL, PostgreSQL, and relational modeling transfer everywhere.

---

## Recommendation: Migrate to Supabase

For a learning project focused on best practices, Supabase (PostgreSQL) is a better fit.

### Comparison

| Concern | Firebase (current) | Supabase |
|---------|-------------------|----------|
| Data model | Document store (fighting relational data) | PostgreSQL (natural fit) |
| Aggregations | Client-side, fetches all docs | `SELECT COUNT/SUM/AVG` server-side |
| Auth | Email/password works fine | Same, plus more providers built-in |
| Pricing | Per read/write (unpredictable at scale) | Per connection + storage (predictable) |
| Storage | Works fine | S3-compatible, works fine |
| Schema enforcement | Security rules only | Foreign keys, constraints, enums, types |
| Type safety | Manual TypeScript types | Auto-generated from database schema |
| Real-time | Available but unused | Available via Postgres changes |
| Vendor lock-in | Moderate (proprietary SDK) | Low (standard PostgreSQL, open source) |
| Hosting | Firebase Hosting | Use Vercel, Netlify, or Cloudflare Pages |

### Transferable Skills Gained

- **SQL** — the most durable skill in backend development
- **Relational data modeling** — normalization, foreign keys, constraints, indexes
- **Row Level Security (RLS)** — PostgreSQL-native authorization policies (equivalent to Firestore rules)
- **Server-side aggregation** — `JOIN`, `GROUP BY`, `COUNT`, `FILTER`
- **Database migrations** — schema changes as versioned, reviewable code
- **Type generation from schema** — Supabase CLI generates TypeScript types from the database

---

## Migration Scope

The migration would touch the data layer while keeping the UI unchanged.

### What Changes

| Layer | Current | After Migration |
|-------|---------|-----------------|
| `src/lib/firebase.ts` | Firebase SDK init | Supabase client init |
| `src/lib/auth.ts` | Firebase Auth calls | Supabase Auth calls |
| `src/lib/firestore.ts` | Firestore reads/writes | Supabase queries (SQL via JS client) |
| `src/lib/storage.ts` | Firebase Storage uploads | Supabase Storage uploads |
| `src/hooks/use*.ts` | React Query + Firestore | React Query + Supabase |
| Security rules | `firestore.rules`, `storage.rules` | RLS policies in SQL migrations |
| Hosting | Firebase Hosting | Vercel / Netlify / Cloudflare Pages |
| Environment variables | `VITE_FIREBASE_*` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

### What Stays the Same

- All React components and pages
- React Router configuration
- React Query caching and invalidation strategy
- Form handling (React Hook Form + Zod)
- Styling (Tailwind CSS)
- Build tooling (Vite, TypeScript)
- Test infrastructure (Vitest, Playwright)

The fact that the UI layer wouldn't need changes validates the current architecture — the hooks provide a clean abstraction boundary between data fetching and rendering.

### Database Schema (Target)

```sql
-- Enums for type safety
CREATE TYPE session_type AS ENUM ('people', 'dogs', 'environments', 'noises');
CREATE TYPE reaction_level AS ENUM ('😰', '😟', '😐', '😊', '😍');
CREATE TYPE place_type AS ENUM ('Home', 'Street', 'Park', 'Store', 'Cafe', 'Car', 'Vet', 'PublicTransport', 'Other');
CREATE TYPE intensity AS ENUM ('low', 'medium', 'high');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  theme TEXT DEFAULT 'system',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Row Level Security (replaces Firestore security rules)
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

-- Indexes for common query patterns
CREATE INDEX idx_dogs_user ON dogs(user_id);
CREATE INDEX idx_sessions_dog ON sessions(dog_id);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX idx_goals_dog ON goals(dog_id);
```

### Key Differences from Current Schema

1. **Foreign keys with `ON DELETE CASCADE`** — deleting a dog automatically deletes its sessions and goals
2. **Enum types** — `session_type`, `reaction_level`, `place_type`, `intensity` are enforced at the database level, preventing the data consistency issues that required client-side normalization
3. **Check constraints** — name and breed length validated by the database, not just security rules
4. **Indexes** — explicit indexes on foreign keys and common query patterns
5. **UUID primary keys** — consistent with Supabase Auth user IDs
