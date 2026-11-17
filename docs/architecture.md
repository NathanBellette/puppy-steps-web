# Architecture

> Last verified: `54f6610` on `2026-11-17`

This repo is the **hub** for the PuppySteps system. It owns the Firebase configuration (`firebase.json`, `firestore.rules`, `storage.rules`, `.firebaserc`), so it owns the system's level 1 diagram. The sibling repo is the iOS app, [PuppySteps](https://github.com/NathanBellette/PuppySteps/blob/main/docs/architecture.md).

The backend in use per the code is **Firebase** (Auth, Firestore, Storage, Hosting). `docs/firebase-evaluation.md` and `docs/supabase-migration-plan.md` are planning documents for a possible move to Supabase. No Supabase client, config or migration exists in the code.

## System context (C4 level 1)

```mermaid
C4Context
    title PuppySteps system context

    Person(puppysteps_owner, "Dog owner", "Logs socialisation sessions and tracks goals")
    System(puppysteps, "PuppySteps", "Web app and iOS app for puppy socialisation tracking")
    System_Ext(puppysteps_firebase, "Firebase", "Auth, Firestore, Storage and Hosting, configured by this repo")
    System_Ext(puppysteps_training_sites, "Dog training sites", "AKC and ASPCA articles")

    Rel(puppysteps_owner, puppysteps, "Logs sessions and views progress", "HTTPS and iOS")
    Rel(puppysteps, puppysteps_firebase, "Stores and reads dogs, sessions, goals and photos", "Firebase SDK")
    Rel(puppysteps, puppysteps_training_sites, "Links out to articles", "HTTPS")
```

Owners use either the React web app or the SwiftUI iOS app. Both talk straight to Firebase from client code, and there is no custom API server. Firestore and Storage security rules in this repo are the only server-side enforcement.

## Containers (C4 level 2)

```mermaid
C4Container
    title PuppySteps containers

    Person(puppysteps_owner, "Dog owner", "Logs sessions and tracks goals")

    System_Boundary(puppysteps_boundary, "PuppySteps") {
        Container(puppysteps_web, "Web app", "React 18, Vite, TypeScript", "Single page app for dogs, goals and sessions")
        Container_Ext(puppysteps_ios, "iOS app", "SwiftUI, Firebase iOS SDK", "Native app, lives in the PuppySteps repo")
        Container(puppysteps_hosting, "Firebase Hosting", "Firebase Hosting", "Serves the built web bundle")
        Container(puppysteps_firebase_auth, "Firebase Auth", "Email and password", "Identity for both apps")
        ContainerDb(puppysteps_firestore, "Firestore", "Cloud Firestore", "users, dogs, sessions and goals collections")
        ContainerDb(puppysteps_storage, "Cloud Storage", "Firebase Storage", "Dog and session photos")
    }

    System_Ext(puppysteps_github_actions, "GitHub Actions", "Deploy workflow on push to main")
    System_Ext(puppysteps_training_sites, "Dog training sites", "AKC and ASPCA articles")

    Rel(puppysteps_owner, puppysteps_web, "Uses in browser", "HTTPS")
    Rel(puppysteps_owner, puppysteps_ios, "Uses on iPhone", "iOS")
    Rel(puppysteps_hosting, puppysteps_web, "Serves SPA bundle", "HTTPS")
    Rel(puppysteps_github_actions, puppysteps_hosting, "Deploys dist build", "firebase hosting deploy action")
    Rel(puppysteps_web, puppysteps_firebase_auth, "Signs users in and out", "Firebase JS SDK")
    Rel(puppysteps_web, puppysteps_firestore, "Reads and writes documents", "Firebase JS SDK")
    Rel(puppysteps_web, puppysteps_storage, "Uploads photos", "Firebase JS SDK")
    Rel(puppysteps_ios, puppysteps_firebase_auth, "Signs users in and out", "Firebase iOS SDK")
    Rel(puppysteps_ios, puppysteps_firestore, "Reads and writes documents", "Firebase iOS SDK")
    Rel(puppysteps_ios, puppysteps_storage, "Uploads photos", "Firebase iOS SDK")
    Rel(puppysteps_web, puppysteps_training_sites, "Opens article links", "window.open")
```

| Container | Tech | Where it lives |
|---|---|---|
| `puppysteps_web` | React 18, Vite 5, TypeScript, TanStack Query, React Router, Tailwind | `src/`, `index.html`, `vite.config.ts`, `package.json` |
| `puppysteps_ios` | SwiftUI, Firebase iOS SDK 12 | Other repo: [PuppySteps](https://github.com/NathanBellette/PuppySteps/blob/main/docs/architecture.md) |
| `puppysteps_hosting` | Firebase Hosting, SPA rewrite to `index.html` | `firebase.json` (`hosting`), `.firebaserc`, `.github/workflows/deploy.yml` |
| `puppysteps_firebase_auth` | Firebase Auth, email and password only | `src/lib/auth.ts`, `src/lib/firebase.ts` |
| `puppysteps_firestore` | Cloud Firestore, owner-only rules, deny by default | `firestore.rules`, `firebase.json` (`firestore`), `src/lib/firestore.ts` |
| `puppysteps_storage` | Firebase Storage, 5 MB image limit, owner-only paths `dogs/`, `sessions/`, `avatars/` | `storage.rules`, `firebase.json` (`storage`), `src/lib/storage.ts` |

Other build and test machinery: GitHub Actions run type check, lint, unit tests, build and Playwright (`.github/workflows/`). The `Dockerfile` is a CI-only Playwright test image, not a deployable. The Firebase project id and web config come from `VITE_FIREBASE_*` variables named in `env.example`.

## Components: Web app (C4 level 3)

```mermaid
C4Component
    title Web app components

    Container_Boundary(puppysteps_web_boundary, "Web app") {
        Component(puppysteps_web_router, "Router", "react-router-dom", "Lazy routes and ProtectedRoute guard")
        Component(puppysteps_web_pages, "Pages", "React", "Dashboard, Goals, Sessions, LogExposure, Calendar, Resources, Settings, Auth")
        Component(puppysteps_web_auth_context, "Auth context", "React Context", "Tracks the signed-in user")
        Component(puppysteps_web_hooks, "Data hooks", "TanStack Query", "useDogs, useGoals, useSessions, useTargetProgress")
        Component(puppysteps_web_stats, "Stats services", "TypeScript", "Pure goal, session and target progress calculations")
        Component(puppysteps_web_firestore_client, "Firestore client", "firebase/firestore", "Typed CRUD and goal batch writes")
        Component(puppysteps_web_storage_client, "Storage client", "firebase/storage", "Photo upload helpers")
        Component(puppysteps_web_auth_client, "Auth client", "firebase/auth", "Sign in, sign up, sign out, password reset")
    }

    Container_Ext(puppysteps_firebase_auth, "Firebase Auth", "Email and password", "Identity")
    ContainerDb(puppysteps_firestore, "Firestore", "Cloud Firestore", "Documents")
    ContainerDb(puppysteps_storage, "Cloud Storage", "Firebase Storage", "Photos")

    Rel(puppysteps_web_router, puppysteps_web_pages, "Lazy loads route pages", "React.lazy")
    Rel(puppysteps_web_router, puppysteps_web_auth_context, "Checks signed-in user", "useAuth")
    Rel(puppysteps_web_pages, puppysteps_web_hooks, "Queries and mutates data", "hooks")
    Rel(puppysteps_web_hooks, puppysteps_web_stats, "Computes progress", "function calls")
    Rel(puppysteps_web_hooks, puppysteps_web_firestore_client, "Reads and writes documents", "function calls")
    Rel(puppysteps_web_hooks, puppysteps_web_storage_client, "Uploads photos", "function calls")
    Rel(puppysteps_web_auth_context, puppysteps_web_auth_client, "Signs in and out", "function calls")
    Rel(puppysteps_web_auth_client, puppysteps_firebase_auth, "Authenticates", "Firebase JS SDK")
    Rel(puppysteps_web_auth_client, puppysteps_firestore, "Creates users document on sign up", "Firebase JS SDK")
    Rel(puppysteps_web_firestore_client, puppysteps_firestore, "Queries and writes", "Firebase JS SDK")
    Rel(puppysteps_web_storage_client, puppysteps_storage, "Uploads images", "Firebase JS SDK")
```

| Component | Where it lives |
|---|---|
| Router | `src/routes/AppRouter.tsx`, `src/components/layout/ProtectedRoute.tsx` |
| Pages | `src/pages/` |
| Auth context | `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts` |
| Data hooks | `src/hooks/useDogProfile.ts`, `useGoals.ts`, `useSessions.ts`, `useTargetProgress.ts` |
| Stats services | `src/services/goalStats.ts`, `sessionStats.ts`, `targetProgress.ts` |
| Firestore client | `src/lib/firestore.ts` (initialised in `src/lib/firebase.ts`) |
| Storage client | `src/lib/storage.ts` |
| Auth client | `src/lib/auth.ts` |

The web app reads with one-shot `getDocs` queries cached by TanStack Query (5 minute stale time, set in `src/App.tsx`). It does not use Firestore snapshot listeners.

## Cross-repo links

| This repo talks to | Container id | Repo | Architecture doc |
|---|---|---|---|
| iOS app (shares Firebase project, collections and rules with this repo) | `puppysteps_ios` | PuppySteps | [docs/architecture.md](https://github.com/NathanBellette/PuppySteps/blob/main/docs/architecture.md) |

This repo is the hub. The iOS repo draws its own level 2 and reuses the ids above (`puppysteps_firebase_auth`, `puppysteps_firestore`, `puppysteps_storage`) as `Container_Ext`.

## Detail

- Planning, not architecture: [firebase-evaluation.md](./firebase-evaluation.md) and [supabase-migration-plan.md](./supabase-migration-plan.md).
- Firestore collections with owner-only rules: `users` (document id is the uid), `dogs`, `sessions`, `goals` (each carries a `userId`). Anything else is denied.
- Storage paths allowed by `storage.rules`: `dogs/{userId}/...`, `sessions/{userId}/...`, `avatars/{userId}/...`. Images only, under 5 MB.
