# Multi-Tenant Firebase Cloud Migration

## Overview

The application has been migrated to use **Firebase Cloud exclusively** with **multi-tenant data isolation**. All development, testing, and production now use Firebase Cloud (no emulators).

## Key Changes

### 1. Removed All Emulator Connections
- ✅ Removed all Firebase emulator connection code
- ✅ Removed emulator configuration
- ✅ Application always uses Firebase Cloud services

### 2. Multi-Tenant Architecture
- ✅ Data is partitioned by tenant: `dev`, `test`, `prod`
- ✅ Each tenant has completely isolated data in Firebase Cloud
- ✅ Tenant detection via `VITE_TENANT` environment variable or URL hostname
- ✅ All data stored under `tenants/{tenant}/` collection paths

### 3. Data Structure

All data is now stored under tenant-prefixed paths:

```
Firestore Structure:
├── tenants/
│   ├── dev/
│   │   ├── users/{userId}
│   │   ├── parties/{partyId}
│   │   │   ├── queueSongs/{songId}
│   │   │   └── partyGuests/{guestId}
│   │   └── users/{userId}/favoriteSongs/{songId}
│   ├── test/
│   │   └── [same structure]
│   └── prod/
│       └── [same structure]
└── system/
    └── userPermissions/{userId}  # Global, not tenant-specific
```

### 4. Permission System
- ✅ User permissions stored in `system/userPermissions` (global collection)
- ✅ Permissions include tenant access (`dev`, `test`, `prod`, or `all`)
- ✅ Role-based access control (super_admin, admin, host, guest, developer, tester)
- ✅ New users automatically get `guest` role for their tenant

## Configuration

### Environment Variables

Update your `.env` file:

```bash
# Tenant Configuration (Multi-tenancy)
VITE_TENANT=dev  # dev, test, or prod

# Firebase Cloud Configuration (Production)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# YouTube API
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### Tenant Detection

The tenant is determined by:
1. `VITE_TENANT` environment variable (highest priority)
2. URL hostname patterns:
   - `dev.` or `.dev.` → `dev` tenant
   - `test.` or `.test.` → `test` tenant
   - `prod.` or `.prod.` or `bellybearsings.web.app` → `prod` tenant
3. Defaults to `dev` tenant

## Usage

### Switching Tenants

To switch between tenants, set the `VITE_TENANT` environment variable:

```bash
# Development tenant
VITE_TENANT=dev

# Test tenant
VITE_TENANT=test

# Production tenant
VITE_TENANT=prod
```

### Development Workflow

1. **Set tenant**: Configure `VITE_TENANT` in your `.env` file
2. **Start application**: Run `pnpm start` or `pnpm dev`
3. **All data operations** will use the specified tenant's data partition
4. **No emulators**: All operations use Firebase Cloud directly

### Data Isolation

- ✅ Each tenant's data is completely isolated
- ✅ Users in `dev` tenant cannot see data from `test` or `prod` tenants
- ✅ Users in `test` tenant cannot see data from `dev` or `prod` tenants
- ✅ Users in `prod` tenant cannot see data from `dev` or `test` tenants
- ✅ Permission system enforces tenant access control

## Firestore Security Rules

The Firestore security rules have been updated to:
- ✅ Enforce tenant-based access control
- ✅ Require authentication for all operations
- ✅ Isolate data by tenant
- ✅ Allow users to access only their tenant's data

## Migration Notes

### Existing Data

If you have existing data in Firestore:
1. Data needs to be migrated to tenant-prefixed collections
2. Use the migration script (to be created) to move data
3. Update user permissions to include tenant access

### User Permissions

- New users automatically get `guest` role for their tenant
- Existing users need permissions updated to include tenant access
- Super admins can have access to all tenants (`tenant: 'all'`)

## Benefits

1. **True Multi-Tenancy**: Complete data isolation between dev, test, and prod
2. **Cloud-First**: All development uses production Firebase services
3. **Simplified Setup**: No emulator configuration needed
4. **Real-World Testing**: Development uses the same infrastructure as production
5. **Cost Effective**: Single Firebase project with tenant-based data partitioning

## Next Steps

1. ✅ Configure Firebase Cloud credentials in `.env`
2. ✅ Set `VITE_TENANT` to your desired tenant
3. ✅ Deploy Firestore security rules: `pnpm deploy:rules`
4. ✅ Test the application with Firebase Cloud
5. ⏳ Create migration script for existing data (if needed)
6. ⏳ Set up user permissions for existing users

## Troubleshooting

### Authentication Issues
- Ensure Firebase Cloud credentials are correctly configured
- Check that `VITE_FIREBASE_PROJECT_ID` matches your Firebase project

### Data Not Showing
- Verify `VITE_TENANT` is set correctly
- Check Firestore console for data under `tenants/{tenant}/` paths
- Ensure user has permissions for the tenant

### Permission Errors
- Check user permissions in `system/userPermissions/{userId}`
- Verify user has access to the current tenant
- Default role is `guest` for new users

---

**Last Updated**: 2024-01-XX  
**Status**: ✅ Complete - All emulator connections removed, multi-tenant architecture implemented

