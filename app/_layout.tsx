import { useEffect, useState } from 'react';
import { Stack, router, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkStatus from '@/components/NetworkStatus';
import { analytics } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotifications, setupNotificationListeners } from '@/services/notificationService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@acho:onboarding_completed').then((value) => {
      setOnboardingDone(value === 'true');
    });
  }, []);

  useEffect(() => {
    if (loading || onboardingDone === null) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingDone && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingDone && !user && !inAuthGroup && !inOnboarding) {
      analytics.trackScreenView('auth_redirect');
      router.replace('/auth');
    } else if (user && (inAuthGroup || inOnboarding)) {
      analytics.trackScreenView('home_redirect');
      router.replace('/(tabs)');
    }

    SplashScreen.hideAsync();
  }, [user, loading, segments, onboardingDone]);

  // Track screen changes
  useEffect(() => {
    if (segments.length > 0) {
      const screenName = segments.join('/');
      analytics.trackScreenView(screenName);
    }
  }, [segments]);

  // Register push notifications when user is authenticated
  useEffect(() => {
    if (!user) return;
    registerForPushNotifications();
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, [user]);

  // Keep splash screen visible while loading
  if (loading || onboardingDone === null) {
    return null;
  }

  return (
    <>
      <NetworkStatus />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="store/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="store-owner" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <RootLayoutNav />
            <StatusBar style="auto" />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}