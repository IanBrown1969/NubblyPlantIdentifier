import * as SecureStore from 'expo-secure-store';

const KEYS = {
  CLAUDE_API_KEY: 'nubbly_claude_api_key',
  BIOMETRICS_ENABLED: 'nubbly_biometrics_enabled',
  IS_SUBSCRIBED: 'nubbly_is_subscribed',
  DEVELOPER_BYPASS: 'nubbly_developer_bypass',
  IS_LOGGED_IN: 'nubbly_is_logged_in',
};

export const AuthModel = {
  /**
   * Retrieves the user-provided Anthropic Claude API Key from the hardware vault.
   */
  async getClaudeApiKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.CLAUDE_API_KEY);
    } catch {
      console.warn('[AuthModel] Failed to read API key from SecureStore:');
      return null;
    }
  },

  /**
   * Encrypts and writes the Claude API key to the secure hardware vault.
   */
  async setClaudeApiKey(key: string): Promise<boolean> {
    try {
      if (!key) {
        await SecureStore.deleteItemAsync(KEYS.CLAUDE_API_KEY);
      } else {
        await SecureStore.setItemAsync(KEYS.CLAUDE_API_KEY, key.trim());
      }
      return true;
    } catch {
      console.error('[AuthModel] Failed to save API key to SecureStore:');
      return false;
    }
  },

  /**
   * Retrieves whether biometric lock is activated on launch.
   */
  async isBiometricsEnabled(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(KEYS.BIOMETRICS_ENABLED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Toggles the biometric authentication requirement state.
   */
  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.BIOMETRICS_ENABLED, enabled ? 'true' : 'false');
    } catch {
      console.error('[AuthModel] Failed to save biometrics setting:');
    }
  },

  /**
   * Retrieves whether the premium subscription package is active.
   */
  async isSubscribed(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(KEYS.IS_SUBSCRIBED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Sets the subscriber status.
   */
  async setSubscribed(subscribed: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.IS_SUBSCRIBED, subscribed ? 'true' : 'false');
    } catch {
      console.error('[AuthModel] Failed to set subscription state:');
    }
  },

  /**
   * Retrieves the developer mode bypass setting override.
   */
  async isDeveloperBypassEnabled(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(KEYS.DEVELOPER_BYPASS);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Toggles the developer mode bypass payload status.
   */
  async setDeveloperBypassEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.DEVELOPER_BYPASS, enabled ? 'true' : 'false');
    } catch {
      console.error('[AuthModel] Failed to set developer bypass state:');
    }
  },

  /**
   * Check if a valid session exists.
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(KEYS.IS_LOGGED_IN);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Updates login session locks.
   */
  async setLoggedIn(loggedIn: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.IS_LOGGED_IN, loggedIn ? 'true' : 'false');
    } catch {
      console.error('[AuthModel] Failed to set login session:');
    }
  }
};
