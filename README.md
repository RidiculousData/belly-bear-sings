# 🎤 Belly Bear Sings

A modern live karaoke queue platform built with React, Firebase, and YouTube integration.

## 🚀 Quick Start

### Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd bellybearsings

# Install dependencies
pnpm install

# Start the full development environment (Firebase + Apps)
pnpm start

# OR start just the apps (no Firebase emulators)
pnpm start:quick

# Stop all services
pnpm stop

# Check port availability
pnpm check-ports
```

### Port Management

The application uses the following ports:
- **3000**: Main App (Host & Public interface)
- **3001**: Singer PWA (Guest interface)
- **4000**: Firebase Emulator UI

All start scripts include automatic port checking to prevent conflicts:
- ✅ **Smart Port Checking**: Automatically detects if ports are in use
- ✅ **Conflict Prevention**: Won't start if ports are already occupied
- ✅ **Clear Error Messages**: Shows exactly what's using each port
- ✅ **Easy Resolution**: Provides commands to stop conflicting processes

### Available Commands

```bash
# Development
pnpm start          # Full environment (Firebase + Apps)
pnpm start:quick    # Just the apps (faster startup)
pnpm stop           # Stop all services cleanly
pnpm check-ports    # Check port availability

# Building & Testing
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm lint           # Run linters

# Firebase
pnpm firebase:emulators  # Start Firebase emulators only
pnpm firebase:seed       # Seed database with sample data

# Component Library
pnpm storybook      # Start Storybook for UI components
```

## 🏗️ Architecture

### Apps
- **Main App** (`apps/main-app`): Host dashboard and public marketing site
- **Singer PWA** (`apps/singer-pwa`): Mobile-first guest interface

### Packages
- **UI** (`libs/ui`): Shared component library with Storybook
- **Firebase Config** (`libs/firebase-config`): Firebase setup and utilities
- **Shared** (`libs/shared`): Common types and utilities

### Firebase Services
- **Authentication**: Email/password and anonymous auth
- **Firestore**: Real-time database for parties and songs
- **Functions**: Server-side logic for party management
- **Hosting**: Static site hosting

## 🎯 Key Features

### For Hosts
- Create and manage karaoke parties
- Display live queue on large screens
- Control song playback and order
- Share parties via QR codes

### For Singers
- Join parties by scanning QR codes
- Search YouTube for karaoke songs
- Add songs to the live queue
- Boost songs to skip ahead (limited per party)
- Save favorite songs for future parties

### Technical Features
- **Real-time Updates**: Live queue synchronization
- **Offline Support**: PWA capabilities for guests
- **YouTube Integration**: Millions of karaoke tracks
- **Social Features**: Song boosting, favorites, playlists
- **Mobile-First**: Responsive design for all devices

## 📊 Environment Setup

### Firebase Configuration

Copy `.env.example` to `.env.local` in each app directory:

```bash
# apps/main-app/.env.local
# apps/singer-pwa/.env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### Development Commands

```bash
# Complete development environment
pnpm start

# Just start apps (no emulators)
pnpm start:quick

# Start Firebase emulators only
pnpm firebase:emulators

# Seed database with sample data
pnpm firebase:seed

# Start Storybook
pnpm storybook

# Stop all services
pnpm stop
```

## 🎯 Core Features

### For Hosts
- Create and manage karaoke parties
- Display queue on TV/large screen
- Control playback and skip songs
- Share party via QR code

### For Singers
- Join parties via QR code
- Search YouTube for karaoke songs
- Add songs to queue
- Boost songs (3 per party)
- Save favorite songs
- Create playlists

## 🏗️ Architecture Benefits

### Why Vite + Firebase?
- **⚡ Fast Development**: 3-5x faster hot reload than Next.js
- **🔥 Real-time Ready**: Perfect for live karaoke features
- **📦 Smaller Bundles**: Better performance for users
- **🎯 Firebase Optimized**: No need for API routes with Firebase
- **🚀 Simple Deployment**: Client-side routing works great

### Route Structure
```
Main App (localhost:3000):
├── / (public)              # Landing page
├── /login (public)         # Authentication
├── /signup (public)        # Registration
├── /dashboard (protected)  # Host dashboard
├── /party/create (protected) # Create party
├── /party/:id (protected)  # Host party view
└── /profile (protected)    # User profile

Singer PWA (localhost:3001):
├── /join/:partyId         # Join party
├── /queue/:partyId        # View queue
└── /search/:partyId       # Search songs
```

## 📊 Data Model

### Collections
- **Users**: Registered user profiles
- **Parties**: Active and past party sessions
- **Songs**: Queue entries with YouTube metadata
- **Favorites**: User's saved songs
- **Playlists**: Organized song collections

### Real-time Features
- Live queue updates
- Song status changes
- Participant join/leave events
- Boost notifications

## 🚀 Deployment

### Firebase Hosting
```bash
# Build for production
pnpm build

# Deploy to Firebase
firebase deploy
```

### Environment Variables
Ensure all required environment variables are set for production deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 