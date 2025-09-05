import { create } from 'zustand';
import { onAuthStateChanged, getUserProfile, signOut } from '../config/firebase';

export interface UserProfile {
  firstName: string;
  lastName: string;
  country: string;
  birthdate: string;
}

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  profile: UserProfile | null;
}

interface UserState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initializeAuth: () => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL,
            profile: userProfile,
          };
          
          set({ user: userData, loading: false, initialized: true });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to basic user data
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL,
            profile: null,
          };
          
          set({ user: userData, loading: false, initialized: true });
        }
      } else {
        // User is signed out
        set({ user: null, loading: false, initialized: true });
      }
    });

    // Return unsubscribe function for cleanup
    return unsubscribe;
  },
  
  logout: async () => {
    try {
      await signOut();
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
}));
