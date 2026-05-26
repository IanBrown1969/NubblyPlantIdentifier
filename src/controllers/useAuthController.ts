import { useAuth } from '../context/AuthContext';

/**
 * Controller hook for managing user authentication, secure keys, subscriptions,
 * and developer bypass triggers, separating business logic from view screens.
 */
export function useAuthController() {
  const auth = useAuth();

  return {
    // Model States
    isAuthenticated: auth.isAuthenticated,
    isAuthenticating: auth.isAuthenticating,
    loading: auth.loading,
    hasBiometrics: auth.hasBiometrics,
    isSubscribed: auth.isSubscribed,
    isDeveloperBypassEnabled: auth.isDeveloperBypassEnabled,
    isPremiumAccess: auth.isPremiumAccess,
    claudeApiKey: auth.claudeApiKey,
    authError: auth.authError,

    // Controller Action Handlers
    onLoginWithBiometrics: async (): Promise<boolean> => {
      console.log('[AuthController] Handled request: Biometrics Login Trigger');
      return await auth.loginWithBiometrics();
    },

    onLoginWithGoogle: async (): Promise<boolean> => {
      console.log('[AuthController] Handled request: Google Sign-In Trigger');
      return await auth.loginWithGoogle();
    },

    onLogout: async (): Promise<void> => {
      console.log('[AuthController] Handled request: User Logout');
      await auth.logout();
    },

    onToggleSubscription: async (active: boolean): Promise<void> => {
      console.log(`[AuthController] Handled request: Toggle Subscription status to ${active}`);
      await auth.updateSubscription(active);
    },

    onToggleDeveloperBypass: async (active: boolean): Promise<void> => {
      console.log(`[AuthController] Handled request: Toggle Developer Bypass status to ${active}`);
      await auth.updateDeveloperBypass(active);
    },

    onSaveClaudeApiKey: async (key: string): Promise<void> => {
      console.log('[AuthController] Handled request: Save encrypted Claude API Key');
      await auth.updateClaudeApiKey(key);
    },

    onClearError: (): void => {
      auth.clearAuthError();
    }
  };
}
export type AuthControllerType = ReturnType<typeof useAuthController>;
