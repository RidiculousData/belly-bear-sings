import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService, db } from '@bellybearsings/firebase-config';
import { User as AppUser } from '@bellybearsings/shared';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
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

// Helper function to convert string to title case
const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const profile: AppUser = {
              userId: firebaseUser.uid,
              displayName: data.displayName || firebaseUser.displayName || 'Unknown User',
              email: data.email || firebaseUser.email || undefined,
              photoURL: data.photoURL || firebaseUser.photoURL || undefined,
              firstName: data.firstName,
              lastName: data.lastName,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
            setUserProfile(profile);
          } else {
            // Create a user document in Firestore and a basic profile
            // Use the email prefix as firstName but in title case
            const emailPrefix = firebaseUser.email?.split('@')[0] || 'Unknown';
            const firstName = toTitleCase(emailPrefix);
            
            const profile: AppUser = {
              userId: firebaseUser.uid,
              displayName: firstName,
              email: firebaseUser.email || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              firstName: firstName,
              createdAt: new Date(),
            };
            
            // Create the user document in Firestore (filter out undefined values)
            const userDocData: any = {
              userId: firebaseUser.uid,
              displayName: profile.displayName,
              firstName: profile.firstName,
              createdAt: profile.createdAt,
            };
            
            // Only add fields that are not undefined
            if (profile.email) {
              userDocData.email = profile.email;
            }
            if (profile.photoURL) {
              userDocData.photoURL = profile.photoURL;
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
            
            setUserProfile(profile);
          }
        } catch (error) {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      await authService.createAccount(email, password, displayName);
      const user = authService.getCurrentUser();
      if (user) {
        // Create user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          displayName: displayName,
          email: user.email,
          firstName: displayName.split(' ')[0], // Use first word of displayName as firstName
          lastName: displayName.split(' ').slice(1).join(' '), // Use remaining words as lastName
          createdAt: new Date(),
        });
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

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOutUser();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithProvider: signInWithProviderHandler,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 