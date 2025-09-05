import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../stores/userStore';

export default function RootLayout() {
  const { user, loading, initialized, initializeAuth } = useUserStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = initializeAuth();
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to auth
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is signed in and in auth group, redirect to home
      router.replace('/(tabs)/home');
    }
  }, [user, segments, initialized]);

  if (loading || !initialized) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="screens" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
