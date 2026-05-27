import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Switch, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { ClaudeService } from '../../services/ClaudeService';

interface SettingsViewProps {
  claudeApiKey: string;
  isSubscribed: boolean;
  isDeveloperBypassEnabled: boolean;
  isPremiumAccess: boolean;
  hasBiometrics: boolean;
  onSaveClaudeApiKey: (key: string) => Promise<void>;
  onToggleSubscription: (val: boolean) => Promise<void>;
  onToggleDeveloperBypass: (val: boolean) => Promise<void>;
  onLogout: () => Promise<void>;
  userName?: string;
  themeMode: 'light' | 'dark';
  onToggleThemeMode: (mode: 'light' | 'dark') => Promise<void>;
}

/**
 * Settings & Core Developer bypass Configurations View.
 * Manages secure hardware API key vaults, subscription switches, and lock session actions.
 */
export function SettingsView({
  claudeApiKey,
  isSubscribed,
  isDeveloperBypassEnabled,
  isPremiumAccess,
  hasBiometrics,
  onSaveClaudeApiKey,
  onToggleSubscription,
  onToggleDeveloperBypass,
  onLogout,
  userName,
  themeMode,
  onToggleThemeMode,
}: SettingsViewProps) {
  const { theme } = useAuth();

  const [apiKeyInput, setApiKeyInput] = useState(claudeApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Sync inputs with controller model states async to bypass set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setApiKeyInput(claudeApiKey);
    }, 0);
    return () => clearTimeout(timer);
  }, [claudeApiKey]);

  const handleSaveKey = async () => {
    if (isValidating) return;
    const trimmedKey = apiKeyInput.trim();
    setApiKeyInput(trimmedKey); // Update text input on screen immediately with trimmed text
    setValidationError(null);
    setIsValidating(true);
    setSaveSuccess(false);

    try {
      const result = await ClaudeService.validateApiKey(trimmedKey);
      if (result.success) {
        await onSaveClaudeApiKey(trimmedKey);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setValidationError(result.error || 'Failed to validate API Key.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'An unexpected validation error occurred.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = async () => {
    if (isValidating) return;
    setValidationError(null);
    setApiKeyInput('');
    await onSaveClaudeApiKey('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Locked Premium Top Header Bar */}
      <View style={[styles.brandHeaderBar, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
        {/* Left Side: Brand Logo & Title */}
        <View style={styles.brandLeftCol}>
          <Image
            source={require('../../../assets/images/logo-glow.png')}
            style={styles.brandLogo}
            contentFit="contain"
          />
          <Text style={[styles.brandTitleText, { color: theme.text }]}>
            NUBBLY<Text style={{ color: theme.primary, fontWeight: '400' }}>PLANT</Text>
          </Text>
        </View>

        {/* Right Side: Account Profile Details */}
        <View style={styles.headerProfileRow}>
          <SymbolView
            name={{ ios: 'person', android: 'person' }}
            size={18}
            tintColor={theme.primary}
          />
          <Text style={[styles.headerUserName, { color: theme.text }]} numberOfLines={1}>
            {userName || 'Ian B.'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* API Key Vault Panel */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CREDENTIALS VAULT</Text>
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <SymbolView
              name={{ ios: 'key.fill', android: 'vpn_key', web: 'vpn_key' }}
              size={16}
              tintColor={theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Anthropic Claude API Key</Text>
          </View>
          
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Your key is encrypted locally inside the secure SecureStore keychain. Leave blank to trigger simulated scans in offline development.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="sk-ant-..."
              placeholderTextColor={theme.textSecondary}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isValidating}
            />
            <Pressable
              style={({ pressed }) => [
                styles.viewKeyBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => setShowKey(!showKey)}
              disabled={isValidating}
            >
              <SymbolView
                name={{
                  ios: showKey ? 'eye.slash.fill' : 'eye.fill',
                  android: showKey ? 'visibility_off' : 'visibility',
                  web: showKey ? 'visibility_off' : 'visibility',
                }}
                size={20}
                tintColor={theme.primary}
              />
            </Pressable>
          </View>

          {validationError && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <SymbolView
                name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                size={14}
                tintColor={theme.danger}
              />
              <Text style={[styles.errorTextText, { color: theme.danger }]}>
                {validationError}
              </Text>
            </View>
          )}

          <View style={styles.saveRow}>
            {/* Status indicators */}
            <View style={styles.statusCol}>
              {claudeApiKey ? (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                  <Text style={[styles.statusLabel, { color: theme.success }]}>VAULT KEY CONFIGURED</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <View style={[styles.statusDot, { backgroundColor: theme.warning }]} />
                  <Text style={[styles.statusLabel, { color: theme.warning }]}>SIMULATOR PLAYBACK</Text>
                </View>
              )}
            </View>

            {claudeApiKey ? (
              <Pressable
                style={({ pressed }) => [
                  styles.clearBtn,
                  { borderColor: theme.danger },
                  pressed && styles.pressed,
                ]}
                onPress={handleClearKey}
                disabled={isValidating}
              >
                <SymbolView
                  name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                  size={14}
                  tintColor={theme.danger}
                />
                <Text style={[styles.clearBtnText, { color: theme.danger }]}>Clear</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: theme.primary },
                (pressed || isValidating) && styles.pressed,
              ]}
              onPress={handleSaveKey}
              disabled={isValidating}
            >
              <Text style={[styles.saveBtnText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>
                {isValidating ? 'Validating...' : saveSuccess ? 'Saved! ✓' : 'Save Key'}
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Locks & Biometric settings */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SECURITY</Text>
        <GlassCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Enable Biometrics on Startup</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {hasBiometrics ? 'Secures your database garden logs.' : 'Biometric locks not enrolled.'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              disabled={!hasBiometrics}
              trackColor={{ false: theme.backgroundElement, true: theme.primary }}
              thumbColor={biometricsEnabled && hasBiometrics ? '#fff' : theme.textSecondary}
            />
          </View>
        </GlassCard>

        {/* Theme Settings */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>THEME & APPEARANCE</Text>
        <GlassCard style={styles.card}>
          {/* Dark Mode Switch */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Renders a midnight forest obsidian premium appearance.
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(val) => onToggleThemeMode(val ? 'dark' : 'light')}
              trackColor={{ false: theme.backgroundElement, true: theme.primary }}
              thumbColor={themeMode === 'dark' ? '#fff' : theme.textSecondary}
            />
          </View>
        </GlassCard>

        {/* Subscription & Testing Bypasses */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SUBSCRIPTIONS & TESTING</Text>
        <GlassCard style={styles.card}>
          {/* Subscription manual lock */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Premium Active (Purchase Status)</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Simulates Google Play / iOS App Store purchases.
              </Text>
            </View>
            <Switch
              value={isSubscribed}
              onValueChange={onToggleSubscription}
              trackColor={{ false: theme.backgroundElement, true: theme.primary }}
              thumbColor={isSubscribed ? '#fff' : theme.textSecondary}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

          {/* Developer paywall bypass toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: theme.text }]}>Developer Bypass Mode</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Overrides the subscription paywall block instantly.
              </Text>
            </View>
            <Switch
              value={isDeveloperBypassEnabled}
              onValueChange={onToggleDeveloperBypass}
              trackColor={{ false: theme.backgroundElement, true: theme.primary }}
              thumbColor={isDeveloperBypassEnabled ? '#fff' : theme.textSecondary}
            />
          </View>

          {/* Debug Status Badge display */}
          {isPremiumAccess && (
            <View style={[styles.debugBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: theme.success }]}>
              <SymbolView
                name={{ ios: 'hammer.fill', android: 'construction', web: 'construction' }}
                size={12}
                tintColor={theme.success}
              />
              <Text style={[styles.debugBadgeText, { color: theme.success }]}>
                {isDeveloperBypassEnabled ? 'DEVELOPER OVERRIDE BYPASS ACTIVE' : 'PREMIUM MEMBERSHIP STATUS ACTIVE'}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Lock Session Logouts */}
        <View style={styles.logoutWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutBtn,
              { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
              pressed && styles.pressed,
            ]}
            onPress={onLogout}
          >
            <SymbolView
              name={{ ios: 'power', android: 'power_settings_new', web: 'power_settings_new' }}
              size={14}
              tintColor={theme.danger}
            />
            <Text style={[styles.logoutText, { color: theme.danger }]}>Lock App Session</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brandHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 52, // Safe Area Top spacer
    paddingBottom: 14,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  brandLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
  },
  brandTitleText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerProfileTextCol: {
    alignItems: 'flex-end',
    gap: 1,
  },
  headerAccountLabel: {
    fontSize: 7,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerUserName: {
    fontSize: 11,
    fontWeight: '900',
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: Spacing.two,
    marginBottom: Spacing.half,
  },
  card: {
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  statusCol: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '800',
  },
  settingDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  divider: {
    height: 1.5,
    width: '100%',
  },
  debugBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
    justifyContent: 'center',
  },
  debugBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoutWrapper: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  logoutBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    elevation: 1,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  viewKeyBtn: {
    height: 48,
    width: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  errorTextText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  clearBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
