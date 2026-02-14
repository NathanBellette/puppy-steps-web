# PuppySteps - Dog Socialization Tracking App

A responsive web application built with React, TypeScript, and TailwindCSS to help dog owners track and manage their dog's socialization progress through structured goals, session logging, and progress analytics.

## Features

### Core Functionality
- **Dog Profile Management**: Add, edit, and delete dog profiles with photos, breed, and age
- **Multi-dog Support**: Manage multiple dogs per user with easy switching
- **Dashboard**: At-a-glance progress with circular indicators, today's plan, recent sessions, and weekly calm exposure tracking
- **Goals & Milestones**: 29 predefined socialization targets across 4 categories (People, Dogs, Environments, Noises) with calm exposure and variety tracking
- **Session Logging**: Log socialization sessions with reaction levels (5-point emoji scale), place type, intensity, notes, and photos
- **Calendar View**: Visual calendar showing logged sessions
- **Progress Reports**: Goal completion statistics and session analytics
- **Resources Section**: Training materials and guides
- **Settings**: Theme toggle (light/dark mode) and user preferences

### Web-Specific
- **Responsive Design**: Mobile-first layout with bottom navigation on mobile and sidebar on desktop
- **Dark Mode**: Class-based theme switching via TailwindCSS
- **Real-time Updates**: Firebase integration for live data sync
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Protected Routes**: Authentication-gated access with automatic redirects

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 18, TypeScript 5.2 |
| **Build Tool** | Vite 5 |
| **Styling** | TailwindCSS 3.3, tailwind-merge, clsx |
| **Routing** | React Router DOM 6 |
| **State Management** | TanStack Query (React Query) 5, React Context |
| **Forms** | React Hook Form 7, Zod 3 |
| **Backend** | Firebase 10 (Auth, Firestore, Cloud Storage) |
| **Icons** | Lucide React |
| **Dates** | date-fns 2 |
| **Unit Testing** | Vitest 3, Testing Library (React, jest-dom, user-event) |
| **E2E Testing** | Playwright 1.58 |
| **Linting** | ESLint 8 with TypeScript ESLint |
| **CI/CD** | GitHub Actions, Firebase Hosting |

## Project Structure

```
puppy-steps-web/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── ConfirmModal/
│   │   │   ├── DogAvatar/
│   │   │   ├── EmptyState/
│   │   │   ├── GoalItem/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── PageLoader/
│   │   │   ├── Progress/
│   │   │   ├── SegmentedControl/
│   │   │   ├── Select/
│   │   │   ├── SessionItem/
│   │   │   ├── SettingsListItem/
│   │   │   ├── SkeletonList/
│   │   │   └── Spinner/
│   │   ├── layout/          # Layout components
│   │   │   ├── Header/
│   │   │   ├── Layout/
│   │   │   ├── MobileNav/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Sidebar/
│   │   └── AddDogModal.tsx
│   ├── pages/               # Route-level pages
│   │   ├── AuthPage.tsx
│   │   ├── Calendar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Goals.tsx
│   │   ├── Resources.tsx
│   │   ├── Sessions.tsx
│   │   └── Settings.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDogProfile.ts
│   │   ├── useGoals.ts
│   │   ├── useSessions.ts
│   │   └── useTargetProgress.ts
│   ├── services/            # Business logic & statistics
│   │   ├── goalStats.ts
│   │   ├── sessionStats.ts
│   │   └── targetProgress.ts
│   ├── context/             # React context providers
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Firebase config & utilities
│   ├── routes/              # Routing configuration
│   └── test/                # Test setup
├── e2e/                     # Playwright E2E tests
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── ci.yml
│       ├── deploy.yml
│       ├── playwright.yml
│       └── dependency-updates.yml
├── firestore.rules          # Firestore security rules
├── storage.rules            # Cloud Storage security rules
└── firebase.json            # Firebase hosting config
```

## Getting Started

### Prerequisites
- Node.js 22+
- npm
- Firebase project with Auth, Firestore, and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd puppy-steps-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` and add your Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id  # optional
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Cloud Storage
5. Add your web app to the Firebase project
6. Copy the configuration values to your `.env.local` file

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint (zero warnings policy) |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:ui` | Open Vitest UI dashboard |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run type-check` | TypeScript type checking (no emit) |
| `npm run firebase:emulators` | Start Firebase emulators |
| `npm run firebase:deploy` | Deploy to Firebase Hosting |

## Testing

### Unit Tests

Unit tests use **Vitest** with **Testing Library**. Tests cover UI components and business logic services.

```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### E2E Tests

End-to-end tests use **Playwright** and run against Chromium, Firefox, and WebKit.

```bash
# Install browsers (first time)
npx playwright install

# Run E2E tests
npx playwright test

# View HTML report
npx playwright show-report
```

## CI/CD

Four GitHub Actions workflows automate quality checks and deployment:

| Workflow | Trigger | Description |
|---|---|---|
| **CI** (`ci.yml`) | Pull requests to `main` | Type checking, linting, unit tests, build verification |
| **Playwright** (`playwright.yml`) | Pull requests | E2E tests across browsers with HTML report artifact |
| **Deploy** (`deploy.yml`) | Push to `main` | Build and deploy to Firebase Hosting |
| **Dependency Updates** (`dependency-updates.yml`) | Weekly (Mondays) / manual | Automated dependency updates with PR creation |

## Deployment

### Automated Deployment

Pushing to the `main` branch triggers GitHub Actions to:
1. Run type checking and linting
2. Build the application
3. Deploy to Firebase Hosting

### Setup Instructions

To configure Firebase Hosting deployment:
1. Follow the guide in [`.github/FIREBASE_DEPLOYMENT_SETUP.md`](.github/FIREBASE_DEPLOYMENT_SETUP.md)
2. Add required GitHub Secrets to your repository
3. Push to `main` to trigger deployment

### Manual Deployment

```bash
npm run build
npm run firebase:deploy
```

## Authentication

- Email/password authentication via Firebase Auth
- User profile management
- Protected routes with automatic redirects
- Persistent login state

## Security

- **Firestore Rules**: User-scoped data access, field validation, deny-by-default for unknown collections
- **Storage Rules**: User-based file access control, image-only restrictions, 1MB file size limit

## Future Enhancements

- [ ] CSV/PDF export functionality
- [ ] Push notifications for goal reminders
- [ ] Social sharing of achievements
- [ ] Advanced filtering and search
- [ ] Offline support with service workers
- [ ] Progressive Web App (PWA) features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
