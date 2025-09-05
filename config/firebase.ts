import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBCPaeh356K49om21lB_lCdW22AstnHi2w",
  authDomain: "p-28-ce413.firebaseapp.com",
  projectId: "p-28-ce413",
  storageBucket: "p-28-ce413.appspot.com",
  messagingSenderId: "78057476252",
  appId: "1:78057476252:web:YOUR_WEB_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);



// Authentication functions
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};



// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// User profile management
export interface UserProfile {
  firstName: string;
  lastName: string;
  country: string;
  birthdate: string;
  email: string;
  createdAt: Date;
}

export const createUserProfile = async (userId: string, profile: Omit<UserProfile, 'createdAt'>): Promise<void> => {
  await setDoc(doc(db, 'users', userId), {
    ...profile,
    createdAt: new Date(),
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

// Instructions to set up Firebase:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Add your app (iOS/Android/Web)
// 4. Download google-services.json (Android) and GoogleService-Info.plist (iOS)
// 5. Place them in android/app/ and ios/ directories respectively
// 6. Enable Authentication in Firebase console
// 7. Enable Email/Password and Google sign-in methods
// 8. Get your Web Client ID from Google Cloud Console
// 9. Update the configuration values above
