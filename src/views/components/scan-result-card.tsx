import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { GlassCard } from './glass-card';
import { useAuth } from '../../context/AuthContext';
import { GardenItem } from '../../models/GardenModel';
import { Spacing } from '../../constants/theme';

interface ScanResultCardProps {
  scannedResult: GardenItem;
  onReset: () => void;
}

/**
 * Success result card shown after a successful plant scan.
 */
export function ScanResultCard({ scannedResult, onReset }: ScanResultCardProps) {
  const { theme, themeMode } = useAuth();
  const router = useRouter();

  const isDiseased = scannedResult.healthStatus === 'Diseased';
  const statusColor = isDiseased ? theme.danger : theme.success;

  return (
    <View style={styles.panel}>
      {/* Plant image thumbnail with health badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: scannedResult.photoUri }}
          style={[styles.plantImage, { borderColor: statusColor }]}
          contentFit="cover"
        />
        <View style={[styles.iconBadge, { backgroundColor: theme.background, borderColor: statusColor }]}>
          <SymbolView
            name={isDiseased ? 'medical.thermometer.fill' : 'checkmark.seal.fill'}
            size={14}
            tintColor={statusColor}
          />
        </View>
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          {isDiseased ? (
            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
              <Text style={[styles.badgeText, { color: '#fff' }]}>
                🩺 DIAGNOSED: {scannedResult.diagnosedIssue || 'Diseased fronds'}
              </Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: theme.success }]}>
              <Text style={[styles.badgeText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>
                98% AI MATCH
              </Text>
            </View>
          )}

          <Text style={[styles.title, { color: theme.text }]}>{scannedResult.commonName}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{scannedResult.botanicalName}</Text>
        </View>

        {scannedResult.discoveryLocation?.placeName && (
          <View style={[styles.locationRow, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView name="mappin.circle.fill" size={14} tintColor={theme.primary} />
            <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
              Captured at {scannedResult.discoveryLocation.placeName}
            </Text>
          </View>
        )}

        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          {isDiseased
            ? `Foliage Doctor Alert: ${scannedResult.symptomDescription}`
            : scannedResult.description}
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, { backgroundColor: theme.primary }, pressed && styles.pressed]}
            onPress={() => {
              console.log('[ScanResultCard] Navigating to plant details for ID:', scannedResult.id);
              router.push({ pathname: '/plant/[id]', params: { id: scannedResult.id } });
            }}
          >
            <Text style={[styles.ctaLabel, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>
              {isDiseased ? 'Open Clinic Remedy Guide' : 'Open Care Details Guide'}
            </Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]} onPress={onReset}>
            <Text style={[styles.resetLabel, { color: theme.textSecondary }]}>Scan Another Plant</Text>
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
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: Spacing.one,
  },
  plantImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.three,
  },
  cardHeader: {
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    padding: 8,
    width: '100%',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
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
    marginTop: Spacing.one,
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
