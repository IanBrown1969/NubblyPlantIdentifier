import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';

interface PaywallViewProps {
  onUnlockSubscription: () => void;
  onDismiss: () => void;
}

interface TierPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  isPopular?: boolean;
}

const TIER_PLANS: TierPlan[] = [
  { id: 'weekly', name: 'Weekly Bud', price: '$1.99', period: 'week' },
  { id: 'monthly', name: 'Monthly Bloom', price: '$5.99', period: 'month', isPopular: true, badge: 'BEST VALUE' },
  { id: 'annual', name: 'Annual Oak', price: '$29.99', period: 'year', badge: 'SAVE 60%' },
];

/**
 * Premium Subscription Paywall Screen.
 * Renders plan tiers and details features locked behind subscription keys.
 */
export function PaywallView({ onUnlockSubscription, onDismiss }: PaywallViewProps) {
  const { theme } = useAuth();
  const [selectedTier, setSelectedTier] = useState('monthly');

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dynamic Ambient Glowing Blobs */}
      <View style={[styles.glowBlob, { backgroundColor: theme.primary, opacity: 0.15 }]} />

      <GlassCard style={styles.paywallCard}>
        {/* Dismiss Button */}
        <Pressable onPress={onDismiss} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.crownBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <SymbolView name="crown.fill" size={14} tintColor="#F59E0B" />
            <Text style={styles.badgeText}>PREMIUM ACCESS</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Unlock Nubbly Premium</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Experience unlimited AI botanical care diagnostics
          </Text>
        </View>

        {/* Premium Benefits List */}
        <View style={styles.benefits}>
          <View style={styles.benefitRow}>
            <SymbolView name="checkmark.circle.fill" size={18} tintColor={theme.success} />
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>Unlimited AI Photo Scans</Text>
              <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>
                Identify any indoor or wild plant in seconds using Claude 3.5.
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <SymbolView name="checkmark.circle.fill" size={18} tintColor={theme.success} />
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>Expert Care & Troubleshooting Clinic</Text>
              <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>
                Diagnose symptoms, yellow leaves, pests, and get custom solutions.
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <SymbolView name="checkmark.circle.fill" size={18} tintColor={theme.success} />
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>GPS Discovery Mapping</Text>
              <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>
                Pin and track geocoded discovery locations on your library cards.
              </Text>
            </View>
          </View>
        </View>

        {/* Tier Cards Selection */}
        <View style={styles.plansContainer}>
          {TIER_PLANS.map(plan => {
            const isSelected = selectedTier === plan.id;
            const borderCol = isSelected ? theme.primary : theme.cardBorder;
            const bgCol = isSelected ? theme.backgroundSelected : theme.backgroundElement;

            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedTier(plan.id)}
                style={[
                  styles.planCard,
                  {
                    borderColor: borderCol,
                    backgroundColor: bgCol,
                  },
                ]}
              >
                {plan.badge && (
                  <View style={[styles.planBadge, { backgroundColor: isSelected ? theme.primary : '#3b3d42' }]}>
                    <Text style={styles.planBadgeLabel}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planName, { color: theme.textSecondary }]}>{plan.name}</Text>
                <Text style={[styles.planPrice, { color: theme.text }]}>{plan.price}</Text>
                <Text style={[styles.planPeriod, { color: theme.textSecondary }]}>per {plan.period}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Glowing Action Buy Button */}
        <Pressable
          style={({ pressed }) => [
            styles.buyBtn,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
            pressed && styles.pressed,
          ]}
          onPress={onUnlockSubscription}
        >
          <Text style={styles.buyBtnText}>Start Free Trial & Unlock</Text>
        </Pressable>

        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          No obligation. Cancel anytime in your subscription settings.
        </Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(90px)',
  },
  paywallCard: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.four,
    position: 'relative',
    paddingTop: Spacing.five,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  crownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  benefits: {
    width: '100%',
    gap: 16,
    paddingHorizontal: Spacing.one,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitTextCol: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  benefitDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  plansContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  buyBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
