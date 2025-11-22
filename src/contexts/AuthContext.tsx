import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService, db, getEnvironment } from '@bellybearsings/firebase-config';
import { User as AppUser, UserRole, Tenant } from '@bellybearsings/shared';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PermissionService } from '../services/PermissionService';

interface AuthContextType {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  userRole: UserRole | null;
  userRoles: UserRole[];
  tenant: Tenant;
  environment: Tenant; // Alias for backward compatibility
  isAnonymous: boolean;
  hasPermission: (role: UserRole) => boolean;
  hasAnyPermission: (roles: UserRole[]) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const tenant = getEnvironment();
  const environment = tenant; // Alias for backward compatibility

  // Load user permissions
  const loadUserPermissions = async (userId: string) => {
    try {
      // First, check if permissions exist
      const permissions = await PermissionService.getUserPermissions(userId);

      // If permissions don't exist, try to create them
      if (!permissions) {
        console.log(`Permissions document not found for user ${userId}. Creating default permissions...`);
        try {
          await PermissionService.initializeDefaultPermissions(userId, 'system');
          console.log('Default permissions created successfully');
        } catch (createError: any) {
          // If creation fails, log but continue with guest role
          console.warn('Failed to create default permissions:', createError?.message || createError);
          // Set guest role and continue
          setUserRole('guest');
          setUserRoles(['guest']);
          return;
        }
      }

      // Load permissions (they should exist now)
      const primaryRole = await PermissionService.getPrimaryRole(userId);
      const roles = await PermissionService.getUserRoles(userId);
      setUserRole(primaryRole);
      setUserRoles(roles);

      // Check tenant access (but don't block if check fails)
      try {
        const hasAccess = await PermissionService.hasEnvironmentAccess(userId, tenant);
        if (!hasAccess) {
          console.warn(`User ${userId} does not have access to tenant: ${tenant}. Attempting to grant access...`);
          // Try to add tenant access if user doesn't have it
          try {
            await PermissionService.grantPermission(userId, tenant, 'guest', 'system');
            console.log(`Granted ${tenant} access to user ${userId}`);
            // Reload permissions after granting access
            const updatedPrimaryRole = await PermissionService.getPrimaryRole(userId);
            const updatedRoles = await PermissionService.getUserRoles(userId);
            setUserRole(updatedPrimaryRole);
            setUserRoles(updatedRoles);
          } catch (grantError: any) {
            console.warn('Failed to grant tenant access:', grantError?.message || grantError);
          }
        }
      } catch (accessError) {
        // Silently handle access check errors - default permissions will be used
        console.debug('Could not check tenant access, using default permissions:', accessError);
      }
    } catch (error: any) {
      // Handle permission errors gracefully - default to guest role
      if (error?.code === 'permission-denied') {
        console.warn('Permission denied when loading user permissions. Using default guest role.');
      } else {
        console.error('Error loading user permissions:', error);
      }
      // Default to guest role if permissions can't be loaded
      setUserRole('guest');
      setUserRoles(['guest']);
    }
  };

  useEffect(() => {

    const unsubscribe = authService.subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Check if user is anonymous
        const userIsAnonymous = firebaseUser.isAnonymous;
        setIsAnonymous(userIsAnonymous);

        // For anonymous users, create a minimal profile and skip permissions
        if (userIsAnonymous) {
          const displayName = firebaseUser.displayName || 'Guest';
          setUserProfile({
            userId: firebaseUser.uid,
            displayName: displayName,
            email: undefined, // Anonymous users don't have email
            photoURL: undefined,
            firstName: displayName,
            lastName: '',
            createdAt: new Date(),
          });
          // Anonymous users get guest role by default
          setUserRole('guest');
          setUserRoles(['guest']);
          setLoading(false);
          return;
        }
        // Wait a bit for auth token to propagate to Firestore security rules
        // This helps avoid permission-denied errors immediately after sign-in
        await new Promise(resolve => setTimeout(resolve, 100));

        // Ensure we have a fresh auth token
        try {
          await firebaseUser.getIdToken(true);
        } catch (tokenError) {
          console.warn('Error refreshing auth token:', tokenError);
        }

        // Get tenant-specific user collection path (multi-tenancy)
        const userCollectionPath = `tenants/${tenant}/users`;
        const userDocRef = doc(db, userCollectionPath, firebaseUser.uid);

        let userDoc;

        // Try to read the user document
        try {
          userDoc = await getDoc(userDocRef);
        } catch (error: any) {
          // If permission denied, we'll try to create the document anyway
          // Sometimes create works even if read doesn't due to rule differences or timing
          if (error?.code !== 'permission-denied') {
            throw error;
          }
          // If permission denied, userDoc will be undefined and we'll try to create
        }

        // Helper function to create user document
        const createUserDocument = async (): Promise<AppUser> => {
          const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown';

          // Handle firstName extraction
          let firstName = displayName;
          let lastName = '';

          if (displayName.includes(' ')) {
            const nameParts = displayName.split(' ');
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          }

          const profile: AppUser = {
            userId: firebaseUser.uid,
            displayName: displayName,
            email: firebaseUser.email || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            firstName: firstName,
            lastName: lastName,
            createdAt: new Date(),
          };

          // Create the user document in Firestore (filter out undefined values)
          const userDocData: any = {
            userId: firebaseUser.uid,
            displayName: profile.displayName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            createdAt: new Date(),
          };

          // Only add fields that are not undefined
          if (profile.email) {
            userDocData.email = profile.email;
          }
          if (profile.photoURL) {
            userDocData.photoURL = profile.photoURL;
          }

          try {
            await setDoc(userDocRef, userDocData);
            console.log('User document created successfully');

            // Initialize default permissions for new user
            try {
              await PermissionService.initializeDefaultPermissions(firebaseUser.uid, 'system');
              console.log('Default permissions initialized successfully');
            } catch (permError: any) {
              // Log but don't fail - permissions might be set up later or via Cloud Function
              console.warn('Error initializing default permissions (non-fatal):', permError?.message || permError);
            }
          } catch (createError: any) {
            // If create also fails with permission-denied, wait and retry once
            if (createError?.code === 'permission-denied') {
              console.warn('Permission denied when creating user document. Waiting and retrying...');
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Refresh auth token before retry
              try {
                await firebaseUser.getIdToken(true);
              } catch (tokenError) {
                console.warn('Error refreshing auth token before retry:', tokenError);
              }

              try {
                await setDoc(userDocRef, userDocData);
                console.log('User document created successfully on retry');

                // Initialize default permissions for new user
                try {
                  await PermissionService.initializeDefaultPermissions(firebaseUser.uid, 'system');
                  console.log('Default permissions initialized successfully');
                } catch (permError: any) {
                  // Log but don't fail - permissions might be set up later
                  console.warn('Error initializing default permissions (non-fatal):', permError?.message || permError);
                }
              } catch (retryError: any) {
                console.error('Error creating user document after retry:', retryError);
                // Still set the profile from Firebase Auth so user can continue
                // The user document might be created by a Cloud Function or admin later
              }
            } else {
              throw createError;
            }
          }

          return profile;
        };

        try {
          if (userDoc && userDoc.exists()) {
            // User document exists, load it
            const data = userDoc.data();
            const displayName = data.displayName || firebaseUser.displayName || 'Unknown User';

            // Handle firstName extraction - if no firstName in data, extract from displayName
            let firstName = data.firstName;
            let lastName = data.lastName;

            if (!firstName) {
              if (displayName.includes(' ')) {
                const nameParts = displayName.split(' ');
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(' ');
              } else {
                firstName = displayName;
                lastName = '';
              }
            }

            const profile: AppUser = {
              userId: firebaseUser.uid,
              displayName: displayName,
              email: data.email || firebaseUser.email || undefined,
              photoURL: data.photoURL || firebaseUser.photoURL || undefined,
              firstName: firstName,
              lastName: lastName,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
            setUserProfile(profile);
          } else {
            // User document doesn't exist or we got permission-denied on read
            // Try to create it
            const profile = await createUserDocument();
            setUserProfile(profile);
          }

          // Load user permissions (this may fail for new users, which is OK)
          await loadUserPermissions(firebaseUser.uid);
        } catch (error: any) {
          console.error('Error in user data flow:', error);

          // Even if everything fails, set a basic profile from Firebase Auth
          // so the user can continue using the app
          const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown';
          setUserProfile({
            userId: firebaseUser.uid,
            displayName: displayName,
            email: firebaseUser.email || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            firstName: displayName.split(' ')[0],
            lastName: displayName.split(' ').slice(1).join(' '),
            createdAt: new Date(),
          });

          // Default to guest role on any error
          setUserRole('guest');
          setUserRoles(['guest']);
        }
      } else {
        setUserProfile(null);
        setUserRole(null);
        setUserRoles([]);
        setIsAnonymous(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [environment]);

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      await authService.createAccount(email, password, displayName);
      const user = authService.getCurrentUser();
      if (user) {
        // Get tenant-specific user collection path (multi-tenancy)
        const userCollectionPath = `tenants/${tenant}/users`;

        // Create user document in Firestore
        const userDocRef = doc(db, userCollectionPath, user.uid);
        await setDoc(userDocRef, {
          displayName: displayName,
          email: user.email,
          firstName: displayName.split(' ')[0], // Use first word of displayName as firstName
          lastName: displayName.split(' ').slice(1).join(' '), // Use remaining words as lastName
          createdAt: new Date(),
        });

        // Initialize default permissions for new user
        try {
          await PermissionService.initializeDefaultPermissions(user.uid, 'system');
        } catch (permError) {
          console.error('Error initializing default permissions:', permError);
        }
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signInWithEmail(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithProviderHandler = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    try {
      await authService.signInWithProvider(provider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInAnonymouslyHandler = async () => {
    setLoading(true);
    try {
      await authService.signInAnonymous();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOutUser();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const hasPermission = (role: UserRole): boolean => {
    if (!userRole) return false;
    if (userRole === 'super_admin') return true;
    return userRoles.includes(role);
  };

  const hasAnyPermission = (roles: UserRole[]): boolean => {
    return roles.some(role => hasPermission(role));
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    userRole,
    userRoles,
    tenant,
    environment, // Alias for backward compatibility
    isAnonymous,
    hasPermission,
    hasAnyPermission,
    signIn,
    signUp,
    signInWithProvider: signInWithProviderHandler,
    signInAnonymously: signInAnonymouslyHandler,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 