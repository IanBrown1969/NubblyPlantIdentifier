import React from 'react';
import { useAuthController } from '../controllers/useAuthController';
import { useAuth } from '../context/AuthContext';
import { SettingsView } from '../views/screens/SettingsView';

/**
 * Settings Tab Routing Entry.
 * Glues useAuthController parameters to the presentational SettingsView.
 */
export default function SettingsRoute() {
  const controller = useAuthController();
  const { userName, themeMode, updateThemeMode } = useAuth();

  return (
    <SettingsView
      claudeApiKey={controller.claudeApiKey}
      isSubscribed={controller.isSubscribed}
      isDeveloperBypassEnabled={controller.isDeveloperBypassEnabled}
      isPremiumAccess={controller.isPremiumAccess}
      hasBiometrics={controller.hasBiometrics}
      onSaveClaudeApiKey={controller.onSaveClaudeApiKey}
      onToggleSubscription={controller.onToggleSubscription}
      onToggleDeveloperBypass={controller.onToggleDeveloperBypass}
      onLogout={controller.onLogout}
      userName={userName}
      themeMode={themeMode}
      onToggleThemeMode={updateThemeMode}
    />
  );
}
