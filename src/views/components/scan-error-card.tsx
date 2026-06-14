import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { GlassCard } from './glass-card';
import { useAuth } from '../../context/AuthContext';
import { Spacing } from '../../constants/theme';

interface ScanErrorCardProps {
  scanError: string | null;
  onReset: () => void;
}

/**
 * Error panel shown when a scan sequence fails.
 */
export function ScanErrorCard({ scanError, onReset }: ScanErrorCardProps) {
  const { theme } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.panel}>
      <View style={styles.iconBox}>
        <SymbolView name="exclamationmark.triangle.fill" size={48} tintColor={theme.danger} />
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>Scan Sequence Failed</Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          {scanError || 'An error occurred contacting Claude AI. Verify your internet connection or Claude API Key settings.'}
        </Text>

        <View style={[styles.actions, { marginTop: 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, { backgroundColor: theme.danger }, pressed && styles.pressed]}
            onPress={onReset}
          >
            <Text style={[styles.ctaLabel, { color: '#ffffff' }]}>Try Scanning Again</Text>
          </Pressable>

          <Pressable style={styles.resetBtn} onPress={() => router.push('/settings')}>
            <Text style={[styles.resetLabel, { color: theme.textSecondary }]}>Open Key Configurations</Text>
          </Pressable>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.three,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  desc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.two,
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  ctaLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.one,
  },
  resetLabel: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.8,
  },
});
