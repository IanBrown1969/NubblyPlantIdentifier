import React from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';

interface LoginViewProps {
  onLoginWithBiometrics: () => Promise<boolean>;
  onLoginWithGoogle: () => Promise<boolean>;
  isAuthenticating: boolean;
  hasBiometrics: boolean;
  authError: string | null;
  onClearError: () => void;
}

/**
 * Gatekeeper Lock Screen View.
 * Protects the app with biometrics and Google login.
 */
export function LoginView({
  onLoginWithBiometrics,
  onLoginWithGoogle,
  isAuthenticating,
  hasBiometrics,
  authError,
  onClearError,
}: LoginViewProps) {
  const { theme } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Ambient Forest Gradient Backdrops */}
      <View style={[styles.ambientBlob, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]} />

      {/* Main Glass Shield */}
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo-glow.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: theme.text }]}>Nubbly</Text>
          <Text style={[styles.subtitle, { color: theme.primary }]}>Plant Care & AI Identifier</Text>
        </View>

        {isAuthenticating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Securing biometric keys...
            </Text>
          </View>
        ) : (
          <View style={styles.actions}>
            {/* Biometrics Action Card (Face ID / Fingerprint) */}
            {hasBiometrics && (
              <Pressable
                style={({ pressed }) => [
                  styles.biometricBtn,
                  { backgroundColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}
                onPress={onLoginWithBiometrics}
              >
                <SymbolView
                  name={{ ios: 'faceid', android: 'fingerprint' }}
                  size={56}
                  tintColor={theme.primary}
                />
                <Text style={[styles.btnLabel, { color: theme.text }]}>Unlock with Biometrics</Text>
              </Pressable>
            )}

            {/* Google Authentication Button */}
            <Pressable
              style={({ pressed }) => [
                styles.googleBtn,
                { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
                pressed && styles.pressed,
              ]}
              onPress={onLoginWithGoogle}
            >
              <SymbolView name="lock.fill" size={16} tintColor={theme.text} />
              <Text style={[styles.googleLabel, { color: theme.text }]}>Sign In with Google</Text>
            </Pressable>

            {/* Offline Bypass Link */}
            <Pressable
              style={({ pressed }) => [styles.bypassBtn, pressed && styles.pressed]}
              onPress={onLoginWithGoogle} // Triggers simulated immediate bypass auth
            >
              <Text style={[styles.bypassLabel, { color: theme.textSecondary }]}>
                Continue in Developer Bypass Mode
              </Text>
            </Pressable>
          </View>
        )}

        {/* Error Alert Display */}
        {authError && (
          <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Text style={[styles.errorTextText, { color: theme.danger }]}>{authError}</Text>
            <Pressable onPress={onClearError} style={styles.errorClose}>
              <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>
        )}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  ambientBlob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    filter: 'blur(80px)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: Spacing.two,
  },
  actions: {
    width: '100%',
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  loadingContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  biometricBtn: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    elevation: 2,
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  googleBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
  },
  googleLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  bypassBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  bypassLabel: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  errorBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  errorTextText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  errorClose: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
