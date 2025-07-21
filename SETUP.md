# Belly Bear Sings - Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** (v8 or higher)
   ```bash
   npm install -g pnpm
   ```
3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```
4. **Google Cloud Account** (for YouTube API)

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable the following services:
   - Authentication (with providers: Email/Password, Phone, Google, Apple, Facebook, Twitter, Anonymous)
   - Firestore Database
   - Cloud Functions
   - Hosting

3. Initialize Firebase in the project:
   ```bash
   cd firebase
   firebase init
   ```
   Select:
   - Firestore
   - Functions (TypeScript)
   - Hosting (configure multiple sites)
   - Emulators (Auth, Firestore, Functions, Hosting)

4. Deploy Firestore rules and indexes:
   ```bash
   firebase deploy --only firestore
   ```

### 3. YouTube API Setup

1. Go to https://console.cloud.google.com
2. Create a new project or select your Firebase project
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the API key to your domains

### 4. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Create `.env.local` files in each app:
   ```bash
   cp .env.local apps/public-website/.env.local
   cp .env.local apps/singer-pwa/.env.local
   cp .env.local apps/host-app/.env.local
   ```

3. Fill in your Firebase and YouTube API credentials in each `.env.local` file

### 5. Firebase Hosting Setup

Configure Firebase hosting for multiple sites:

```bash
firebase hosting:sites:create bellybearsings
firebase hosting:sites:create bellybearsings-singer
firebase hosting:sites:create bellybearsings-host
```

Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## Development

### Start All Services

1. Start Firebase emulators:
   ```bash
   pnpm firebase:emulators
   ```

2. In a new terminal, start all apps:
   ```bash
   pnpm dev
   ```

This will start:
- Public Website: http://localhost:3000
- Singer PWA: http://localhost:3001
- Host App: http://localhost:3002
- Firebase Emulator UI: http://localhost:4000

### Individual Services

Start specific apps:
```bash
# Public website
cd apps/public-website && pnpm dev

# Singer PWA
cd apps/singer-pwa && pnpm dev

# Host app
cd apps/host-app && pnpm dev

# Storybook
pnpm storybook
```

## Building for Production

1. Build all apps:
   ```bash
   pnpm build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Project Structure

- `apps/public-website` - Next.js marketing site
- `apps/singer-pwa` - Vite PWA for party guests
- `apps/host-app` - Vite app for party hosts
- `libs/ui` - Shared UI components (with Storybook)
- `libs/shared` - Shared types and utilities
- `libs/firebase-config` - Firebase configuration and services
- `firebase/` - Firebase functions and configuration

## Testing the App

1. **Create a Party (Host)**:
   - Go to http://localhost:3002
   - Sign up/login as a host
   - Create a new party
   - You'll see a QR code and party link

2. **Join a Party (Singer)**:
   - Go to http://localhost:3001
   - Scan the QR code or enter the party ID
   - Sign in anonymously or create an account
   - Search for songs and add them to the queue

3. **Manage the Queue (Host)**:
   - View the live queue update
   - Play songs from YouTube
   - Skip to the next song

## Troubleshooting

### Common Issues

1. **Firebase Emulators not starting**:
   - Make sure Java is installed (required for Firestore emulator)
   - Check if ports are already in use

2. **YouTube API quota exceeded**:
   - The free tier has limited quota
   - Consider implementing caching or request throttling

3. **PWA not installing**:
   - Ensure you're accessing via HTTPS or localhost
   - Check that all PWA requirements are met

### Development Tips

- Use the Firebase Emulator UI (http://localhost:4000) to view and modify data
- Check the browser console for detailed error messages
- Enable React Developer Tools for debugging

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Material-UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Next.js Documentation](https://nextjs.org/docs) 