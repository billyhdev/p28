import React from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '../../components/LoginScreen';
import { useUserStore } from '../../stores/userStore';

export default function Login() {
  const router = useRouter();
  const { setUser } = useUserStore();

  const handleLoginSuccess = (userData: any) => {
    // Update the user store with the logged-in user data
    setUser(userData);
    // Navigation will be handled automatically by the root layout
  };

  const handleNavigateToSignUp = () => {
    // Navigate to signup screen
    router.push('/(auth)/signup');
  };

  return (
    <LoginScreen 
      onLoginSuccess={handleLoginSuccess} 
      onNavigateToSignUp={handleNavigateToSignUp} 
    />
  );
}
