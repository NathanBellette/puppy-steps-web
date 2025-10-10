# PuppySteps - Dog Socialization Tracking App

A responsive web application built with React, TypeScript, and TailwindCSS to help dog owners track their dog's socialization progress.

## 🚀 Features

### Core Functionality
- **Dog Profile Management**: Add/edit dog profiles with photos, breed, age
- **Multi-dog Support**: Support for multiple dogs per user
- **Dashboard**: Progress tracking with circular indicators and goal summaries
- **Goals & Milestones**: Categorized goals (People, Dogs, Environments, Noises/Objects)
- **Session Logging**: Track socialization sessions with reactions and notes
- **Calendar View**: Visual calendar showing logged sessions
- **Progress Reports**: Charts and statistics for progress analysis
- **Resources Section**: Training materials and guides

### Web-Specific Enhancements
- **Responsive Design**: Mobile-first design with sidebar navigation on desktop
- **Dark Mode**: Toggle between light and dark themes
- **Export Functionality**: Export data as CSV/PDF from reports
- **Achievements**: Gamification with badges and progress tracking
- **Real-time Updates**: Firebase integration for live data sync

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS with dark mode support
- **State Management**: Zustand + React Query (TanStack Query)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives (Button, Card, etc.)
│   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   └── charts/         # Chart components (when implemented)
├── pages/              # Route-level pages
├── hooks/              # Custom hooks for data management
├── lib/                # Firebase & utility functions
├── context/            # React context providers
├── types/              # TypeScript type definitions
└── routes/             # Routing configuration
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
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
   - Copy `env.example` to `.env.local`
   - Add your Firebase configuration values
   ```bash
   cp env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Cloud Storage
5. Add your web app to the Firebase project
6. Copy the configuration values to your `.env.local` file

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Bottom navigation bar with essential features
- **Desktop**: Sidebar navigation with full feature access
- **Tablet**: Adaptive layout that works on all screen sizes

## 🎨 UI Components

### Reusable Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Card**: Container component with header, content, footer
- **Input**: Form input with validation styling
- **Modal**: Accessible modal with backdrop and keyboard navigation
- **Progress**: Linear and circular progress indicators
- **Select**: Custom dropdown with search capabilities

### Specialized Components
- **DogAvatar**: Profile photo display with fallback initials
- **GoalItem**: Interactive goal display with completion tracking
- **SessionItem**: Session log entry with type icons and reactions

## 🔐 Authentication

- Email/password authentication
- User profile management
- Protected routes with automatic redirects
- Persistent login state

## 📊 Data Management

- **Firebase Firestore**: Real-time database for user data
- **React Query**: Server state management with caching
- **Zustand**: Client state management for UI state
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

## 🚀 Deployment

This project is configured to deploy to Firebase Hosting via GitHub Actions.

### Automated Deployment

When you push to the `main` branch, GitHub Actions will automatically:
1. Run tests and linting
2. Build the application
3. Deploy to Firebase Hosting

### Setup Instructions

To set up Firebase Hosting deployment:
1. Follow the detailed guide in [`.github/FIREBASE_DEPLOYMENT_SETUP.md`](.github/FIREBASE_DEPLOYMENT_SETUP.md)
2. Add required GitHub Secrets to your repository
3. Push to `main` to trigger deployment

### Manual Deployment

You can also deploy manually:
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Firebase
npm run firebase:deploy
```

Your app will be available at: `https://your-project-id.web.app`

## 🎯 Future Enhancements

- [ ] Interactive calendar with session highlighting
- [ ] Chart visualizations using Recharts
- [ ] CSV/PDF export functionality
- [ ] Push notifications for goal reminders
- [ ] Social sharing of achievements
- [ ] Advanced filtering and search
- [ ] Offline support with service workers
- [ ] Progressive Web App (PWA) features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- TailwindCSS for styling framework
- React team for the amazing framework
- All the open-source contributors who made this possible

---

**Built with ❤️ for dog lovers and their furry friends**
