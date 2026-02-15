# PuppySteps — Cross-Platform Feature Parity Specification

**Version:** 1.0  
**Last Updated:** February 15, 2026  
**Source of Truth:** React Web Application  
**Target Platform:** iOS (Swift/SwiftUI)

---

## 1. App Overview

### App Identity
- **Name:** PuppySteps
- **Purpose:** Puppy socialization tracking and management application
- **Target Audience:** Puppy owners during the critical socialization period (typically 3-16 weeks of age)

### Core Value Proposition
PuppySteps helps puppy owners systematically track and manage their puppy's socialization journey across four key areas:
- **People** (men, women, children, elderly, people with hats/glasses)
- **Dogs** (small dogs, big dogs, puppies, seniors, different breeds)
- **Environments** (parks, sidewalks, cafés, vet offices, pet stores, cars, public transport, elevators)
- **Noises & Objects** (vacuum cleaners, car horns, thunder, fireworks, doorbells, phones, umbrellas, bicycles, skateboards)

The app uses a dual-metric progress system tracking both:
1. **Calm Exposures** — Number of positive/neutral reactions (building confidence)
2. **Variety** — Different contexts experienced (building generalization)

---

## 2. Authentication & User Management

### Sign In Flow

**UI Components:**
- Email input field (type: email)
- Password input field (type: password, min 6 characters)
- "Sign In" button
- "Forgot password?" link
- Toggle to switch to Sign Up mode

**Validation Rules:**
- Email: Must be valid email format
  - Error message: "Please enter a valid email address"
- Password: Minimum 6 characters
  - Error message: "Password must be at least 6 characters"

**Validation Schema (Zod):**
```typescript
{
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
}
```

**Error Handling:**
- Display error message in red banner above form
- Firebase auth errors are caught and displayed as user-friendly messages
- Loading state shows "Signing In..." on button while authenticating

**User Flow:**
1. User enters email and password
2. Client-side validation runs on submit
3. If valid, call Firebase `signInWithEmailAndPassword`
4. On success: redirect to `/dashboard` (or previous protected route if navigated from there)
5. On error: display error message, keep user on auth page

### Sign Up Flow

**UI Components:**
- Full Name input field (min 2 characters)
- Email input field (type: email)
- Password input field (type: password, min 6 characters)
- "Create Account" button
- Toggle to switch to Sign In mode

**Validation Rules:**
- Display Name: Minimum 2 characters
  - Error message: "Name must be at least 2 characters"
- Email: Must be valid email format
  - Error message: "Please enter a valid email address"
- Password: Minimum 6 characters
  - Error message: "Password must be at least 6 characters"

**Validation Schema (Zod):**
```typescript
{
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters')
}
```

**User Flow:**
1. User enters display name, email, and password
2. Client-side validation runs on submit
3. If valid, call Firebase `createUserWithEmailAndPassword`
4. Update user profile with display name using `updateProfile`
5. On success: automatically signed in, redirect to `/dashboard`
6. On error: display error message, keep user on auth page

### Password Reset Flow

**UI Components:**
- Accessed via "Forgot password?" link on Sign In form
- Uses email field value from Sign In form
- Click triggers password reset email

**User Flow:**
1. User must enter email address first
2. Click "Forgot password?" link
3. If no email entered: show error "Please enter your email address first"
4. If valid email: call Firebase `sendPasswordResetEmail`
5. On success: show green success banner "Password reset email sent. Check your inbox."
6. On error: display error message

**Firebase Integration:**
- Uses Firebase Auth `sendPasswordResetEmail(auth, email)`
- Firebase handles email delivery and reset link generation

### Auth State Persistence

**Implementation:**
- Firebase Auth persists user session automatically (IndexedDB)
- User state managed via `AuthContext` using React Context API
- `onAuthStateChanged` listener monitors auth state changes
- Loading state shown during initial auth check

**State Management:**
```typescript
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### Route Protection

**Protected Routes:**
- `/dashboard`
- `/goals`
- `/sessions`
- `/calendar`
- `/resources`
- `/settings`
- `/` (root redirects to `/dashboard`)

**Unauthenticated Behavior:**
- All protected routes wrapped in `<ProtectedRoute>` component
- If `user === null` and `loading === false`: redirect to `/auth`
- Redirect preserves intended destination via `location.state.from`
- After successful auth, user redirected to intended route or `/dashboard`

**Loading State:**
- While `loading === true`, show full-page spinner/loader
- Prevents flash of unauthenticated content

**Public Routes:**
- `/auth` — accessible without authentication
- If authenticated user visits `/auth`, redirect to `/dashboard`

### User Data Model

**AuthUser Interface:**
```typescript
interface AuthUser {
  uid: string;              // Firebase Auth UID (required)
  email: string | null;     // User's email address
  displayName: string | null; // User's full name
  photoURL: string | null;  // Profile photo URL (unused in current implementation)
}
```

**Firestore User Document (Optional):**
```typescript
interface User {
  id: string;               // Document ID (matches Auth UID)
  email: string;            // User's email
  displayName?: string;     // User's full name
  photoURL?: string;        // Profile photo URL
  createdAt: Date;          // Account creation timestamp
  updatedAt: Date;          // Last update timestamp
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}
```

**Collection:** `users/{userId}`

**Note:** Current web implementation relies primarily on Firebase Auth user object. Firestore user documents are defined but not actively used for core functionality.

---

## 3. Data Models (Firebase Firestore)

### Dog Model

**Collection Name:** `dogs`

**Document Structure:**
```typescript
interface Dog {
  id: string;              // Firestore document ID (required)
  userId: string;          // Owner's Firebase Auth UID (required, indexed)
  name: string;            // Dog's name (required)
  age: number;             // Age in months (required)
  breed: string;           // Breed name (required)
  photoUrl?: string;       // Profile photo URL from Firebase Storage (optional)
  createdAt: Date;         // Document creation timestamp (required)
  updatedAt: Date;         // Last update timestamp (required)
}
```

**Field Details:**
- `id`: Auto-generated Firestore document ID
- `userId`: Foreign key to Firebase Auth user (indexed for queries)
- `name`: Plain text, max 100 characters (validated by security rules)
- `age`: Integer representing months old, must be ≥ 0
- `breed`: Plain text, max 100 characters (validated by security rules)
- `photoUrl`: Full Firebase Storage download URL, not path
- `createdAt`: Set automatically on creation
- `updatedAt`: Updated automatically on any document update

**Relationships:**
- One User → Many Dogs (1:N)
- One Dog → Many Sessions (1:N)
- One Dog → Many Goals (1:N)

**iOS Compatibility Notes:**
- Web uses `photoUrl` (lowercase 'u')
- iOS may use `photoURL` (uppercase 'URL')
- **Normalization:** `convertTimestamps` function converts `photoURL` → `photoUrl` for consistency

**Storage Path for Photos:**
```
dogs/{userId}/{dogId}/{timestamp}_{filename}
```

### Session Model

**Collection Name:** `sessions`

**Document Structure:**
```typescript
interface Session {
  id: string;              // Firestore document ID (required)
  userId: string;          // Owner's Firebase Auth UID (required, indexed)
  dogId: string;           // Reference to Dog document ID (required, indexed)
  date: Date;              // Session date (required, indexed for sorting)
  type: SessionType;       // 'people' | 'dogs' | 'environments' | 'noises' (required)
  category: string;        // Specific subcategory within type (required)
  reaction: ReactionLevel; // '😰' | '😟' | '😐' | '😊' | '😍' (required)
  placeType?: PlaceType;   // Where session occurred (optional, default: 'Other')
  intensity?: Intensity;   // 'low' | 'medium' | 'high' (optional, default: 'low')
  isNewToDog?: boolean;    // First time meeting this individual (optional, default: false)
  notes?: string;          // Free-form notes (optional)
  photoUrl?: string;       // Session photo URL from Firebase Storage (optional)
  createdAt: Date;         // Document creation timestamp (required)
  updatedAt?: Date;        // Last update timestamp (optional)
}
```

**Type Definitions:**
```typescript
type SessionType = 'people' | 'dogs' | 'environments' | 'noises';
type ReactionLevel = '😰' | '😟' | '😐' | '😊' | '😍';
type PlaceType = 'Home' | 'Street' | 'Park' | 'Store' | 'Cafe' | 'Car' | 'Vet' | 'PublicTransport' | 'Other';
type Intensity = 'low' | 'medium' | 'high';
```

**Field Details:**
- `id`: Auto-generated Firestore document ID
- `userId`: Foreign key to Firebase Auth user (indexed)
- `dogId`: Foreign key to Dog document (indexed)
- `date`: JavaScript Date object, converted from Firestore Timestamp
- `type`: Must be one of 4 predefined session types (lowercase)
- `category`: Must match one of the predefined categories for the type
- `reaction`: Emoji string representing dog's reaction level
- `placeType`: Context where session occurred (defaults to 'Other' if missing)
- `intensity`: Exposure intensity level (defaults to 'low' if missing)
- `isNewToDog`: Only relevant for 'people' and 'dogs' types (defaults to false if missing)
- `notes`: Free-form text, no length limit
- `photoUrl`: Full Firebase Storage download URL
- `createdAt`: Set automatically on creation
- `updatedAt`: Updated automatically on document update

**Relationships:**
- Many Sessions → One User (N:1)
- Many Sessions → One Dog (N:1)

**Legacy/Backward Compatibility:**
- **Type Casing Normalization:** iOS historically sent capitalized types ("People", "Dogs", etc.)
  - `normalizeSessionType()` converts to lowercase canonical form
  - Legacy mappings: "Person" → "people", "Dog" → "dogs", "Environment" → "environments", "Noise" → "noises"
- **Default Field Injection:** Old documents may lack `placeType`, `intensity`, or `isNewToDog`
  - `convertTimestamps()` injects defaults when loading documents
  - Defaults: `placeType = 'Other'`, `intensity = 'low'`, `isNewToDog = false`

**iOS Compatibility Notes:**
- `photoURL` → `photoUrl` normalization happens in `convertTimestamps()`
- Session type must be lowercase in Firestore (normalization ensures this)

**Storage Path for Photos:**
```
sessions/{userId}/{sessionId}/{timestamp}_{filename}
```

### Goal Model

**Collection Name:** `goals`

**Document Structure:**
```typescript
interface Goal {
  id: string;                  // Firestore document ID (required)
  userId: string;              // Owner's Firebase Auth UID (required, indexed)
  dogId: string;               // Reference to Dog document ID (required, indexed)
  category: string;            // Specific category (e.g., "Children", "Small Dogs") (required)
  type: SessionType;           // 'people' | 'dogs' | 'environments' | 'noises' (required)
  calmTargetCount: number;     // Target number of calm exposures (required, default: 5)
  varietyTargetCount: number;  // Target number of unique contexts (required, default: 3)
  // Legacy fields (kept for backward compatibility, not written by new UI)
  isCompleted: boolean;        // Legacy completion flag (required for old documents)
  completedDate?: Date;        // Legacy completion timestamp (optional)
  targetCount: number;         // Legacy single target count (required for old documents)
  currentCount: number;        // Legacy progress counter (required for old documents)
  createdAt: Date;             // Document creation timestamp (required)
  updatedAt: Date;             // Last update timestamp (required)
}
```

**Field Details:**
- `id`: Auto-generated Firestore document ID
- `userId`: Foreign key to Firebase Auth user (indexed)
- `dogId`: Foreign key to Dog document (indexed)
- `category`: Exact string matching predefined goal categories
- `type`: Parent type for categorization
- `calmTargetCount`: Number of calm/positive exposures needed (≥neutral reaction)
- `varietyTargetCount`: Number of unique context combinations needed
- `isCompleted`: **Legacy** — new system computes completion dynamically from sessions
- `completedDate`: **Legacy** — not used by new system
- `targetCount`: **Legacy** — superseded by `calmTargetCount`
- `currentCount`: **Legacy** — superseded by session-based computation
- `createdAt`: Set automatically on creation
- `updatedAt`: Updated automatically on document update

**Relationships:**
- Many Goals → One User (N:1)
- Many Goals → One Dog (N:1)
- Goals → Sessions: Implicit relationship via (dogId, type, category) matching

**Legacy/Backward Compatibility:**
- **Dual-Target Migration:** Old goals only have `targetCount`, new goals have `calmTargetCount` + `varietyTargetCount`
  - `convertTimestamps()` migrates old documents on load:
    ```typescript
    if ('targetCount' in document && !('calmTargetCount' in document)) {
      calmTargetCount = targetCount || 5;
      varietyTargetCount = 3;
    }
    ```
- **Progress Computation:** Old system stored `currentCount` and `isCompleted` in Firestore
  - New system computes progress dynamically from sessions via `computeTargetProgress()`
  - Legacy fields preserved but ignored by UI

**Default Values:**
- `calmTargetCount`: 5
- `varietyTargetCount`: 3
- `isCompleted`: false
- `currentCount`: 0

### User Model (Optional/Future)

**Collection Name:** `users`

**Document Structure:**
```typescript
interface User {
  id: string;              // Firestore document ID (matches Auth UID) (required)
  email: string;           // User's email address (required)
  displayName?: string;    // User's full name (optional)
  photoURL?: string;       // Profile photo URL (optional)
  createdAt: Date;         // Account creation timestamp (required)
  updatedAt: Date;         // Last update timestamp (required)
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}
```

**Field Details:**
- `id`: Matches Firebase Auth UID
- `email`: Required, validated by security rules
- `displayName`: Optional display name
- `photoURL`: Optional profile photo URL
- `preferences.theme`: UI theme preference (persisted in localStorage on web, not Firestore)
- `preferences.notifications`: Notification toggle (not implemented in current version)

**Note:** User documents are defined but NOT actively used in current web implementation. Auth relies on Firebase Auth user object only. This model exists for future expansion.

### Data Normalization & Migration

**convertTimestamps Function:**

This critical function runs on every document loaded from Firestore and performs:

1. **Timestamp Conversion:** Firestore `Timestamp` → JavaScript `Date`
2. **Field Normalization:**
   - `photoURL` → `photoUrl` (iOS → web compatibility)
3. **Session Type Normalization:**
   - Calls `normalizeSessionType()` to convert capitalized → lowercase
4. **Session Default Injection:**
   - If document has `reaction` field (identifies as Session):
     - `placeType = 'Other'` if missing
     - `intensity = 'low'` if missing
     - `isNewToDog = false` if missing
5. **Goal Legacy Migration:**
   - If document has `targetCount` but missing `calmTargetCount`:
     - `calmTargetCount = targetCount || 5`
     - `varietyTargetCount = 3`

**normalizeSessionType Function:**

Converts session type strings to canonical lowercase format:

```typescript
function normalizeSessionType(type: string): SessionType {
  const lower = type.toLowerCase();
  
  // Canonical types
  if (lower === 'people') return 'people';
  if (lower === 'dogs') return 'dogs';
  if (lower === 'environments') return 'environments';
  if (lower === 'noises') return 'noises';
  
  // Legacy iOS mappings (singular → plural)
  if (lower === 'person') return 'people';
  if (lower === 'dog') return 'dogs';
  if (lower === 'environment') return 'environments';
  if (lower === 'noise') return 'noises';
  
  // Fallback default
  return 'people';
}
```

**Critical for iOS:** All session types MUST be stored as lowercase plural forms in Firestore. iOS client must normalize before writing.

---

## 4. Predefined Data & Constants

This section documents ALL hardcoded data that must match exactly between web and iOS implementations. Any mismatch will cause data inconsistencies.

### Session Types

**Type Definitions:**
```typescript
type SessionType = 'people' | 'dogs' | 'environments' | 'noises';
```

**Type Emoji Mapping:**
```typescript
const SESSION_TYPE_EMOJI: Record<SessionType, string> = {
  people: '👥',
  dogs: '🐕',
  environments: '🏠',
  noises: '🔊',
};
```

**iOS Implementation:** Use SF Symbols or Unicode emoji matching these exact codepoints.

### Session Categories

**CRITICAL:** These exact strings must be used. Capitalization, spacing, and spelling must match precisely.

```typescript
const SESSION_CATEGORIES: Record<SessionType, string[]> = {
  people: [
    'Men',
    'Women',
    'Children',
    'Elderly People',
    'People with Hats',
    'People with Glasses'
  ],
  dogs: [
    'Small Dogs',
    'Big Dogs',
    'Puppies',
    'Senior Dogs',
    'Different Breeds'
  ],
  environments: [
    'Park',
    'Sidewalk',
    'Café',           // Note: accent on 'e'
    'Vet Office',
    'Pet Store',
    'Car Rides',
    'Public Transport',
    'Elevator'
  ],
  noises: [
    'Vacuum Cleaner',
    'Car Horns',
    'Thunder',
    'Fireworks',
    'Doorbell',
    'Phone Ringing',
    'Umbrella',
    'Bicycles',
    'Skateboards'
  ],
};
```

**Total:** 6 people + 5 dogs + 8 environments + 9 noises = **28 categories**

### Reaction Levels

**Type Definition:**
```typescript
type ReactionLevel = '😰' | '😟' | '😐' | '😊' | '😍';
```

**Emoji Characters (Unicode):**
- '😰' — U+1F630 (Anxious Face with Sweat)
- '😟' — U+1F61F (Worried Face)
- '😐' — U+1F610 (Neutral Face)
- '😊' — U+1F60A (Smiling Face with Smiling Eyes)
- '😍' — U+1F60D (Smiling Face with Heart-Eyes)

**Label Mapping:**
```typescript
const REACTION_LABELS: Record<ReactionLevel, string> = {
  '😰': 'Very Negative',
  '😟': 'Negative',
  '😐': 'Neutral',
  '😊': 'Positive',
  '😍': 'Very Positive',
};
```

**Numeric Values (for calculations):**
```typescript
const REACTION_VALUES: Record<ReactionLevel, number> = {
  '😰': 1,
  '😟': 2,
  '😐': 3,
  '😊': 4,
  '😍': 5,
};
```

**Calm Threshold:** Reactions '😐', '😊', '😍' are considered "calm" (neutral or better).

### Place Types

**Type Definition:**
```typescript
type PlaceType = 'Home' | 'Street' | 'Park' | 'Store' | 'Cafe' | 'Car' | 'Vet' | 'PublicTransport' | 'Other';
```

**Array (for iteration):**
```typescript
const PLACE_TYPES: PlaceType[] = [
  'Home',
  'Street',
  'Park',
  'Store',
  'Cafe',
  'Car',
  'Vet',
  'PublicTransport',
  'Other'
];
```

**Display Label Mapping:**
```typescript
const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  Home: 'Home',
  Street: 'Street',
  Park: 'Park',
  Store: 'Store',
  Cafe: 'Cafe',
  Car: 'Car',
  Vet: 'Vet',
  PublicTransport: 'Public Transport',  // Note: space in display label
  Other: 'Other',
};
```

**Total:** 9 place types

### Intensity Levels

**Type Definition:**
```typescript
type Intensity = 'low' | 'medium' | 'high';
```

**Array (for iteration):**
```typescript
const INTENSITY_LEVELS: Intensity[] = ['low', 'medium', 'high'];
```

**Display Label Mapping:**
```typescript
const INTENSITY_LABELS: Record<Intensity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
```

**Total:** 3 intensity levels

### Predefined Goals (28 Targets)

**CRITICAL:** When creating initial goals for a new dog, these exact 28 goals must be created atomically.

**Default Target Values:**
```typescript
const DEFAULT_CALM_TARGET = 5;
const DEFAULT_VARIETY_TARGET = 3;
```

**Goal Definitions:**
```typescript
const PREDEFINED_GOALS: Array<{
  category: string;
  type: SessionType;
  calmTargetCount: number;
  varietyTargetCount: number;
}> = [
  // People (6 targets)
  { category: 'Men', type: 'people', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Women', type: 'people', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Children', type: 'people', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Elderly People', type: 'people', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'People with Hats', type: 'people', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'People with Glasses', type: 'people', calmTargetCount: 5, varietyTargetCount: 3 },
  
  // Dogs (5 targets)
  { category: 'Small Dogs', type: 'dogs', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Big Dogs', type: 'dogs', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Puppies', type: 'dogs', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Senior Dogs', type: 'dogs', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Different Breeds', type: 'dogs', calmTargetCount: 5, varietyTargetCount: 3 },
  
  // Environments (8 targets)
  { category: 'Park', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Sidewalk', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Café', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Vet Office', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Pet Store', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Car Rides', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Public Transport', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Elevator', type: 'environments', calmTargetCount: 5, varietyTargetCount: 3 },
  
  // Noises (9 targets)
  { category: 'Vacuum Cleaner', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Car Horns', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Thunder', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Fireworks', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Doorbell', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Phone Ringing', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Umbrella', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Bicycles', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
  { category: 'Skateboards', type: 'noises', calmTargetCount: 5, varietyTargetCount: 3 },
];
```

**Batch Creation:** When a new dog is created, all 28 goals should be created in a single atomic batch write to Firestore.

**Goal Document Template:**
```typescript
{
  userId: string;           // Current user's Firebase Auth UID
  dogId: string;            // Newly created dog's document ID
  category: string;         // From PREDEFINED_GOALS
  type: SessionType;        // From PREDEFINED_GOALS
  calmTargetCount: number;  // From PREDEFINED_GOALS (5)
  varietyTargetCount: number; // From PREDEFINED_GOALS (3)
  // Legacy fields for backward compatibility
  isCompleted: false,
  completedDate: undefined,
  targetCount: 5,
  currentCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### Resource Articles

**Resource Data Structure:**
```typescript
interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'guide' | 'tool';
  category: 'General' | 'People' | 'Dogs' | 'Environments' | 'Noises';
  url: string;
  duration: string;
}
```

**Predefined Resources (10 total):**

```typescript
const resources: Resource[] = [
  // General (2 resources)
  {
    id: 1,
    title: "Puppy Socialisation: The Complete Guide",
    description: "Learn the fundamentals of socialising your puppy during the critical early weeks.",
    type: "article",
    category: "General",
    url: "https://www.akc.org/expert-advice/training/puppy-socialization/",
    duration: "10 min read"
  },
  {
    id: 3,
    title: "Positive Reinforcement Techniques",
    description: "How to use treats and praise effectively during socialisation sessions.",
    type: "article",
    category: "General",
    url: "https://www.aspca.org/pet-care/dog-care/dog-training",
    duration: "8 min read"
  },
  
  // People (1 resource)
  {
    id: 5,
    title: "Socialising with Children: Safety First",
    description: "Important safety tips and techniques for introducing puppies to children.",
    type: "article",
    category: "People",
    url: "https://www.akc.org/expert-advice/training/teaching-kids-to-be-dog-safe/",
    duration: "6 min read"
  },
  
  // Dogs (2 resources)
  {
    id: 7,
    title: "Meeting Other Dogs: Body Language Guide",
    description: "Learn to read canine body language and ensure safe dog-to-dog introductions.",
    type: "article",
    category: "Dogs",
    url: "https://www.akc.org/expert-advice/training/read-dog-body-language/",
    duration: "12 min read"
  },
  {
    id: 9,
    title: "Puppy Playgroups: Benefits and Setup",
    description: "How to organize or join puppy playgroups for effective socialisation.",
    type: "article",
    category: "Dogs",
    url: "https://www.akc.org/expert-advice/training/puppy-classes/",
    duration: "7 min read"
  },
  
  // Environments (1 resource)
  {
    id: 11,
    title: "Car Travel Training",
    description: "How to gradually introduce your puppy to car rides and travel.",
    type: "article",
    category: "Environments",
    url: "https://www.akc.org/expert-advice/training/how-to-teach-your-dog-to-ride-in-a-car/",
    duration: "8 min read"
  },
  
  // Noises (2 resources)
  {
    id: 13,
    title: "Sound Desensitisation Techniques",
    description: "Progressive methods for introducing your puppy to various sounds.",
    type: "article",
    category: "Noises",
    url: "https://www.akc.org/expert-advice/training/desensitizing-your-dog-to-loud-noises/",
    duration: "11 min read"
  },
  {
    id: 15,
    title: "Household Noises: Vacuum, Doorbell, etc.",
    description: "Making everyday household sounds less scary for your puppy.",
    type: "article",
    category: "Noises",
    url: "https://www.akc.org/expert-advice/training/desensitizing-to-household-noises/",
    duration: "6 min read"
  }
];
```

**Category Emoji:**
```typescript
const categoryEmoji: Record<string, string> = {
  General: '📚',
  People: '👥',
  Dogs: '🐕',
  Environments: '🏠',
  Noises: '🔊'
};
```

**Type Colors (visual categorization):**
- `article`: Primary blue color
- `guide`: Emerald green color
- `tool`: Amber/orange color

---

## 5. Screens & Features

### 5.1 Auth Page (`/auth`)

**Route:** `/auth`

**Purpose:** Handles user authentication (sign in, sign up, password reset)

**Layout:**
- Centered card on full-screen background (slate-50 light, slate-900 dark)
- App logo (rounded square with "P" letter, primary-500 background)
- Heading: "Sign in to your account" or "Create your account" (toggle based on mode)
- Subheading with context text
- Form card with inputs and buttons

**UI States:**

1. **Sign In Mode (Default):**
   - Email input field
   - Password input field
   - "Forgot password?" link (right-aligned)
   - "Sign In" button (full width)
   - Toggle link: "Don't have an account? Sign up"

2. **Sign Up Mode:**
   - Full Name input field
   - Email input field
   - Password input field
   - "Create Account" button (full width)
   - Toggle link: "Already have an account? Sign in"

3. **Loading State:**
   - Button shows spinner + "Signing In..." or "Creating Account..."
   - Form inputs disabled during submission

4. **Error State:**
   - Red banner above form showing error message
   - Error persists until user corrects input or mode changes

5. **Password Reset Success:**
   - Green banner: "Password reset email sent. Check your inbox."
   - Shown after successful password reset trigger

**User Interactions:**
- Click logo → no action (static)
- Type in email/password → client-side validation on blur
- Click "Sign In" / "Create Account" → validate and submit
- Click "Forgot password?" → trigger password reset flow (requires email)
- Click toggle link → switch between Sign In / Sign Up mode (resets form)

**Validation:**
- Real-time validation on form submit
- Inline error messages below each field with issue
- Email validation: Must match email regex pattern
- Password validation: Minimum 6 characters
- Display Name validation (Sign Up only): Minimum 2 characters

**Navigation:**
- If user is already authenticated → redirect to `/dashboard`
- After successful auth → redirect to intended route or `/dashboard`

**Data Sources:**
- None (pre-authentication)

**Business Logic:**
- Form validation via Zod schemas
- Firebase Auth API calls for authentication
- AuthContext manages global auth state

---

### 5.2 Dashboard (`/dashboard`)

**Route:** `/dashboard`

**Purpose:** Overview of puppy's socialization progress and quick actions

**Layout (Top to Bottom):**

1. **Welcome Header**
   - Dog avatar (left, size: lg)
   - Dog name + Dashboard heading: "{Name}'s Dashboard"
   - Dog breed + age: "{Breed} · {age} months old"

2. **Primary CTA**
   - Full-width button: "Log Exposure" with Plus icon
   - Large size, primary color
   - Opens Log Session Modal

3. **Today's Plan Card**
   - Icon: Target
   - Title: "Today's Plan"
   - Description: "{count} suggested exposure(s) for today" or "All targets are on track!"
   - Content:
     - If targets exist: List of 3 GoalItems (least progressed)
     - Each GoalItem shows dual progress bars (calm + variety)
     - "Log Exposure" button on each GoalItem opens modal pre-filled
     - "View All Targets" button → navigates to `/goals`
   - If no incomplete targets: Celebration state (🎉 emoji, "Great progress!" message, "View Plan" button)

4. **Stats Row** (4 cards, 2 cols mobile, 4 cols desktop)
   - **Card 1: Targets %**
     - Label: "Targets"
     - Value: "{overallPercentage}%"
     - Visual: Circular progress indicator (48px, strokeWidth 5)
   - **Card 2: This Week**
     - Icon: Calendar (primary-600, bg primary-100)
     - Label: "This Week"
     - Value: "{weeklyCalmCount} calm"
   - **Card 3: Completed**
     - Icon: Target (emerald-600, bg emerald-100)
     - Label: "Completed"
     - Value: "{completedTargets}/{totalTargets}"
   - **Card 4: Avg Reaction**
     - Icon: TrendingUp (accent-600, bg accent-100)
     - Label: "Avg Reaction"
     - Value: "{averageReaction}/5" (1 decimal place)

5. **Category Progress Card**
   - Title: "Progress by Category"
   - Description: "Track progress across different socialisation areas"
   - Content: 4 circular progress indicators (64px diameter, strokeWidth 4)
     - People (👥 emoji + "people" label)
     - Dogs (🐕 emoji + "dogs" label)
     - Environments (🏠 emoji + "environments" label)
     - Noises (🔊 emoji + "noises" label)
   - Each shows: percentage, "{completed}/{total} targets" text

6. **Recent Sessions Card**
   - Icon: Calendar
   - Title: "Recent Sessions"
   - Description: "Latest socialisation sessions"
   - Content:
     - If sessions exist: List of 3 most recent SessionItems
     - "View All Sessions" button → navigates to `/sessions`
   - If no sessions: Empty state (Calendar icon, "No sessions yet", "Log First Exposure" button)

**UI States:**

1. **No Dog Selected:**
   - Show centered card: Target icon, "No Dog Selected" title, "Please add a dog profile..." message
   - "Add Dog Profile" button opens AddDogModal

2. **Loading State:**
   - Today's Plan: 3 skeleton placeholders (animated pulse, h-24, slate-200/700)
   - Recent Sessions: 3 skeleton placeholders (h-20)

3. **Populated State:**
   - All sections populated with real data
   - Dynamic calculations from sessions and goals

**User Interactions:**
- Click "Log Exposure" (main CTA or from empty states) → Open LogSessionModal
- Click "Log Exposure" on GoalItem → Open LogSessionModal pre-filled with type + category
- Click "View All Targets" → Navigate to `/goals`
- Click "View All Sessions" → Navigate to `/sessions`
- Click on individual SessionItem → No action (view only)

**Data Sources:**
- `useDogs()`: selectedDog
- `useGoals(dogId)`: goals
- `useTargetProgress(dogId)`: progress, categoryProgress, totalTargets, completedTargets, overallPercentage
- `useSessions(dogId)`: sessions (filtered to last 3)
- `useSessionStats(dogId)`: averageReaction

**Business Logic:**
- **Today's Plan Selection:** Compute from incomplete goals, sort by lowest average progress ((calmProgress + varietyProgress) / 2), take first 3
- **Weekly Calm Count:** Count sessions with date ≥ (today - 7 days) AND reaction ≥ neutral ('😐', '😊', '😍')
- **Stats Aggregation:** Overall percentage = (completedTargets / totalTargets) × 100, rounded

---

### 5.3 Plan / Goals (`/goals`)

**Route:** `/goals`

**Purpose:** Manage and track socialization targets across 4 categories

**Layout (Top to Bottom):**

1. **Page Header**
   - Heading: "Plan"
   - Subheading: "Track {dogName}'s socialisation targets"

2. **Initialize Goals CTA** (only shown if goals.length === 0)
   - Card with primary-200 border, primary-50 background
   - Icon: AlertCircle (primary-600)
   - Title: "No Targets Yet"
   - Description: "Start tracking {dogName}'s socialisation journey with 29 predefined targets across 4 categories."
   - Button: "Create All Targets" (with Plus icon)
   - Loading state: Spinner + "Creating Targets..."

3. **Segmented Control** (only shown if goals exist)
   - 4 segments: People 👥, Dogs 🐕, Environments 🏠, Noises & Objects 🔊
   - Selected segment highlighted with primary-500 background
   - Filters goal list to selected type

4. **Progress Summary Card** (per selected type)
   - Heading: "{Type} Progress" (e.g., "People Progress")
   - Subheading: "{completed} of {total} targets complete"
   - Large percentage: "{progressPercentage}%" (right-aligned, text-3xl, primary-600)
   - Progress bar: Gradient from primary-500 to accent-500, animated transition

5. **Goals List Card**
   - Icon: Session type emoji (e.g., 👥)
   - Title: "{Type} Targets" (e.g., "People Targets")
   - Description: "Log exposures to build calm, confident habits across different contexts."
   - Content: List of GoalItems (filtered by selected type)
   - Each GoalItem shows:
     - Category name + type label
     - Dual progress bars (Calm: primary-500, Variety: accent-500)
     - Progress text: "{count}/{target}" for each bar
     - "Log Exposure" button (opens pre-filled modal)
     - Coaching tip as status text
     - If complete: Check icon + "Complete" badge (emerald styling)
   - If no goals in category: Empty state (Target icon, "No Targets in This Category")

**UI States:**

1. **No Dog Selected:**
   - Centered card: Target icon, "No Dog Selected", "Please select a dog..." message

2. **No Goals State:**
   - Show Initialize Goals CTA
   - Hide all other content

3. **Loading State (goals):**
   - Show 5 skeleton placeholders (h-24, animated pulse)

4. **Populated State:**
   - Segmented control active
   - Progress summary shows real data
   - Goal list populated and filtered

**User Interactions:**
- Click "Create All Targets" → Call `initializeGoals(dogId)` batch operation
- Click segment in SegmentedControl → Filter goals by type
- Click "Log Exposure" on GoalItem → Open LogSessionModal pre-filled with (type, category)
- Scroll through goals list

**Data Sources:**
- `useDogs()`: selectedDog
- `useGoals(dogId)`: goals, isLoading, initializeGoals, isInitializing
- `useTargetProgress(dogId)`: progress (per-goal), categoryProgress (per-type)

**Business Logic:**
- **Goal Filtering:** `goals.filter(g => g.type === selectedType)`
- **Progress Aggregation:** Per-type completed/total counts from categoryProgress
- **Coaching Tips:** Generated by `getCoachingTip(progress)` based on progress state
- **Goal Initialization:** Creates all 28 predefined goals in batch on button click

---

### 5.4 Sessions (`/sessions`)

**Route:** `/sessions`

**Purpose:** View and manage logged socialisation sessions

**Layout (Top to Bottom):**

1. **Page Header**
   - Heading: "Session Log"
   - Subheading: "Log and track {dogName}'s socialisation sessions"
   - Button: "Log Session" (Plus icon) → opens LogSessionModal

2. **Type Filter Pills**
   - 5 pills: All 📋, People 👥, Dogs 🐕, Environments 🏠, Noises 🔊
   - Pill styling:
     - Selected: primary-500 background, white text, shadow
     - Unselected: slate-100 background, slate-700 text, hover effect
   - Each pill shows emoji + label

3. **Sessions List Card**
   - Icon: Calendar
   - Title: "All Sessions" or "{Type} Sessions" (based on filter)
   - Description: "{count} session(s)" + " (filtered)" if not "All"
   - Content:
     - List of SessionItems (reverse chronological order)
     - Each SessionItem shows:
       - Type icon badge (colored background)
       - Type + Category labels
       - Reaction emoji (large, colored by sentiment)
       - Reaction label
       - Date/time formatted: "{Month Day, Year} at {Time}"
       - Notes (if present)
       - Photo thumbnail (if present, max-w-xs, h-32, rounded)
       - Delete button (Trash icon, hover:red)
   - If no sessions: Empty state varies by filter
     - "All" → "No sessions logged yet" + "Log Your First Session" button
     - Other types → "No {type} sessions yet" + suggestion to log or change filter

**UI States:**

1. **No Dog Selected:**
   - Centered card: Target icon, "No Dog Selected", message

2. **Loading State:**
   - Show 5 skeleton placeholders (h-20, animated pulse)

3. **Empty State (no sessions):**
   - Calendar icon (h-12, slate-400)
   - Contextual message based on filter
   - Optional CTA button

4. **Populated State:**
   - Session list populated
   - Filter state reflected in title and description

5. **Delete Confirmation Modal Open:**
   - Modal overlay
   - Title: "Delete Session"
   - Message: "Are you sure you want to delete this session? This action cannot be undone."
   - Buttons: "Cancel" (outline) + "Delete" (destructive, red)
   - While deleting: "Deleting..." on button

**User Interactions:**
- Click "Log Session" button → Open LogSessionModal
- Click type filter pill → Filter sessions by type (`typeFilter` state changes)
- Click delete button on SessionItem → Show delete confirmation modal (`deleteConfirmId` set to session.id)
- Click "Cancel" in modal → Close modal (set `deleteConfirmId` to null)
- Click "Delete" in modal → Call `deleteSession(id)`, show success toast, close modal
- Scroll through sessions list

**Data Sources:**
- `useDogs()`: selectedDog
- `useSessions(dogId)`: sessions, isLoading, deleteSession, isDeleting
- `useToast()`: showToast

**Business Logic:**
- **Session Filtering:** `sessions.filter(s => typeFilter === 'all' || s.type === typeFilter)`
- **Sort Order:** Sessions already ordered by date descending from Firestore query
- **Delete Flow:** Optimistic update via React Query cache invalidation

**Toast Messages:**
- Success: "Session deleted"
- Error: "Failed to delete session"

---

### 5.5 Calendar (`/calendar`)

**Route:** `/calendar`

**Purpose:** Visualize sessions on a monthly calendar grid

**Layout (Top to Bottom):**

1. **Page Header**
   - Heading: "Calendar"
   - Subheading: "View {dogName}'s socialisation sessions over time"

2. **Calendar Card**
   - Header:
     - Icon: Calendar
     - Title: "{Month Year}" (e.g., "February 2026")
     - Controls (right-aligned):
       - "Today" button (outline, sm)
       - Previous month button (ChevronLeft icon)
       - Next month button (ChevronRight icon)
   - Content:
     - **Day-of-week header:** Mon, Tue, Wed, Thu, Fri, Sat, Sun (centered, xs font, slate-500)
     - **Calendar grid:** 7 columns × 6 rows = 42 cells (fixed)
     - Each cell:
       - Date number (top, xs/sm font)
       - Session type dots (center, below date)
         - Color-coded: people=indigo-500, dogs=violet-500, environments=emerald-500, noises=amber-500
         - Dot size: 1.5-2px diameter
         - Up to 4 unique types shown per day
       - Cell styling:
         - Current month dates: slate-900 text
         - Other month dates: slate-400 text (muted)
         - Today: primary-500 border, date in primary-500 circle
         - Selected: primary-500 border, primary-50 background, ring
         - Hover: slate-50 background
     - **Legend** (below grid, border-top):
       - Label: "Legend:"
       - 4 dots with labels: People 👥, Dogs 🐕, Environments 🏠, Noises 🔊

3. **Selected Day Detail Card** (only shown if day selected)
   - Title: "{Weekday, Month Day, Year}" (e.g., "Monday, February 15, 2026")
   - Description: "No sessions on this day" or "{count} session(s) logged"
   - Content (if sessions exist):
     - List of SessionItems for selected date

**UI States:**

1. **No Dog Selected:**
   - Centered card: Target icon, "No Dog Selected", message

2. **Loading State:**
   - Calendar grid: 42 skeleton cells (h-16, animated pulse)

3. **Populated State:**
   - Calendar rendered with session dots
   - No day selected initially

4. **Day Selected State:**
   - Selected day has visual highlight
   - Detail card appears below calendar
   - Sessions for that day shown

**User Interactions:**
- Click "Today" → Reset to current month, select today's date
- Click Previous/Next month → Navigate months
- Click date cell → Select that date, show detail card
- Click on SessionItem in detail card → No action (view only)

**Data Sources:**
- `useDogs()`: selectedDog
- `useSessions(dogId)`: sessions, isLoading

**Business Logic:**
- **Calendar Grid Generation:**
  - First day of month determines starting day-of-week offset
  - Fill leading days from previous month (muted)
  - Current month days (1 to last day of month)
  - Fill trailing days from next month to complete 42 cells
  - Week starts on Monday (not Sunday)
- **Session Mapping:**
  - Build map: `dateString → Session[]`
  - Date string format: `YYYY-M-D` (no zero-padding)
  - Each day can have multiple sessions
  - Extract unique types per day for dot rendering
- **Date Selection:**
  - `selectedDate` state (Date | null)
  - Filter sessions by `isSameDay(session.date, selectedDate)`

**Visual Details:**
- Calendar cells: min-h-14 (mobile) to min-h-16 (desktop)
- Responsive: Grid scales for mobile/tablet/desktop
- Dots wrap if more than 4 types on same day (rare edge case)

---

### 5.6 Resources (`/resources`)

**Route:** `/resources`

**Purpose:** Educational articles and guides for puppy socialization

**Layout (Top to Bottom):**

1. **Page Header**
   - Heading: "Training Resources"
   - Subheading: "Expert guides and articles to help with your puppy's socialisation"

2. **Category Filter Pills**
   - 5 pills: General 📚, People 👥, Dogs 🐕, Environments 🏠, Noises 🔊
   - Pill styling (same as Sessions page):
     - Selected: primary-500 background, white text, shadow
     - Unselected: slate-100 background, slate-700 text, hover effect

3. **Resources Grid**
   - Layout: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
   - Gap: 1rem (4 spacing)
   - Each resource card:
     - **Header:**
       - Type icon (top-left, slate-100 bg, colored text):
         - article → FileText icon
         - guide → Book icon
         - tool → FileText icon
       - Duration (top-right, xs text, slate-500)
     - **Title:** Base font size, font-semibold
     - **Description:** Small font, slate-500
     - **Footer (bottom):**
       - Button: "Read Article" / "Read Guide" / "Get Tool" (outline, full width)
       - ExternalLink icon (right)
   - Card styling:
     - White background, border, rounded
     - Hover: shadow-lg transition
     - Flex column layout, footer at bottom (mt-auto)

4. **Suggestion Card** (full-width, at bottom)
   - Background: primary-50, border primary-200
   - Icon: BookOpen (h-12, primary-600)
   - Title: "Have a suggestion?"
   - Description: "Know a great resource that should be listed here? We'd love to hear from you."
   - Button: "Send a Suggestion" (outline, sm) with Mail icon
   - Click → Opens email client: `mailto:support@puppysteps.app?subject=Resource%20Suggestion`

**UI States:**

1. **Default State:**
   - "General" category selected by default
   - Resources filtered and displayed

2. **Category Filtered:**
   - Resources filtered to selected category
   - Grid updates (some categories have fewer resources)

**User Interactions:**
- Click category pill → Filter resources by category
- Click resource card button → Open URL in new tab/browser
- Click "Send a Suggestion" → Open email client

**Data Sources:**
- Hardcoded resource array (see Section 4: Predefined Data)
- No backend calls (static data)

**Business Logic:**
- **Resource Filtering:** `resources.filter(r => r.category === selectedCategory)`
- **Button Label Logic:**
  ```
  if type === 'guide': "Read Guide"
  else if type === 'tool': "Get Tool"
  else: "Read Article"
  ```

**Static Data:**
- 10 total resources (see Section 4 for complete list)
- Distribution: 2 General, 1 People, 2 Dogs, 1 Environments, 2 Noises

---

### 5.7 Settings (`/settings`)

**Route:** `/settings`

**Purpose:** Manage account, dog profiles, and app preferences

**Layout (Top to Bottom):**

1. **Page Header**
   - Heading: "Settings"
   - Subheading: "Manage your account and application preferences"

2. **Account Card**
   - Title: "Account"
   - Description: "Your account information"
   - Content:
     - User info display (slate-50 bg, rounded):
       - User icon (primary-600, bg primary-100, rounded-full, h-10 w-10)
       - Email address (font-medium)
       - Status: "Signed in" (text-sm, slate-500)

3. **Your Dogs Card**
   - Header:
     - Title: "Your Dogs"
     - Description: "Manage your dog profiles"
     - Button: "Add Dog" (outline, sm, Plus icon)
   - Content:
     - If dogs exist: List of dog cards
       - Each dog card:
         - DogAvatar (left, size md)
         - Name (font-medium)
         - Breed + age: "{Breed} • {age} months old" (text-sm, slate-500)
         - Delete button (right, ghost variant, red on hover, Trash icon)
     - If no dogs: EmptyState component
       - User icon, "No dogs added yet" title
       - "Add your first dog to start tracking socialization."
       - Button: "Add Your First Dog" (opens AddDogModal)

4. **App Settings Card**
   - Title: "App Settings"
   - Description: "Customize your experience"
   - Content (SettingsListItem components):
     - **Dark Mode Toggle**
       - Icon: Moon (if dark) or Sun (if light)
       - Label: "Dark Mode"
       - Right content: "On" or "Off" text
       - Click → Toggle dark mode, update localStorage, update DOM class
     - **About PuppySteps** (expandable)
       - Icon: Info (primary-600)
       - Label: "About PuppySteps"
       - Click → Toggle expansion
       - Expanded content:
         - "Version 1.0.0"
         - "Helping you raise well-socialized, happy puppies!"

5. **Support Card**
   - Title: "Support"
   - Description: "Get help and provide feedback"
   - Content:
     - **Contact Support**
       - Icon: Mail (accent-600)
       - Label: "Contact Support"
       - Right content: ChevronRight icon
       - Click → Opens email client: `mailto:support@puppysteps.app`

6. **Danger Zone Card** (red border)
   - Title: "Sign Out" (red text)
   - Description: "Leave your account"
   - Content:
     - Button: "Sign Out" (destructive, full width, LogOut icon)
     - Click → Call `signOut()`, redirect to `/auth`

**UI States:**

1. **Dogs List State:**
   - Empty: Show EmptyState component
   - Populated: Show list of dog cards

2. **Delete Dog Confirmation Modal:**
   - Title: "Delete Dog"
   - Message: "Are you sure you want to delete this dog? This action cannot be undone and will also delete all associated socialisation sessions."
   - Buttons: "Cancel" (outline) + "Delete" (destructive)

3. **Dark Mode:**
   - State persisted in `localStorage` with key: `puppysteps-dark-mode`
   - Value: `'true'` or `'false'`
   - On toggle:
     - Update localStorage
     - Add/remove `'dark'` class on `document.documentElement`

**User Interactions:**
- Click "Add Dog" → Open AddDogModal
- Click delete button on dog card → Open delete confirmation modal (`dogToDelete` set)
- Click "Delete" in modal → Call `deleteDog(id)`, close modal
- Click "Dark Mode" row → Toggle dark mode
- Click "About PuppySteps" row → Expand/collapse
- Click "Contact Support" → Open email client
- Click "Sign Out" → Sign out and redirect

**Data Sources:**
- `useAuth()`: user, signOut
- `useDogs()`: dogs, deleteDog
- `localStorage`: Dark mode preference

**Business Logic:**
- **Dark Mode Toggle:**
  ```typescript
  const newValue = !isDarkMode;
  setIsDarkMode(newValue);
  localStorage.setItem('puppysteps-dark-mode', String(newValue));
  if (newValue) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  ```
- **Dark Mode Initialization:**
  - Check localStorage on mount
  - Fallback to checking if `'dark'` class exists on html element

**Delete Dog Side Effects:**
- Deleting a dog should delete all associated sessions and goals (handled by client-side React Query cache invalidation, or manually in the mutation)
- Selected dog state updates if deleted dog was selected

---

## 6. Modals & Forms

### 6.1 Log Session Modal

**Trigger:** Opened from "Log Exposure" buttons throughout app

**Purpose:** Create a new socialisation session log entry

**Modal Title:** "Log Exposure for {dogName}"

**Form Fields (in order):**

1. **Date** (Input, type=date)
   - Label: "Date"
   - Required: Yes
   - Max value: Today's date
   - Default: Today
   - HTML5 date picker

2. **Exposure Type** (Button group, 2×2 grid)
   - Label: "Exposure Type"
   - Options: 4 buttons
     - People 👥
     - Dogs 🐕
     - Environments 🏠
     - Noises 🔊
   - Visual: Border-2 rounded cards
   - Selected: primary-500 border, primary-50 background
   - Unselected: slate-200 border, white background
   - Default: Pre-filled value or 'people'

3. **Category** (Select dropdown)
   - Label: "Category"
   - Required: Yes
   - Options: Dynamically populated based on selected Exposure Type
   - Placeholder: "Select a category"
   - Validation error if submitted without selection: "Please select a category"
   - On type change: Reset category to empty

4. **Place** (Pill selector)
   - Label: "Place"
   - Options: 9 pills (see PlaceTypes in Section 4)
   - Visual: Rounded-full pills
   - Selected: primary-500 background, white text, shadow
   - Unselected: slate-100 background, slate-700 text
   - Default: 'Home'

5. **Intensity** (Button group, 3 columns)
   - Label: "Intensity"
   - Options: Low, Medium, High
   - Visual: Border-2 rounded buttons
   - Selected: primary-500 border, primary-50 background
   - Unselected: slate-200 border
   - Default: 'low'

6. **New to my dog** (Checkbox)
   - Label: "New to my dog"
   - Helper text: "First time meeting this individual"
   - Only shown if type === 'people' OR type === 'dogs'
   - Default: false
   - On type change to 'environments' or 'noises': Reset to false

7. **Reaction** (Button group, 5 columns)
   - Label: "Reaction"
   - Options: 5 reaction emoji buttons
     - 😰 Very Negative
     - 😟 Negative
     - 😐 Neutral
     - 😊 Positive
     - 😍 Very Positive
   - Visual: Large emoji (text-3xl), border-2 rounded
   - Selected: primary-500 border, primary-50 background, scale-110
   - Unselected: slate-200 border
   - Shows label text below emoji (text-xs, slate-600)
   - Default: '😊' (Positive)

8. **Notes** (Textarea)
   - Label: "Notes (optional)"
   - Rows: 3
   - Placeholder: "Add any additional notes about this exposure..."
   - Not required

9. **Photo** (File input)
   - Label: "Photo (optional)"
   - Accept: image/*
   - Not required
   - If file selected: Show filename with X button to remove

**Form Actions:**
- Cancel button (outline, disabled while submitting)
- Log Exposure button (primary, disabled if submitting or category not selected)
- While submitting: Spinner + "Logging..." text

**Validation:**
- Date: Must not be in the future
- Category: Required (client-side check before submit)
- All other fields: Optional or have defaults

**Pre-fill Support:**
- When opened from GoalItem "Log Exposure" button:
  - `prefillType`: Set to goal's type
  - `prefillCategory`: Set to goal's category
  - Applied via `useEffect` when modal opens

**Form Reset:**
- On successful submission: Reset all fields to defaults
- On cancel: Reset form (fields return to pre-fill or defaults)

**Error Handling:**
- If category not selected: Show red error banner "Please select a category"
- If submission fails: Show red error banner "Failed to log exposure. Please try again."

**Success Flow:**
1. User fills form
2. Click "Log Exposure"
3. Validate category selection
4. Upload photo to Storage (if provided)
5. Create session document in Firestore
6. Close modal
7. Reset form
8. Show toast: "Exposure logged successfully!" (success, green)
9. React Query invalidates sessions cache → UI updates

**Photo Upload Details:**
- Temporary session ID used during upload: `temp-${Date.now()}`
- Storage path: `sessions/{userId}/{sessionId}/{timestamp}_{filename}`
- Download URL stored in session document

---

### 6.2 Add Dog Modal

**Trigger:** Opened from "Add Dog" / "Add Dog Profile" buttons

**Purpose:** Create a new dog profile

**Modal Title:** "Add Dog Profile"

**Form Fields (in order):**

1. **Name** (Input, type=text)
   - Label: "Name *"
   - Required: Yes
   - Placeholder: "e.g., Buddy"
   - Validation: Non-empty string
   - Error: "Please enter a name"

2. **Age (in months)** (Input, type=number)
   - Label: "Age (in months) *"
   - Required: Yes
   - Min: 0
   - Max: 300
   - Placeholder: "e.g., 6"
   - Helper text: "Enter age in months (e.g., 6 months old)"
   - Validation: Must be valid number ≥ 0
   - Error: "Please enter a valid age"

3. **Breed** (Input, type=text)
   - Label: "Breed *"
   - Required: Yes
   - Placeholder: "e.g., Golden Retriever"
   - Validation: Non-empty string
   - Error: "Please enter a breed"

4. **Photo (optional)** (File input)
   - Label: "Photo (optional)"
   - Accept: image/*
   - Not required
   - If file selected: Show filename with X button to remove

**Form Actions:**
- Cancel button (outline, disabled while submitting)
- Add Dog button (primary, disabled while submitting)
- While submitting: Spinner + "Adding..." text

**Validation:**
- All fields required except photo
- Client-side validation on submit
- Error banner shown at top of form if validation fails

**Success Flow:**
1. User fills form
2. Click "Add Dog"
3. Validate all required fields
4. Upload photo to Storage (if provided) — path: `dogs/{userId}/temp/{timestamp}_{filename}`
5. Create dog document in Firestore
6. Initialize 28 predefined goals for dog (batch write)
7. Close modal
8. Reset form
9. React Query invalidates dogs and goals cache → UI updates
10. New dog auto-selected as selectedDog

**Side Effects:**
- Creating a dog triggers automatic creation of 28 predefined goals
- If goal creation fails, it's non-critical (user can initialize later from Goals page)
- New dog is automatically selected after creation

---

### 6.3 Delete Confirmation Modal (Sessions)

**Trigger:** Click delete button (Trash icon) on SessionItem

**Purpose:** Confirm session deletion (destructive action)

**Modal Title:** "Delete Session"

**Content:**
- Message: "Are you sure you want to delete this session? This action cannot be undone."

**Actions:**
- Cancel button (outline, flex-1)
- Delete button (destructive/red, flex-1, disabled while deleting)
- While deleting: "Deleting..." text

**Success Flow:**
1. User clicks Delete
2. Call `deleteSession(sessionId)`
3. Close modal
4. Show toast: "Session deleted" (success)
5. React Query invalidates sessions cache → UI updates

**Error Flow:**
1. If deletion fails: Show toast: "Failed to delete session" (error)

---

### 6.4 Delete Confirmation Modal (Dogs)

**Trigger:** Click delete button (Trash icon) on dog card in Settings

**Purpose:** Confirm dog deletion (destructive action with cascading effects)

**Modal Title:** "Delete Dog"

**Content:**
- Message: "Are you sure you want to delete this dog? This action cannot be undone and will also delete all associated socialisation sessions."

**Actions:**
- Cancel button (outline, flex-1)
- Delete button (destructive/red, flex-1)

**Success Flow:**
1. User clicks Delete
2. Call `deleteDog(dogId)`
3. Close modal
4. React Query invalidates dogs cache → UI updates
5. If deleted dog was selected: Auto-select first remaining dog or null

**Note:** The warning mentions deleting sessions, but this is **not automatically enforced by Firestore** (no cascading deletes). The app relies on client-side behavior or manual cleanup. Consider implementing cloud function for cleanup or handle in delete mutation.

---

## 7. Business Logic & Computations

### 7.1 Target Progress Computation

**Function:** `computeTargetProgress(goals: Goal[], sessions: Session[])`

**Purpose:** Pure function that computes calm + variety progress for all goals based on session data

**Algorithm:**

```typescript
// Step 1: Index sessions by (type, category) for O(1) lookup
const sessionIndex = new Map<string, Session[]>();
for (const session of sessions) {
  const key = `${session.type}::${session.category}`;
  sessionIndex[key].push(session);
}

// Step 2: For each goal, compute progress
for (const goal of goals) {
  const calmTarget = goal.calmTargetCount ?? goal.targetCount ?? 5;
  const varietyTarget = goal.varietyTargetCount ?? 3;
  
  const matchingSessions = sessionIndex.get(`${goal.type}::${goal.category}`) ?? [];
  
  let calmCount = 0;
  const varietyKeys = new Set<string>();
  let lastLogged: Date | null = null;
  
  // Step 3: Process each matching session
  for (const session of matchingSessions) {
    // Track last logged date
    if (!lastLogged || session.date > lastLogged) {
      lastLogged = session.date;
    }
    
    // Calm count: only count neutral or better reactions
    if (isCalm(session.reaction)) {
      calmCount++;
    }
    
    // Variety: context key (always)
    varietyKeys.add(contextVarietyKey(session));
    
    // Variety: new individual bonus (people/dogs only, 1 per day)
    const newKey = newIndividualVarietyKey(session);
    if (newKey) {
      varietyKeys.add(newKey);
    }
  }
  
  // Step 4: Determine completion
  const isComplete = calmCount >= calmTarget && varietyKeys.size >= varietyTarget;
  
  result[goal.id] = {
    goalId: goal.id,
    category: goal.category,
    type: goal.type,
    calmCount,
    calmTarget,
    varietyCount: varietyKeys.size,
    varietyTarget,
    isComplete,
    lastLogged,
    varietyKeys,
  };
}
```

**Helper Functions:**

```typescript
// Returns true if reaction is neutral or better
function isCalm(reaction: ReactionLevel): boolean {
  return reaction === '😐' || reaction === '😊' || reaction === '😍';
}

// Context variety key format: "context:<placeType>:<intensity>"
function contextVarietyKey(session: Session): string {
  const place = session.placeType ?? 'Other';
  const intensity = session.intensity ?? 'low';
  return `context:${place}:${intensity}`;
}

// New individual variety key (people/dogs only, capped at 1 per day)
// Format: "new:YYYY-MM-DD"
function newIndividualVarietyKey(session: Session): string | null {
  if (!session.isNewToDog) return null;
  if (session.type !== 'people' && session.type !== 'dogs') return null;
  
  const d = new Date(session.date);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `new:${dateStr}`;
}
```

**Key Points:**
- **Calm Definition:** Reactions '😐', '😊', '😍' (numeric values 3, 4, 5)
- **Variety Context Keys:** Unique combinations of (placeType, intensity)
- **Variety New Individual Keys:** Only for people/dogs types, only if `isNewToDog === true`, max 1 per calendar day
- **Completion Criteria:** BOTH calm AND variety targets must be met
- **No Firestore Calls:** This is a pure computation function (testable)

---

### 7.2 Coaching Tips

**Function:** `getCoachingTip(progress: TargetProgress): string`

**Purpose:** Generate contextual coaching message based on progress state

**Logic Tree:**

```typescript
function getCoachingTip(progress: TargetProgress): string {
  // Complete state
  if (progress.isComplete) {
    return 'Great work! This target is complete.';
  }
  
  // No progress yet
  if (progress.calmCount === 0 && progress.varietyCount === 0) {
    return 'Start small — try a calm, low-intensity introduction.';
  }
  
  // Good variety, need more calm
  if (progress.calmCount < progress.calmTarget && progress.varietyCount >= progress.varietyTarget) {
    return 'Good variety! Focus on calm, positive repetitions now.';
  }
  
  // Good calm, need more variety
  if (progress.varietyCount < progress.varietyTarget && progress.calmCount >= progress.calmTarget) {
    return 'Almost there! Try a new context (different place or intensity).';
  }
  
  // Need variety
  if (progress.varietyCount < progress.varietyTarget) {
    return 'Try a new context (cafe, park) to build variety.';
  }
  
  // Default fallback
  return 'Keep going with calm, positive exposures!';
}
```

**Coaching Tip Priority:**
1. Completion (highest priority)
2. No progress
3. Variety met, calm lacking
4. Calm met, variety lacking
5. Variety still needed
6. Default encouragement

---

### 7.3 Today's Plan Selection

**Purpose:** Select 3 suggested targets for the day (least progressed goals)

**Algorithm:**

```typescript
// Filter to incomplete goals only
const incomplete = goals
  .filter((g) => {
    const p = progress[g.id];
    return p && !p.isComplete;
  })
  .map((g) => ({ goal: g, progress: progress[g.id] }));

// Sort by average progress (worst progress first)
incomplete.sort((a, b) => {
  const aScore =
    (a.progress.calmCount / a.progress.calmTarget +
     a.progress.varietyCount / a.progress.varietyTarget) / 2;
  const bScore =
    (b.progress.calmCount / b.progress.calmTarget +
     b.progress.varietyCount / b.progress.varietyTarget) / 2;
  return aScore - bScore;  // Ascending (lowest progress first)
});

// Take first 3
const todaysPlan = incomplete.slice(0, 3);
```

**Key Points:**
- Only incomplete goals considered
- Sort by average of (calm % progress + variety % progress) / 2
- Lowest average progress comes first
- Take top 3 only

---

### 7.4 Weekly Calm Count

**Purpose:** Count calm exposures in the last 7 days

**Algorithm:**

```typescript
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const weeklyCalmCount = sessions.filter(
  (s) =>
    new Date(s.date) >= weekAgo &&
    (s.reaction === '😐' || s.reaction === '😊' || s.reaction === '😍')
).length;
```

**Key Points:**
- Date range: `today - 7 days` to `today` (inclusive)
- Calm reactions only: '😐', '😊', '😍'
- Simple count, no grouping

---

### 7.5 Session Stats

**Function:** `computeSessionStats(sessions: Session[]): SessionStats`

**Purpose:** Compute aggregate statistics from sessions list

**Algorithm:**

```typescript
function computeSessionStats(sessions: Session[]): SessionStats {
  const totalSessions = sessions.length;
  
  // Count sessions by type
  const sessionsByType: Record<SessionType, number> = {
    people: sessions.filter(s => s.type === 'people').length,
    dogs: sessions.filter(s => s.type === 'dogs').length,
    environments: sessions.filter(s => s.type === 'environments').length,
    noises: sessions.filter(s => s.type === 'noises').length,
  };
  
  // Calculate average reaction (numeric 1-5 scale)
  const averageReaction = totalSessions > 0
    ? sessions.reduce((sum, s) => {
        return sum + (REACTION_VALUES[s.reaction] || 3);
      }, 0) / totalSessions
    : 3;  // Default to 3 (neutral) if no sessions
  
  // Recent sessions (first 5)
  const recentSessions = sessions.slice(0, 5);
  
  return {
    totalSessions,
    sessionsByType,
    averageReaction,
    recentSessions,
  };
}
```

**Reaction Values:**
```typescript
const REACTION_VALUES: Record<ReactionLevel, number> = {
  '😰': 1,
  '😟': 2,
  '😐': 3,
  '😊': 4,
  '😍': 5,
};
```

**Key Points:**
- Average reaction shown to 1 decimal place: `averageReaction.toFixed(1)`
- Recent sessions are first 5 from list (already sorted by date desc)
- Default average reaction is 3 (neutral) if no sessions

---

### 7.6 Category Progress

**Purpose:** Aggregate completed/total targets per session type

**Algorithm:**

```typescript
const types: SessionType[] = ['people', 'dogs', 'environments', 'noises'];
const categoryProgress = {} as Record<SessionType, GoalProgress>;

for (const type of types) {
  const typeGoals = goals.filter(g => g.type === type);
  const total = typeGoals.length;
  const completed = typeGoals.filter(g => progress[g.id]?.isComplete).length;
  
  categoryProgress[type] = {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
```

**Output Structure:**
```typescript
interface GoalProgress {
  total: number;
  completed: number;
  percentage: number;  // Rounded integer 0-100
}
```

**Key Points:**
- Percentage always rounded to integer
- If no goals of a type: percentage = 0
- Progress computed from dynamic `progress` map

---

### 7.7 Goal Stats (Legacy/Optional)

**Function:** `computeGoalStats(goals: Goal[]): GoalStats`

**Note:** This function exists but is **not actively used** in current UI. Current implementation uses `computeTargetProgress` instead. Included for completeness.

**Algorithm:**

```typescript
function computeGoalStats(goals: Goal[]): GoalStats {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  
  // Legacy: uses isCompleted field instead of dynamic computation
  const categoryProgress: Record<SessionType, GoalProgress> = {
    people: computeCategoryProgress(goals, 'people'),
    dogs: computeCategoryProgress(goals, 'dogs'),
    environments: computeCategoryProgress(goals, 'environments'),
    noises: computeCategoryProgress(goals, 'noises'),
  };
  
  const todaysGoals = goals.slice(0, 5);  // Arbitrary logic
  
  return {
    totalGoals,
    completedGoals,
    categoryProgress,
    todaysGoals,
  };
}

function computeCategoryProgress(goals: Goal[], type: SessionType): GoalProgress {
  const typeGoals = goals.filter(g => g.type === type);
  const total = typeGoals.length;
  const completed = typeGoals.filter(g => g.isCompleted).length;
  
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
```

**Key Difference:** Uses legacy `isCompleted` field instead of dynamic session-based computation. **Do not implement this on iOS** — use the dynamic `computeTargetProgress` approach instead.

---

## 8. Navigation & Routing

### Navigation Structure

**Primary Navigation (Sidebar/Tab Bar):**
- Dashboard — Icon: LayoutDashboard (SF Symbol: `square.grid.2x2`)
- Plan — Icon: Target (SF Symbol: `scope`)
- Sessions — Icon: Activity (SF Symbol: `chart.bar.doc.horizontal`)
- Calendar — Icon: Calendar (SF Symbol: `calendar`)
- Resources — Icon: BookOpen (SF Symbol: `book`)
- Settings — Icon: Settings (SF Symbol: `gear`)

**Icon Mapping (Lucide → SF Symbols):**
- LayoutDashboard → `square.grid.2x2` or `rectangle.grid.2x2`
- Target → `scope` or `target`
- Activity → `chart.bar.doc.horizontal` or `waveform.path.ecg`
- Calendar → `calendar`
- BookOpen → `book.fill`
- Settings → `gear`
- LogOut → `arrow.right.square` (used in sidebar footer, not a tab)

**Navigation Behavior:**
- Web: React Router with URL-based navigation (`/dashboard`, `/goals`, etc.)
- iOS: UITabBarController or SwiftUI TabView with 6 tabs
- Selected state: Visual highlight (primary color background/text)
- Unselected state: Muted text color

### Route Protection

**Protected Routes:**
All routes except `/auth` require authentication:
- `/` → redirects to `/dashboard`
- `/dashboard`
- `/goals`
- `/sessions`
- `/calendar`
- `/resources`
- `/settings`

**Unauthenticated Behavior:**
- If user is not authenticated: redirect to `/auth`
- After successful authentication: redirect to originally requested route or `/dashboard`
- iOS: Use NavigationView with conditional rendering based on auth state

**Authentication Check:**
- Firebase Auth `onAuthStateChanged` listener
- Show loading spinner while checking auth state
- Once auth state known: show appropriate screen

### Deep Linking (iOS Specific)

**Not Currently Implemented** in web version, but consider for iOS:
- `puppysteps://dashboard`
- `puppysteps://goals`
- `puppysteps://sessions`
- `puppysteps://log-session` (open Log Session Modal)
- `puppysteps://add-dog` (open Add Dog Modal)

### Lazy Loading (Web Specific)

Web app uses React lazy loading for code splitting:
- Each page component loaded on demand
- Shows `<PageLoader>` (full-screen spinner) during load

**iOS:** Not directly applicable, but consider:
- Lazy loading of images
- Pagination for large lists
- Deferred loading of Resources tab content

---

## 9. Firebase Backend Contract

### Firestore Collections

**Collection Names:**
- `dogs` — Dog profiles
- `sessions` — Socialisation session logs
- `goals` — Socialisation targets
- `users` — User account data (optional/unused)

### Security Rules

**Rules Philosophy:**
- Owner-based access control (userId field)
- Read/write only allowed for authenticated users
- Users can only access their own data
- Field validation on document creation

**Rules Implementation (firestore.rules):**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: check authentication
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: check ownership
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper: validate string
    function isValidString(field, maxLen) {
      return field is string && field.size() > 0 && field.size() <= maxLen;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.email is string;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Dogs collection
    match /dogs/{dogId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && isValidString(request.resource.data.name, 100)
        && request.resource.data.age is number
        && isValidString(request.resource.data.breed, 100);
      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.dogId is string
        && request.resource.data.type is string
        && request.resource.data.category is string
        && request.resource.data.reaction is string;
      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Goals collection
    match /goals/{goalId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.dogId is string
        && request.resource.data.category is string
        && request.resource.data.type is string
        && request.resource.data.targetCount is number
        && request.resource.data.currentCount is number;
      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Key Security Constraints:**
- All operations require authentication
- Users can only read/write their own documents (checked via userId)
- Create operations validate required fields
- Update operations preserve userId (cannot be changed)
- No cross-user data access possible

### Storage Rules

**Storage Paths:**
- Dog photos: `dogs/{userId}/{dogId}/{timestamp}_{filename}`
- Session photos: `sessions/{userId}/{sessionId}/{timestamp}_{filename}`
- User avatars: `avatars/{userId}/{timestamp}_{filename}` (not used currently)

**Storage Security Rules (storage.rules):**

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Dogs photos
    match /dogs/{userId}/{dogId}/{filename} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Session photos
    match /sessions/{userId}/{sessionId}/{filename} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // User avatars
    match /avatars/{userId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Query Patterns

**Dogs Query:**
```typescript
collection('dogs')
  .where('userId', '==', currentUserId)
  .orderBy('createdAt', 'desc')
  .limit(100)
```

**Sessions Query:**
```typescript
collection('sessions')
  .where('userId', '==', currentUserId)
  .where('dogId', '==', selectedDogId)  // Optional
  .orderBy('date', 'desc')
  .limit(100)
```

**Goals Query:**
```typescript
collection('goals')
  .where('userId', '==', currentUserId)
  .where('dogId', '==', selectedDogId)  // Optional
  .orderBy('createdAt', 'desc')
  .limit(100)
```

**Key Points:**
- All queries filtered by `userId` first (security + performance)
- Optional `dogId` filter for multi-dog scenarios
- `orderBy` on indexed fields: `createdAt` for dogs/goals, `date` for sessions
- `limit(100)` prevents unbounded reads (can be increased if needed)
- Firestore automatically indexes these query combinations

### Batch Operations

**Goal Initialization (28 goals):**
- Use Firestore `writeBatch()` for atomic creation
- Batch limit: 500 operations (well within limit)
- All 28 goals created with single commit
- If batch fails: entire operation rolled back (atomic)

```typescript
const batch = writeBatch(db);
const now = new Date();

for (const goalData of predefinedGoals) {
  const docRef = doc(collection(db, 'goals'));
  batch.set(docRef, {
    ...goalData,
    userId: currentUserId,
    dogId: newDogId,
    createdAt: now,
    updatedAt: now,
  });
}

await batch.commit();
```

### Firebase SDK Versions

**Web:**
- Firebase JS SDK: v10.7.1
- Modular SDK imports (not compat)

**iOS:**
- Use Firebase iOS SDK (latest stable)
- Equivalent functionality to web modular SDK

---

## 10. Cross-Platform Compatibility Notes

### Critical Compatibility Issues

These normalization/migration patterns are **essential** for web-iOS data consistency:

### 10.1 photoURL vs photoUrl Field Normalization

**Issue:**
- iOS SDK uses `photoURL` (camelCase with uppercase URL)
- Web app uses `photoUrl` (camelCase with lowercase url)

**Solution:**
- **Writing:** iOS should write `photoUrl` (lowercase) to match web
- **Reading:** Web normalizes `photoURL` → `photoUrl` on document load
- **Implementation (web):**
  ```typescript
  if ('photoURL' in document && !('photoUrl' in document)) {
    document['photoUrl'] = document['photoURL'];
    delete document['photoURL'];
  }
  ```
- **iOS Implementation:** Always use `photoUrl` as field name when writing to Firestore

### 10.2 Session Type Casing Normalization

**Issue:**
- iOS historically sent capitalized session types: "People", "Dogs", "Environments", "Noises"
- Web canonical form is lowercase: "people", "dogs", "environments", "noises"

**Solution:**
- **Writing:** iOS must normalize to lowercase before writing to Firestore
- **Reading:** Web normalizes on load (supports both formats)
- **Implementation (web):**
  ```typescript
  function normalizeSessionType(type: string): SessionType {
    const lower = type.toLowerCase();
    
    // Canonical types
    if (['people', 'dogs', 'environments', 'noises'].includes(lower)) {
      return lower as SessionType;
    }
    
    // Legacy singular → plural mappings
    if (lower === 'person') return 'people';
    if (lower === 'dog') return 'dogs';
    if (lower === 'environment') return 'environments';
    if (lower === 'noise') return 'noises';
    
    // Fallback
    return 'people';
  }
  ```
- **iOS Implementation:** Convert session type to lowercase before writing: `type.lowercased()`

### 10.3 Legacy Session Type Names

**Issue:**
- Old iOS versions used singular forms: "Person", "Dog", "Environment", "Noise"
- Current canonical forms are plural: "people", "dogs", "environments", "noises"

**Migration Mappings:**
- "Person" / "person" → "people"
- "Dog" / "dog" → "dogs"
- "Environment" / "environment" → "environments"
- "Noise" / "noise" → "noises"

**Solution:**
- **iOS:** Always write plural lowercase forms
- **Web:** Handles legacy data via normalization on read

### 10.4 Default Field Injection for Sessions

**Issue:**
- Old session documents may lack: `placeType`, `intensity`, `isNewToDog`
- New UI expects these fields to exist

**Solution:**
- **Writing:** iOS must always include these fields when creating sessions
- **Reading:** Web injects defaults if missing:
  ```typescript
  if (isSessionDocument && !document.placeType) {
    document.placeType = 'Other';
  }
  if (isSessionDocument && !document.intensity) {
    document.intensity = 'low';
  }
  if (isSessionDocument && !document.isNewToDog) {
    document.isNewToDog = false;
  }
  ```
- **iOS Implementation:**
  - Always set `placeType` (default: "Other")
  - Always set `intensity` (default: "low")
  - Always set `isNewToDog` (default: false)

### 10.5 Legacy Goal Field Migration

**Issue:**
- Old goals only have single `targetCount`
- New system uses dual targets: `calmTargetCount` + `varietyTargetCount`
- Old goals have `currentCount` and `isCompleted` fields
- New system computes progress dynamically from sessions

**Migration Logic:**
```typescript
if ('targetCount' in document && !('calmTargetCount' in document)) {
  document.calmTargetCount = document.targetCount || 5;
  document.varietyTargetCount = 3;
}
```

**Solution:**
- **Writing:** iOS must always write both `calmTargetCount` and `varietyTargetCount`
- **Writing:** iOS should still write legacy fields for backward compat:
  - `targetCount: calmTargetCount`
  - `currentCount: 0`
  - `isCompleted: false`
- **Reading:** Both platforms ignore legacy `currentCount` and `isCompleted` (computed dynamically)
- **Reading:** If old goal missing new fields, migrate on load

### 10.6 Selected Dog Persistence

**Issue:**
- User's selected dog must persist across app restarts
- Web uses localStorage, iOS uses UserDefaults

**Solution:**
- **Web:** `localStorage.setItem('selectedDogId', dogId)`
- **iOS:** `UserDefaults.standard.set(dogId, forKey: "selectedDogId")`
- **Behavior:** 
  - On app launch: Read persisted dogId
  - If dogId exists and dog still exists: Auto-select
  - If dogId missing or dog deleted: Select first available dog
  - If no dogs: selectedDog = nil

### 10.7 Timestamp Handling

**Issue:**
- Firestore stores timestamps as `Timestamp` objects
- App needs JavaScript `Date` objects (web) or Swift `Date` (iOS)

**Solution:**
- **Web:** Convert on read: `timestamp.toDate()`
- **iOS:** Firestore iOS SDK handles automatically, but ensure proper date decoding

### 10.8 Date Formatting

**Consistency Required:**
- Both platforms must format dates identically for variety keys

**Variety Key Date Format (YYYY-MM-DD):**
```typescript
// Web
const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// iOS equivalent
let dateStr = dateFormatter.string(from: date)  // Format: "yyyy-MM-dd"
```

**Critical:** Variety keys MUST use zero-padded month/day (e.g., "2026-02-05", not "2026-2-5")

---

## 11. UI/UX Patterns

### 11.1 Dark Mode Support

**Implementation:**
- Toggle available in Settings page
- Preference persisted locally (localStorage on web, UserDefaults on iOS)
- Key: `puppysteps-dark-mode`
- Value: `'true'` or `'false'` (string on web, bool on iOS)

**Web Implementation:**
```typescript
// Read on app launch
const stored = localStorage.getItem('puppysteps-dark-mode');
const isDark = stored === 'true';

// Apply
if (isDark) {
  document.documentElement.classList.add('dark');
}

// Toggle
function toggleDarkMode() {
  const newValue = !isDarkMode;
  localStorage.setItem('puppysteps-dark-mode', String(newValue));
  if (newValue) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
```

**iOS Implementation:**
- Use `.preferredColorScheme()` modifier or manual theme switching
- Persist to UserDefaults
- Update entire app's color scheme

**Color Scheme:**
- Light mode: slate-50 backgrounds, slate-900 text
- Dark mode: slate-900 backgrounds, slate-100 text
- Primary colors remain consistent across modes

### 11.2 Toast Notifications

**Purpose:** Brief feedback messages for user actions

**Types:**
- Success (green/emerald) — checkmark icon
- Error (red) — alert circle icon
- Info (blue) — info circle icon

**Behavior:**
- Auto-dismiss after 3500ms (3.5 seconds)
- Can be manually dismissed (X button)
- Appears at top of screen
- Multiple toasts stack vertically
- Animated entrance/exit

**Web Implementation:**
- Context API: `ToastContext` provides `showToast(message, type)`
- Component: Toast component with auto-dismiss timer

**iOS Implementation:**
- Use custom SwiftUI toast or third-party library (e.g., AlertToast)
- Same 3.5s duration
- Similar visual styling

**Example Toast Messages:**
- "Exposure logged successfully!" (success)
- "Session deleted" (success)
- "Failed to delete session" (error)
- "Failed to log exposure. Please try again." (error)

### 11.3 Loading States

**Types:**

1. **Full-Page Spinner:**
   - Used during auth check
   - Used during page lazy loading (web)
   - Centered, large spinner (h-32 w-32)

2. **Skeleton Placeholders:**
   - Used for lists while loading data
   - Animated pulse effect
   - Gray background (slate-200 light, slate-700 dark)
   - Height matches content (h-20 for sessions, h-24 for goals)
   - 3-5 skeleton items shown

3. **Button Spinners:**
   - Small spinner (h-4 w-4) + text
   - "Signing In...", "Creating Account...", "Logging...", "Adding...", "Deleting..."
   - Button disabled during loading

**iOS Implementation:**
- ProgressView() for spinners
- Skeleton: Use redacted() modifier or custom placeholder views
- Disable buttons during loading

### 11.4 Empty States

**Pattern:**
- Icon (slate-400, h-12 w-12)
- Title (lg font, font-medium, slate-900)
- Description (slate-500)
- Optional CTA button

**Examples:**
- No dog selected: Target icon, "No Dog Selected", "Please add a dog profile..."
- No sessions: Calendar icon, "No sessions yet", "Start logging..."
- No goals: Target icon, "No Targets in This Category"

**iOS Implementation:**
- VStack with icon (SF Symbol), title, description, optional button
- Same visual hierarchy

### 11.5 Confirmation Dialogs

**Pattern:**
- Used for destructive actions (delete dog, delete session)
- Modal overlay with card
- Title (often red text for destructive)
- Clear warning message mentioning irreversibility
- Two buttons: Cancel (outline) + Destructive action (red)

**Web Implementation:**
- Modal component with title prop
- Custom content for message
- Button layout: flex gap-3, both flex-1

**iOS Implementation:**
- SwiftUI Alert or custom modal
- `.alert()` modifier or sheet
- Destructive button style for delete action

### 11.6 Form Validation

**Pattern:**
- Real-time validation on submit (not on every keystroke)
- Inline error messages below each field
- Red text (red-600 light, red-400 dark)
- Red border on invalid fields
- Error persists until corrected

**Example:**
```
[Invalid email input with red border]
⚠️ Please enter a valid email address
```

**Web Implementation:**
- Zod schemas for validation rules
- React Hook Form for form state
- Conditional rendering of error messages

**iOS Implementation:**
- Manual validation or Combine framework
- @FocusState for field tracking
- Conditional Text views below fields for errors

### 11.7 Color Scheme per Session Type

**Mapping:**
- **People:** Indigo (indigo-500, indigo-100 bg, indigo-800 text)
- **Dogs:** Violet (violet-500, violet-100 bg, violet-800 text)
- **Environments:** Emerald (emerald-500, emerald-100 bg, emerald-800 text)
- **Noises:** Amber (amber-500, amber-100 bg, amber-800 text)

**Usage:**
- Type badge backgrounds in session items
- Type icon containers
- Calendar day dots

**iOS Color Mapping:**
- Indigo → `.indigo`
- Violet → `.purple` (closest match)
- Emerald → `.green`
- Amber → `.orange`

**Web Tailwind Colors (for reference):**
- indigo-500: `#6366f1`
- violet-500: `#8b5cf6`
- emerald-500: `#10b981`
- amber-500: `#f59e0b`

---

## 12. Feature Parity Checklist

### Authentication & Onboarding
- [ ] Sign in form with email and password fields
- [ ] Email validation (valid email format)
- [ ] Password validation (min 6 characters)
- [ ] Sign in error handling and display
- [ ] Sign up form with name, email, password fields
- [ ] Name validation (min 2 characters)
- [ ] Sign up error handling and display
- [ ] Toggle between sign in and sign up modes
- [ ] "Forgot password?" link
- [ ] Password reset email sending
- [ ] Password reset success message display
- [ ] Password reset error handling
- [ ] Auto-redirect authenticated users away from auth page
- [ ] Redirect to intended route after authentication
- [ ] Auth state persistence across app restarts
- [ ] Loading spinner during auth check
- [ ] Protected route enforcement (redirect to auth if unauthenticated)

### Dog Management
- [ ] Add dog modal with name, age, breed, photo fields
- [ ] Dog name validation (required, max 100 chars)
- [ ] Dog age validation (required, number, min 0)
- [ ] Dog breed validation (required, max 100 chars)
- [ ] Photo upload for dog profile (optional)
- [ ] Dog photo storage in correct Firebase Storage path
- [ ] Dog profile creation in Firestore
- [ ] Automatic goal initialization (28 goals) on dog creation
- [ ] Display list of user's dogs in Settings
- [ ] Dog avatar rendering (with fallback initial)
- [ ] Dog card with name, breed, age display
- [ ] Delete dog confirmation modal
- [ ] Delete dog cascade warning message
- [ ] Dog deletion from Firestore
- [ ] Selected dog persistence (localStorage/UserDefaults)
- [ ] Auto-select first dog on app launch
- [ ] Auto-select first remaining dog after deletion
- [ ] "No dog selected" empty state

### Session Logging
- [ ] Log session modal opens from dashboard CTA
- [ ] Log session modal opens from goals page
- [ ] Log session modal opens from sessions page
- [ ] Date picker with max value of today
- [ ] Exposure type selector (4 buttons: people, dogs, environments, noises)
- [ ] Category dropdown populated based on selected type
- [ ] Category dropdown resets when type changes
- [ ] Place selector (9 options as pills)
- [ ] Intensity selector (3 options: low, medium, high)
- [ ] "New to my dog" checkbox (only for people/dogs types)
- [ ] "New to my dog" checkbox auto-hides for environments/noises
- [ ] Reaction selector (5 emoji buttons with labels)
- [ ] Notes textarea (optional)
- [ ] Photo upload (optional, image files only)
- [ ] Photo file name display with remove button
- [ ] Category required validation before submit
- [ ] Form validation error display
- [ ] Submit button disabled while creating session
- [ ] Submit button shows "Logging..." during creation
- [ ] Photo upload to Firebase Storage
- [ ] Session creation in Firestore
- [ ] Session document includes all required fields
- [ ] Pre-fill type and category when opened from goal card
- [ ] Form reset after successful submission
- [ ] Success toast after session creation
- [ ] Modal closes after successful submission
- [ ] Error handling and display for failed session creation

### Session Viewing
- [ ] Sessions page with list of all sessions
- [ ] Session list sorted by date descending (newest first)
- [ ] Type filter pills (All, People, Dogs, Environments, Noises)
- [ ] Session filtering by selected type
- [ ] Filter state reflected in card title and description
- [ ] Session item displays type badge with icon and color
- [ ] Session item displays category name
- [ ] Session item displays reaction emoji (large, colored)
- [ ] Session item displays reaction label
- [ ] Session item displays formatted date and time
- [ ] Session item displays notes (if present)
- [ ] Session item displays photo thumbnail (if present)
- [ ] Delete button on each session item
- [ ] Delete confirmation modal for sessions
- [ ] Session deletion from Firestore
- [ ] Success toast after session deletion
- [ ] Error toast if session deletion fails
- [ ] "No sessions yet" empty state for all filter
- [ ] "No {type} sessions yet" empty state for type filters
- [ ] Empty state with CTA to log first session
- [ ] Loading skeletons while sessions are loading

### Goals/Plan Management
- [ ] Goals page with type segmented control
- [ ] Segmented control with 4 segments (people, dogs, environments, noises)
- [ ] Goals filtering by selected type
- [ ] "Initialize Goals" CTA when no goals exist
- [ ] Batch creation of 28 predefined goals
- [ ] Loading state during goal initialization ("Creating Targets...")
- [ ] Progress summary card per type
- [ ] Progress summary shows completed/total counts
- [ ] Progress summary shows percentage (large, primary color)
- [ ] Animated progress bar (gradient primary to accent)
- [ ] Goal list card with type emoji and title
- [ ] Goal items display category name and type
- [ ] Goal items show dual progress bars (calm + variety)
- [ ] Calm progress bar styled with primary color
- [ ] Variety progress bar styled with accent color
- [ ] Progress bars show current/target counts
- [ ] "Log Exposure" button on each incomplete goal
- [ ] "Log Exposure" pre-fills modal with type and category
- [ ] Completed goals show check icon and "Complete" badge
- [ ] Completed goals styled with emerald colors
- [ ] Coaching tip displayed as status text on goals
- [ ] Last logged date displayed on goals
- [ ] "No exposures yet" message for goals with no sessions
- [ ] Loading skeletons while goals are loading
- [ ] Empty state for categories with no goals

### Dashboard
- [ ] Welcome header with dog avatar, name, breed, age
- [ ] Primary "Log Exposure" CTA button (full width, large)
- [ ] Today's Plan card with target icon and title
- [ ] Today's Plan shows 3 least-progressed incomplete goals
- [ ] Today's Plan goal items clickable to log exposure
- [ ] Today's Plan "View All Targets" button navigates to goals
- [ ] Today's Plan celebration state when all targets on track
- [ ] Stats row with 4 cards (2 cols mobile, 4 cols desktop)
- [ ] Targets % card with circular progress indicator
- [ ] This Week card with calendar icon and calm count
- [ ] Completed card with target icon and X/Y display
- [ ] Avg Reaction card with trending icon and X/5 display
- [ ] Category Progress card with 4 circular indicators
- [ ] Each category shows emoji, label, percentage, completed/total
- [ ] Recent Sessions card with last 3 sessions
- [ ] Recent sessions display using SessionItem component
- [ ] "View All Sessions" button navigates to sessions
- [ ] "No sessions yet" empty state on dashboard
- [ ] Loading skeletons for Today's Plan (3 items)
- [ ] Loading skeletons for Recent Sessions (3 items)
- [ ] Weekly calm count calculation (last 7 days, neutral or better)
- [ ] Average reaction calculation (1-5 scale, 1 decimal)
- [ ] Overall progress percentage calculation

### Calendar
- [ ] Calendar page with month/year title
- [ ] Calendar controls (Today, Previous, Next)
- [ ] Today button resets to current month and selects today
- [ ] Previous button navigates to previous month
- [ ] Next button navigates to next month
- [ ] Day-of-week header (Mon-Sun)
- [ ] Calendar grid with 7 columns × 6 rows = 42 cells
- [ ] Current month dates rendered normally
- [ ] Previous/next month dates rendered muted
- [ ] Today highlighted with primary color border and circle
- [ ] Session type dots displayed on days with sessions
- [ ] Dot colors match session type color scheme
- [ ] Up to 4 unique type dots per day
- [ ] Day cell click selects that day
- [ ] Selected day highlighted with primary border and background
- [ ] Selected day detail card appears below calendar
- [ ] Detail card shows formatted date (Weekday, Month Day, Year)
- [ ] Detail card shows session count
- [ ] Detail card shows session list (SessionItem components)
- [ ] "No sessions on this day" message if selected day has no sessions
- [ ] Legend displays 4 type dots with labels
- [ ] Week starts on Monday (not Sunday)
- [ ] Calendar loading skeleton (42 cells)
- [ ] Calendar grid responds to different screen sizes

### Resources
- [ ] Resources page with category filter pills
- [ ] Category pills (General, People, Dogs, Environments, Noises)
- [ ] Resources filtered by selected category
- [ ] Resources grid (1/2/3 cols based on screen size)
- [ ] Resource cards with type icon, title, description
- [ ] Duration displayed on resource cards
- [ ] Read Article/Guide/Tool button based on type
- [ ] External link icon on resource card buttons
- [ ] Resource card opens URL in new tab/browser
- [ ] Resource cards show hover effect (shadow)
- [ ] Suggestion card at bottom of page
- [ ] Suggestion card with BookOpen icon and description
- [ ] "Send a Suggestion" button opens email client
- [ ] Email client opens with pre-filled subject
- [ ] 10 predefined resources loaded
- [ ] Resource distribution matches spec (2/1/2/1/2 per category)

### Settings
- [ ] Settings page with account, dogs, app, support, sign out sections
- [ ] Account card displays user email
- [ ] Account card shows "Signed in" status
- [ ] Your Dogs card with list of dog profiles
- [ ] Dog cards show avatar, name, breed, age
- [ ] "Add Dog" button in Your Dogs header
- [ ] Delete button on each dog card
- [ ] Delete dog confirmation modal
- [ ] Cascade delete warning in modal
- [ ] Empty state when no dogs exist
- [ ] Empty state CTA to add first dog
- [ ] Dark mode toggle in App Settings
- [ ] Dark mode icon changes based on state (moon/sun)
- [ ] Dark mode status text (On/Off)
- [ ] Dark mode persisted in localStorage/UserDefaults
- [ ] Dark mode updates entire app theme immediately
- [ ] About PuppySteps expandable section
- [ ] About section shows version number (1.0.0)
- [ ] About section shows app tagline
- [ ] Contact Support row with mail icon
- [ ] Contact Support opens email client
- [ ] Sign Out card with destructive styling (red)
- [ ] Sign Out button calls signOut and redirects to auth

### Target Progress Computation (Business Logic)
- [ ] computeTargetProgress function implemented
- [ ] Calm count calculation (reaction ≥ neutral)
- [ ] Calm threshold includes: 😐, 😊, 😍
- [ ] Variety context keys: "context:{placeType}:{intensity}"
- [ ] Variety new individual keys: "new:YYYY-MM-DD" (people/dogs only)
- [ ] New individual keys capped at 1 per calendar day
- [ ] New individual keys only for isNewToDog === true
- [ ] Completion criteria: calmCount ≥ calmTarget AND varietyCount ≥ varietyTarget
- [ ] Progress computed per goal based on matching sessions
- [ ] Last logged date tracked per goal
- [ ] Progress computation is pure (no side effects)

### Coaching Tips Logic
- [ ] Coaching tip generated based on progress state
- [ ] "Great work! This target is complete." for complete goals
- [ ] "Start small..." for goals with no progress
- [ ] "Good variety! Focus on calm..." when variety met but calm lacking
- [ ] "Almost there! Try a new context..." when calm met but variety lacking
- [ ] "Try a new context..." when variety still needed
- [ ] Default encouragement message as fallback

### Session Stats Computation
- [ ] computeSessionStats function implemented
- [ ] Total sessions count
- [ ] Sessions by type count (per type breakdown)
- [ ] Average reaction calculation (1-5 numeric scale)
- [ ] Average defaults to 3 (neutral) if no sessions
- [ ] Recent sessions extracted (first 5)

### Category Progress Aggregation
- [ ] Category progress computed per session type
- [ ] Completed count per type based on dynamic progress
- [ ] Total count per type from goals list
- [ ] Percentage calculation (rounded to integer)
- [ ] Percentage defaults to 0 if no goals of that type

### Data Normalization (Critical)
- [ ] photoURL → photoUrl field normalization on read
- [ ] Session type lowercasing on read
- [ ] Legacy session type mapping (person/dog/environment/noise → plural)
- [ ] Default placeType injection ('Other') for old sessions
- [ ] Default intensity injection ('low') for old sessions
- [ ] Default isNewToDog injection (false) for old sessions
- [ ] Legacy goal migration (targetCount → calmTargetCount/varietyTargetCount)
- [ ] Firestore Timestamp → Date conversion

### Firebase Integration
- [ ] Firebase Auth configured with project
- [ ] Firestore database configured
- [ ] Firebase Storage configured
- [ ] Security rules deployed (dogs, sessions, goals, users)
- [ ] Storage rules deployed
- [ ] User can only read/write own documents (userId check)
- [ ] Field validation on document creation
- [ ] Query uses userId filter for all collections
- [ ] Query uses dogId filter when applicable
- [ ] Query uses orderBy on indexed fields
- [ ] Query uses limit(100) to prevent unbounded reads
- [ ] Batch write for goal initialization

### UI/UX Patterns
- [ ] Toast notifications for success/error feedback
- [ ] Toast auto-dismiss after 3.5 seconds
- [ ] Toast can be manually dismissed
- [ ] Loading spinners during async operations
- [ ] Skeleton placeholders for list loading states
- [ ] Button spinners with text during form submission
- [ ] Empty states with icon, title, description, CTA
- [ ] Confirmation modals for destructive actions
- [ ] Form validation with inline error messages
- [ ] Error messages in red text below fields
- [ ] Dark mode support with toggle in settings
- [ ] Dark mode persisted across app restarts
- [ ] Color consistency per session type (indigo/violet/emerald/amber)

### Navigation
- [ ] 6 tabs/sidebar items: Dashboard, Plan, Sessions, Calendar, Resources, Settings
- [ ] Tab icons match spec (or SF Symbol equivalents)
- [ ] Selected tab visually highlighted
- [ ] All routes except auth require authentication
- [ ] Unauthenticated users redirected to auth page
- [ ] Authenticated users on auth page redirected to dashboard
- [ ] Root path (/) redirects to dashboard

### Error Handling
- [ ] Network errors caught and displayed to user
- [ ] Firebase auth errors displayed in auth forms
- [ ] Firestore errors handled gracefully
- [ ] Photo upload errors handled
- [ ] Form validation errors displayed inline
- [ ] Toast error messages for critical failures
- [ ] No silent failures (user always gets feedback)

---

## Appendix: Example Data Flow

### Creating a Session (End-to-End)

1. **User Action:** Clicks "Log Exposure" button
2. **UI:** LogSessionModal opens with default/pre-filled values
3. **User Input:** Fills form fields (date, type, category, place, intensity, reaction, notes, photo)
4. **Validation:** Click submit → validate category is selected
5. **Photo Upload (if provided):**
   - Generate temp session ID: `temp-${Date.now()}`
   - Upload to Storage: `sessions/{userId}/{tempId}/{timestamp}_{filename}`
   - Get download URL
6. **Firestore Write:**
   - Create document in `sessions` collection
   - Document data:
     ```typescript
     {
       userId: currentUser.uid,
       dogId: selectedDog.id,
       date: selectedDate,
       type: normalizedType,  // lowercase
       category: selectedCategory,
       reaction: selectedReaction,
       placeType: selectedPlace,
       intensity: selectedIntensity,
       isNewToDog: isNewChecked,
       notes: notesText || undefined,
       photoUrl: downloadUrl || undefined,
       createdAt: new Date(),
       updatedAt: new Date(),
     }
     ```
7. **Cache Invalidation:** React Query invalidates sessions cache
8. **UI Updates:**
   - Modal closes
   - Form resets
   - Success toast displays
   - Sessions list refreshes (if on Sessions page)
   - Dashboard updates (if on Dashboard)
   - Calendar updates (if on Calendar page)
9. **Progress Recalculation:** `computeTargetProgress` runs with updated sessions list, goal progress updates

### Viewing Dashboard (Data Flow)

1. **Component Mount:** Dashboard component renders
2. **Data Fetching (parallel):**
   - `useDogs()` fetches dogs, determines selectedDog
   - `useGoals(dogId)` fetches goals for selected dog
   - `useSessions(dogId)` fetches sessions for selected dog
3. **Computations (client-side):**
   - `computeTargetProgress(goals, sessions)` → per-goal progress
   - Aggregate category progress (per-type completed/total)
   - Filter incomplete goals, sort by lowest progress, take 3 → Today's Plan
   - Filter sessions by last 7 days + calm reactions → weeklyCalmCount
   - `computeSessionStats(sessions)` → totalSessions, averageReaction
   - Take first 3 sessions → recentSessions
4. **Rendering:**
   - Header with dog info
   - Primary CTA button
   - Today's Plan with 3 GoalItems
   - Stats row with 4 cards (computed values)
   - Category Progress with 4 circular indicators
   - Recent Sessions with 3 SessionItems

### Initializing Goals (Batch Operation)

1. **User Action:** Clicks "Create All Targets" button
2. **UI:** Button shows spinner + "Creating Targets..." text
3. **Data Preparation:** Generate 28 goal documents from PREDEFINED_GOALS
4. **Firestore Batch Write:**
   ```typescript
   const batch = writeBatch(db);
   for (const goal of initialGoals) {
     const docRef = doc(collection(db, 'goals'));
     batch.set(docRef, { ...goal, createdAt: now, updatedAt: now });
   }
   await batch.commit();
   ```
5. **Cache Invalidation:** React Query invalidates goals cache
6. **UI Updates:**
   - Button returns to normal state
   - Initialize CTA hides
   - Segmented control appears
   - Goal list populates with 28 goals
   - Progress summary shows 0% for all types

---

## Document End

**Total Sections:** 12  
**Total Checklist Items:** 345+

This specification is comprehensive and self-contained. An iOS engineer should be able to implement feature parity using only this document without needing access to the web codebase.

For questions or clarifications, contact the web engineering team.

