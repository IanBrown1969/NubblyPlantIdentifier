import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

import { initDatabase } from '../models/Database';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useAuthController } from '../controllers/useAuthController';
import { LoginView } from '../views/screens/LoginView';

// Initialize the SQLite tables synchronously on app load
initDatabase();

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { loading, isAuthenticated, themeMode } = useAuth();
  const authController = useAuthController();

  // If loading SecureStore keys, show a simple spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0e0c' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Gatekeeper: if not authenticated, strictly overlay the frosted lock screen
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginWithBiometrics={authController.onLoginWithBiometrics}
        onLoginWithGoogle={authController.onLoginWithGoogle}
        isAuthenticating={authController.isAuthenticating}
        hasBiometrics={authController.hasBiometrics}
        authError={authController.authError}
        onClearError={authController.onClearError}
      />
    );
  }

  // App is unlocked: render splash and Stack routing shell
  return (
    <ThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="planner" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="wishlist" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="plant/[id]" options={{ presentation: 'card', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
