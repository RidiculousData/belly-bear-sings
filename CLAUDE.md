# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `pnpm start` - Start full development environment (Firebase + App)
- `pnpm start:quick` - Start just the app (faster, no Firebase emulators)
- `pnpm stop` - Stop all services cleanly
- `pnpm check-ports` - Check port availability before starting
- `pnpm dev` - Alternative to start (runs Firebase + Vite concurrently)

### Building & Testing
- `pnpm build` - Build the application (`tsc && vite build`)
- `pnpm lint` - Run ESLint with TypeScript rules
- `pnpm preview` - Preview production build locally

### Firebase Operations
- `pnpm firebase:emulators` - Start Firebase emulators only (port 4000 for UI)
- `pnpm firebase:seed` - Populate database with sample data
- `pnpm firebase:stop` - Stop Firebase emulators

### Component Development
- `pnpm storybook` - Start Storybook component library (runs from libs/ui)

### Production Deployment
- `pnpm deploy` - Full deployment (build + copy + deploy to Firebase)
- `pnpm deploy:rules` - Deploy only Firestore rules and indexes
- `pnpm deploy:hosting` - Deploy only hosting (assumes build already done)
- **Production URL**: https://bellybearsings.web.app

## Project Architecture

This is a **live karaoke queue platform** built as a single Vite React app with Firebase backend, using a modern domain-driven persistence layer.

### Core Structure
```
src/
├── components/          # React components
├── pages/              # Route pages (HomePage, DashboardPage, PartyPage, etc.)
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom hooks (usePartyPlayer)
├── persistence/        # Domain-driven Active Record models
│   ├── models/         # User, Party, QueueSong, FavoriteSong, PartyGuest
│   └── BaseModel.ts    # Abstract base with CRUD operations
├── services/           # Business logic services
└── types/              # TypeScript definitions
```

### Key Dependencies
- **React 18** + **TypeScript** + **Vite** for fast development
- **Firebase 10** (Auth, Firestore, Functions) for backend
- **Material-UI 5** (@mui/material, @emotion) for components
- **React Router 6** for routing
- **react-youtube** for video playback integration
- **pnpm workspaces** with shared packages (referenced as `@bellybearsings/*`)

### Persistence Layer (Active Record Pattern)
The app uses a sophisticated domain-driven persistence layer in `src/persistence/`:

- **BaseModel**: Abstract class providing CRUD, validation, and real-time subscriptions
- **Domain Models**: User, Party, QueueSong, FavoriteSong, PartyGuest with business logic
- **Type Safety**: Full TypeScript support with interfaces
- **Real-time**: Built-in Firestore subscription methods for live updates

Key model operations:
```typescript
// Create and save
const party = Party.createNew({ name: 'Karaoke Night', hostId: 'user123' });
await party.save();

// Find and update
const user = await User.find('user123');
user.updateProfile({ firstName: 'Johnny' });
await user.save();

// Real-time subscriptions
const unsubscribe = QueueSong.subscribe((songs) => updateUI(songs));
```

### Firebase Configuration
- **Emulators**: Auth (9099), Firestore (8088), Functions (5001), Hosting (5005), UI (4000)
- **Collections**: users, parties, queueSongs, favoriteUsers, partyGuests
- **Real-time Features**: Live queue updates, participant sync, song status changes
- **Authentication**: Email/password and anonymous auth supported

### Route Structure
- `/` - Public landing page (HomePage)
- `/party/:partyCode` - Main party view for both host and participants
- `/participant/:partyCode` - Protected participant interface 
- `/dashboard` - Protected host dashboard
- `/profile` - Protected user profile

### Key Features
- **Host Features**: Create/manage parties, display live queue, control playback, share via QR codes
- **Singer Features**: Join via party codes, search YouTube, add songs to queue, boost songs (3 per party), save favorites
- **Real-time**: Live queue synchronization, participant updates, song status changes
- **PWA-ready**: Mobile-first design with offline capabilities

## Development Notes

### Port Usage
- **3000**: Main application (Vite dev server)
- **4000**: Firebase Emulator UI
- Various Firebase service ports (5001, 8088, 9099, 5005)

### Environment Setup
Copy `env.example` to `.env.local` with Firebase config and YouTube API key:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_YOUTUBE_API_KEY=...
```

### Testing Data
Use `pnpm firebase:seed` to populate with sample parties and songs for development.

### Common Development Patterns
- Use the persistence models instead of direct Firebase calls
- Components follow Material-UI patterns with emotion styling
- React Router v6 with protected routes via ProtectedRoute component
- Context-based authentication state management
- Custom hooks for complex state logic (e.g., usePartyPlayer)

### Package Manager
This project uses **pnpm** exclusively. The workspace structure references shared packages that should be built before the main app.