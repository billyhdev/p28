import React from 'react';
import { useRouter } from 'expo-router';
import SignUpScreen from '../../components/SignUpScreen';
import { useUserStore } from '../../stores/userStore';

export default function SignUp() {
  const router = useRouter();
  const { setUser } = useUserStore();

  const handleSignUpSuccess = (userData: any) => {
    // Update the user store with the signed-up user data
    setUser(userData);
    // Navigation will be handled automatically by the root layout
  };

  const handleBackToLogin = () => {
    // Navigate back to login screen
    router.push('/(auth)/login');
  };

  return (
    <SignUpScreen 
      onSignUpSuccess={handleSignUpSuccess} 
      onBackToLogin={handleBackToLogin} 
    />
  );
}
