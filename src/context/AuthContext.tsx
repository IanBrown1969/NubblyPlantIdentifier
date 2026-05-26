import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { AuthModel } from '../models/AuthModel';
import { Colors } from '../constants/theme';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  loading: boolean;
  hasBiometrics: boolean;
  isSubscribed: boolean;
  isDeveloperBypassEnabled: boolean;
  isPremiumAccess: boolean;
  claudeApiKey: string;
  authError: string | null;
  userName: string;
  themeMode: 'light' | 'dark';
  theme: typeof Colors.dark;
  loginWithBiometrics: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateSubscription: (val: boolean) => Promise<void>;
  updateDeveloperBypass: (val: boolean) => Promise<void>;
  updateClaudeApiKey: (key: string) => Promise<void>;
  updateThemeMode: (mode: 'light' | 'dark') => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDeveloperBypassEnabled, setIsDeveloperBypassEnabled] = useState(false);
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName] = useState('Ian B.');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const systemScheme = useColorScheme();

  // Computed active theme object
  const theme = Colors[themeMode];

  // Computed property: premium access is unlocked if subscribed OR bypass is toggled active OR a valid Claude API key is configured
  const isPremiumAccess = isSubscribed || isDeveloperBypassEnabled || (claudeApiKey !== undefined && claudeApiKey.trim() !== '');

  useEffect(() => {
    async function loadAuthSettings() {
      try {
        // 1. Verify Biometric hardware capabilities
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(compatible && enrolled);

        // 2. Load persisted flags from AuthModel secure vault
        const subscribed = await AuthModel.isSubscribed();
        const bypass = await AuthModel.isDeveloperBypassEnabled();
        const apiKey = await AuthModel.getClaudeApiKey() || '';
        const loggedIn = await AuthModel.isLoggedIn();
        
        // 3. Load persisted theme preference
        const storedTheme = await SecureStore.getItemAsync('nubbly_theme_mode');
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeMode(storedTheme);
        } else {
          // Sync with active system default scheme on first launch
          const activeDefault = systemScheme === 'light' ? 'light' : 'dark';
          setThemeMode(activeDefault);
          await SecureStore.setItemAsync('nubbly_theme_mode', activeDefault);
        }

        setIsSubscribed(subscribed);
        setIsDeveloperBypassEnabled(bypass);
        setClaudeApiKey(apiKey);

        // If they had an active session and biometrics isn't strictly enforced on launch, auto-auth
        const enforceBio = await AuthModel.isBiometricsEnabled();
        if (loggedIn && !enforceBio) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load initial settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAuthSettings();
  }, [systemScheme]);

  /**
   * Prompts Face ID / Touch ID hardware authorization modals.
   */
  const loginWithBiometrics = async (): Promise<boolean> => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) {
        throw new Error('Biometric authentication is not configured or supported on this device.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock your Nubbly Garden',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
        await AuthModel.setLoggedIn(true);
        return true;
      } else {
        throw new Error('Biometric authentication failed.');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Authentication error.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Triggers a seamless Google Sign-In capture flow.
   */
  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      // Simulate Google API token exchange loader
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsAuthenticated(true);
      await AuthModel.setLoggedIn(true);
      console.log('[AuthContext] Google Sign-In successful (simulated).');
      return true;
    } catch (e: any) {
      setAuthError(e.message || 'Google login failed.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Terminates active session states.
   */
  const logout = async () => {
    try {
      setIsAuthenticated(false);
      await AuthModel.setLoggedIn(false);
    } catch (e) {
      console.error('[AuthContext] Logout error:', e);
    }
  };

  /**
   * Toggles the subscription state (persisted).
   */
  const updateSubscription = async (val: boolean) => {
    setIsSubscribed(val);
    await AuthModel.setSubscribed(val);
  };

  /**
   * Toggles the Developer Mode Bypass state (persisted).
   */
  const updateDeveloperBypass = async (val: boolean) => {
    setIsDeveloperBypassEnabled(val);
    await AuthModel.setDeveloperBypassEnabled(val);
  };

  /**
   * Updates the securely encrypted Anthropic Claude API Key.
   */
  const updateClaudeApiKey = async (key: string) => {
    setClaudeApiKey(key);
    await AuthModel.setClaudeApiKey(key);
  };

  /**
   * Toggles and persists the visual theme mode override ('light' | 'dark').
   */
  const updateThemeMode = async (mode: 'light' | 'dark') => {
    try {
      setThemeMode(mode);
      await SecureStore.setItemAsync('nubbly_theme_mode', mode);
      console.log(`[AuthContext] Persistent theme changed: ${mode}`);
    } catch (e) {
      console.error('[AuthContext] Failed to persist theme mode:', e);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const value: AuthContextType = {
    isAuthenticated,
    isAuthenticating,
    loading,
    hasBiometrics,
    isSubscribed,
    isDeveloperBypassEnabled,
    isPremiumAccess,
    claudeApiKey,
    authError,
    userName,
    themeMode,
    theme,
    loginWithBiometrics,
    loginWithGoogle,
    logout,
    updateSubscription,
    updateDeveloperBypass,
    updateClaudeApiKey,
    updateThemeMode,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
