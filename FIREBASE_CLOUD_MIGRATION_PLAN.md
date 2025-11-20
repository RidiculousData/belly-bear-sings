# Firebase Cloud Migration & Multi-Environment Access Control Plan

## Executive Summary

This plan outlines the migration from Firebase Emulators to Firebase Cloud with environment-based data isolation (development, test, production) and a role-based permission system for user access control.

## Objectives

1. **Move to Firebase Cloud**: Remove emulator dependency for production, use cloud Firebase services
2. **Environment Separation**: Isolate data by environment (dev/test/prod) within the same Firebase project
3. **User Permission System**: Implement role-based access control with permission levels
4. **Access Control**: Enforce environment and permission-based access through Firestore security rules

## Architecture Overview

### 1. Firebase Project Structure

#### Option A: Single Project with Environment Prefixes (Recommended)
- **One Firebase project** with environment-based collection prefixes
- Collections: `dev_users`, `dev_parties`, `test_users`, `test_parties`, `prod_users`, `prod_parties`
- Benefits: Single project management, easier data migration, shared authentication
- Access control via Firestore rules based on user's environment access

#### Option B: Multiple Firebase Projects
- **Three separate Firebase projects**: `bellybearsings-dev`, `bellybearsings-test`, `bellybearsings-prod`
- Benefits: Complete isolation, independent scaling, separate billing
- Drawbacks: More complex deployment, separate authentication domains

**Recommendation: Option A** (Single project with prefixes) for simplicity and cost-effectiveness.

### 2. Data Structure with Environment Isolation

```
Firestore Collections:
├── environments/
│   ├── dev/
│   │   ├── users/
│   │   ├── parties/
│   │   ├── queueSongs/
│   │   ├── favoriteSongs/
│   │   └── partyGuests/
│   ├── test/
│   │   └── [same structure]
│   └── prod/
│       └── [same structure]
└── system/
    ├── userPermissions/
    └── environmentAccess/
```

### 3. User Permission System

#### Permission Levels (Roles)

1. **Super Admin** (`super_admin`)
   - Full access to all environments
   - Can manage user permissions
   - Can create/manage environments

2. **Admin** (`admin`)
   - Full access to assigned environment(s)
   - Can manage users in assigned environments
   - Can manage parties and data

3. **Host** (`host`)
   - Can create and manage parties in assigned environment
   - Can manage queue in their parties
   - Can invite guests

4. **Guest** (`guest`)
   - Can join parties
   - Can add songs to queue
   - Can boost songs (limited)

5. **Developer** (`developer`)
   - Read/write access to dev environment
   - Read-only access to test/prod for debugging

6. **Tester** (`tester`)
   - Read/write access to test environment
   - Read-only access to prod

#### User Permission Schema

```typescript
interface UserPermission {
  userId: string;
  permissions: {
    environment: 'dev' | 'test' | 'prod' | 'all';
    role: 'super_admin' | 'admin' | 'host' | 'guest' | 'developer' | 'tester';
    grantedAt: Date;
    grantedBy: string;
    expiresAt?: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Plan

### Phase 1: Environment Configuration Setup

#### 1.1 Update Firebase Configuration

**Files to modify:**
- `libs/firebase-config/src/config.ts`
- `libs/firebase-config/src/firebase.ts`
- `env.example`

**Changes:**
- Add `VITE_ENVIRONMENT` variable (dev/test/prod)
- Add environment detection logic
- Update Firebase initialization to use cloud services based on environment
- Keep emulator support for local development only

#### 1.2 Environment Detection

```typescript
// Determine environment from:
// 1. VITE_ENVIRONMENT env variable
// 2. URL hostname (dev.bellybearsings.com, test.bellybearsings.com, etc.)
// 3. Default to 'dev' in local development
```

### Phase 2: User Permission System

#### 2.1 Create Permission Models

**New files:**
- `src/persistence/models/UserPermission.ts`
- `src/persistence/models/EnvironmentAccess.ts`

**Features:**
- CRUD operations for user permissions
- Permission validation helpers
- Environment access checking

#### 2.2 Update User Model

**File: `src/persistence/models/User.ts`**

**Changes:**
- Add `permissions` field to UserData
- Add methods: `hasPermission()`, `canAccessEnvironment()`, `getRole()`
- Add permission checking in business logic

#### 2.3 Permission Service

**New file: `src/services/PermissionService.ts`**

**Features:**
- Check user permissions
- Validate environment access
- Role-based authorization helpers
- Permission management (admin only)

### Phase 3: Update Data Models for Environment Isolation

#### 3.1 Update BaseModel

**File: `src/persistence/BaseModel.ts`**

**Changes:**
- Add environment prefix to collection names
- Add `getEnvironment()` method
- Update collection paths to include environment
- Add environment validation in save operations

**Collection path format:**
```typescript
protected getCollectionPath(): string {
  const env = getCurrentEnvironment(); // 'dev', 'test', or 'prod'
  return `environments/${env}/${this.collectionName}`;
}
```

#### 3.2 Update All Models

**Files to update:**
- `src/persistence/models/Party.ts`
- `src/persistence/models/QueueSong.ts`
- `src/persistence/models/FavoriteSong.ts`
- `src/persistence/models/PartyGuest.ts`
- `src/persistence/models/User.ts`

**Changes:**
- All models automatically use environment-prefixed collections
- No changes needed to business logic

### Phase 4: Firestore Security Rules

#### 4.1 Environment-Based Access Rules

**File: `firebase/firestore.rules`**

**Rules structure:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function getEnvironment() {
      return request.resource.data.environment 
        || resource.data.environment 
        || getEnvFromPath();
    }
    
    function getUserPermissions() {
      return get(/databases/$(database)/documents/system/userPermissions/$(request.auth.uid)).data;
    }
    
    function hasEnvironmentAccess(env) {
      let permissions = getUserPermissions();
      return permissions.environment == env 
        || permissions.environment == 'all'
        || permissions.role == 'super_admin';
    }
    
    function hasRole(requiredRole) {
      let permissions = getUserPermissions();
      return permissions.role == requiredRole 
        || permissions.role == 'super_admin';
    }
    
    // Environment collections
    match /environments/{environment}/{collection}/{document=**} {
      // Users collection
      match /users/{userId} {
        allow read: if request.auth != null 
          && hasEnvironmentAccess(environment)
          && (userId == request.auth.uid || hasRole('admin') || hasRole('super_admin'));
        
        allow write: if request.auth != null 
          && hasEnvironmentAccess(environment)
          && (userId == request.auth.uid || hasRole('admin') || hasRole('super_admin'));
      }
      
      // Parties collection
      match /parties/{partyId} {
        allow read: if request.auth != null && hasEnvironmentAccess(environment);
        allow create: if request.auth != null 
          && hasEnvironmentAccess(environment)
          && (hasRole('host') || hasRole('admin') || hasRole('super_admin'))
          && request.resource.data.hostId == request.auth.uid;
        
        allow update, delete: if request.auth != null 
          && hasEnvironmentAccess(environment)
          && (resource.data.hostId == request.auth.uid 
            || hasRole('admin') 
            || hasRole('super_admin'));
      }
      
      // Queue songs collection
      match /parties/{partyId}/queueSongs/{songId} {
        allow read: if request.auth != null && hasEnvironmentAccess(environment);
        allow create: if request.auth != null 
          && hasEnvironmentAccess(environment)
          && (hasRole('guest') || hasRole('host') || hasRole('admin') || hasRole('super_admin'));
        
        allow update, delete: if request.auth != null 
          && hasEnvironmentAccess(environment)
          && (resource.data.guestId == request.auth.uid 
            || get(/databases/$(database)/documents/environments/$(environment)/parties/$(partyId)).data.hostId == request.auth.uid
            || hasRole('admin') 
            || hasRole('super_admin'));
      }
      
      // Similar rules for other collections...
    }
    
    // System collections (permissions)
    match /system/userPermissions/{userId} {
      allow read: if request.auth != null 
        && (userId == request.auth.uid || hasRole('admin') || hasRole('super_admin'));
      
      allow write: if request.auth != null 
        && (hasRole('admin') || hasRole('super_admin'));
    }
  }
}
```

### Phase 5: Update Application Code

#### 5.1 Update AuthContext

**File: `src/contexts/AuthContext.tsx`**

**Changes:**
- Load user permissions on login
- Store current environment in context
- Add permission checking methods
- Validate environment access on mount

#### 5.2 Update Services

**Files to update:**
- `libs/firebase-config/src/services/firestore.ts`
- All service files that interact with Firestore

**Changes:**
- Update collection paths to include environment
- Add permission checks before operations
- Add environment validation

#### 5.3 Create Admin UI Components

**New files:**
- `src/components/AdminPanel.tsx`
- `src/components/UserPermissionManager.tsx`
- `src/components/EnvironmentSelector.tsx`
- `src/pages/AdminPage.tsx`

**Features:**
- Manage user permissions (admin only)
- Assign roles to users
- Grant/revoke environment access
- View permission audit logs

### Phase 6: Migration Strategy

#### 6.1 Data Migration

**Steps:**
1. Create migration script to move existing data to environment-prefixed collections
2. Back up existing data
3. Run migration for dev environment first
4. Test migration with sample data
5. Migrate test environment
6. Migrate production environment (during maintenance window)

**Migration script:**
- `scripts/migrate-to-environments.cjs`
- Reads from old collections
- Writes to new environment-prefixed collections
- Preserves all data and relationships
- Creates user permissions for existing users

#### 6.2 User Permission Initialization

**Steps:**
1. Create default permissions for existing users
2. Assign 'host' role to users who have created parties
3. Assign 'guest' role to other users
4. Create super admin user manually

### Phase 7: Deployment Configuration

#### 7.1 Environment Variables

**Update `.env.example`:**
```bash
# Environment
VITE_ENVIRONMENT=dev  # dev, test, or prod
VITE_USE_FIREBASE_EMULATORS=false  # true only for local dev

# Firebase Configuration (cloud)
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

#### 7.2 Firebase Hosting Configuration

**Update `firebase/firebase.json`:**
- Configure multiple sites for different environments
- Set up environment-specific hosting targets
- Configure rewrite rules for environment detection

#### 7.3 CI/CD Pipeline

**GitHub Actions workflow:**
- Deploy to dev on merge to `develop` branch
- Deploy to test on merge to `test` branch
- Deploy to prod on merge to `main` branch
- Run tests before deployment
- Deploy Firestore rules and indexes

## Security Considerations

### 1. Permission Validation
- Always validate permissions server-side (Firestore rules)
- Never trust client-side permission checks alone
- Use Firestore rules for all data access control

### 2. Environment Isolation
- Users can only access their assigned environment(s)
- No cross-environment data access
- Environment is validated in Firestore rules

### 3. Role-Based Access Control
- Roles are stored in Firestore (system/userPermissions)
- Roles are validated in security rules
- Only admins can modify permissions

### 4. Audit Logging
- Log all permission changes
- Log environment access attempts
- Log failed authorization attempts

## Testing Strategy

### 1. Unit Tests
- Test permission checking functions
- Test environment detection
- Test role validation

### 2. Integration Tests
- Test Firestore rules with different user roles
- Test environment isolation
- Test permission management

### 3. E2E Tests
- Test user workflows with different roles
- Test environment switching
- Test permission enforcement

## Rollout Plan

### Week 1: Setup & Configuration
- Set up environment configuration
- Create permission models and services
- Update Firebase configuration

### Week 2: Data Models & Security Rules
- Update BaseModel for environment isolation
- Update all data models
- Implement Firestore security rules
- Test security rules

### Week 3: Application Updates
- Update AuthContext
- Update all services
- Create admin UI components
- Update existing components

### Week 4: Migration & Testing
- Create migration scripts
- Test migration with dev data
- Migrate dev environment
- Test thoroughly

### Week 5: Production Rollout
- Migrate test environment
- Final testing
- Migrate production environment
- Monitor and fix issues

## Monitoring & Maintenance

### 1. Monitoring
- Monitor Firestore rule evaluation failures
- Monitor permission check performance
- Monitor environment access patterns
- Set up alerts for security issues

### 2. Maintenance
- Regular permission audits
- Clean up expired permissions
- Update roles as needed
- Document permission changes

## Success Criteria

1. ✅ All data is isolated by environment
2. ✅ Users can only access their assigned environment(s)
3. ✅ Permission system is fully functional
4. ✅ Firestore rules enforce all access control
5. ✅ Migration completed without data loss
6. ✅ Admin UI for permission management works
7. ✅ All tests pass
8. ✅ Production deployment successful

## Risks & Mitigation

### Risk 1: Data Migration Issues
- **Mitigation**: Thorough testing, backups, rollback plan

### Risk 2: Security Rule Complexity
- **Mitigation**: Extensive testing, code review, gradual rollout

### Risk 3: Performance Impact
- **Mitigation**: Optimize Firestore rules, use indexes, monitor performance

### Risk 4: User Permission Errors
- **Mitigation**: Clear error messages, admin support, audit logs

## Next Steps

1. Review and approve this plan
2. Set up Firebase project structure
3. Begin Phase 1 implementation
4. Schedule migration windows
5. Create detailed task breakdown

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-XX  
**Author**: Development Team

