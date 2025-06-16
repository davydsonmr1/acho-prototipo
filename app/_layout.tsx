import { useEffect } from 'react';
import { Stack, router, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkStatus from '@/components/NetworkStatus';
import { analytics } from '@/utils/analytics';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to auth if user is not authenticated and not in auth group
      analytics.trackScreenView('auth_redirect');
      router.replace('/auth');
    } else if (user && inAuthGroup) {
      // Redirect to tabs if user is authenticated and in auth group
      analytics.trackScreenView('home_redirect');
      router.replace('/(tabs)');
    }

    // Hide splash screen once authentication state is determined
    SplashScreen.hideAsync();
  }, [user, loading, segments]);

  // Track screen changes
  useEffect(() => {
    if (segments.length > 0) {
      const screenName = segments.join('/');
      analytics.trackScreenView(screenName);
    }
  }, [segments]);

  // Keep splash screen visible while loading
  if (loading) {
    return null;
  }

  return (
    <>
      <NetworkStatus />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="store/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
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