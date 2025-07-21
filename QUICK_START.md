# 🚀 Quick Start - Belly Bear Sings

Get the entire karaoke platform running locally with **one command**!

## ⚡ Super Simple Start

```bash
pnpm start
```

That's it! This single command will:
- ✅ **Start Firebase emulators** (Auth, Firestore, Functions)
- ✅ **Seed the database** with sample data
- ✅ **Launch all apps** (Main app + Singer PWA)
- ✅ **Set up environment** files automatically

## 📍 What You Get

After running `pnpm start`, these services will be available:

| Service | URL | Purpose |
|---------|-----|---------|
| **Main App** | http://localhost:3000 | Host dashboard & public pages |
| **Singer PWA** | http://localhost:3001 | Mobile app for party guests |
| **Firebase UI** | http://localhost:4000 | Database admin interface |
| **Storybook** | http://localhost:6006 | UI component library |

## 🧪 Test Login

**Sample users** are available in development mode:

| Email | Password | Role |
|-------|----------|------|
| `alice@example.com` | `password123` | Host |
| `bob@example.com` | `password123` | Host |
| `charlie@example.com` | `password123` | Participant |

## 🎯 Test Flow

1. **Visit** http://localhost:3000
2. **Click** "Login" in navigation
3. **Click** any sample user to auto-fill form
4. **Click** "Sign In with Email"
5. **Access** the protected dashboard! 🎉

## 🛑 Stop Everything

Press `Ctrl+C` in the terminal to stop all services cleanly.

## 🔧 Alternative Commands

If you need more control:

```bash
# Just start apps (no emulators)
pnpm start:quick

# Just Firebase emulators
pnpm firebase:emulators

# Just seed database
pnpm firebase:seed

# Component development
pnpm storybook
```

## 🎉 You're Ready!

The platform is now running with:
- **Working authentication** with Firebase
- **Sample data** pre-loaded
- **Beautiful UI** with Material Design
- **Real-time ready** architecture

Start building your karaoke features! 🎤 