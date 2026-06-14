import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '../../context/AuthContext';
import { Spacing } from '../../constants/theme';

interface SimDeckProps {
  onTriggerSimulatedScan: (plantType: 'fiddle' | 'jade' | 'fern') => Promise<void>;
}

const DECK_PLANTS: { type: 'fiddle' | 'jade' | 'fern'; label: string; uri: string }[] = [
  {
    type: 'fiddle',
    label: 'Fiddle Leaf Fig',
    uri: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=300&auto=format&fit=crop',
  },
  {
    type: 'jade',
    label: 'Jade Plant',
    uri: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=300&auto=format&fit=crop',
  },
  {
    type: 'fern',
    label: 'Boston Fern',
    uri: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=300&auto=format&fit=crop',
  },
];

/**
 * Developer-only simulator bypass deck.
 * Renders three quick-launch plant buttons for emulator testing.
 */
export function SimDeck({ onTriggerSimulatedScan }: SimDeckProps) {
  const { theme } = useAuth();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>
        DEVELOPER SIMULATOR BYPASS DECK
      </Text>
      <Text style={[styles.desc, { color: theme.textSecondary }]}>
        Running on an emulator without working cameras? Click a target species below to trigger simulated AI geocoding scan runs instantly:
      </Text>

      <View style={styles.grid}>
        {DECK_PLANTS.map(({ type, label, uri }) => (
          <Pressable
            key={type}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
              pressed && styles.pressed,
            ]}
            onPress={() => onTriggerSimulatedScan(type)}
          >
            <Image source={uri} style={styles.btnImage} contentFit="cover" />
            <Text style={[styles.btnLabel, { color: theme.text }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  title: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  desc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: Spacing.one,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  btn: {
    flex: 1,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    gap: 8,
    elevation: 1,
    borderWidth: 1.5,
  },
  btnImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  btnLabel: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
