import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface WaterProgressProps {
  percentage: number;
  isOverdue: boolean;
  size?: number;
}

/**
 * Presentational circular hydration gauge.
 * Displays plant moisture level and adjusts accents based on urgency.
 */
export function WaterProgress({ percentage, isOverdue, size = 160 }: WaterProgressProps) {
  const { theme, themeMode } = useAuth();

  // Dynamic color threshold mapping
  let activeColor: string = theme.success;
  let statusText: string = 'Hydrated';
  let glowColor: string = 'rgba(16, 185, 129, 0.2)';

  if (isOverdue || percentage <= 25) {
    activeColor = theme.danger; // Coral Red
    statusText = 'Thirsty!';
    glowColor = 'rgba(239, 68, 68, 0.2)';
  } else if (percentage <= 60) {
    activeColor = theme.warning; // Warm Amber
    statusText = 'Needs Water';
    glowColor = 'rgba(245, 158, 11, 0.2)';
  }

  // Radial Dial borders
  const trackBorderColor = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Glow Ring */}
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: trackBorderColor,
            shadowColor: activeColor,
            backgroundColor: glowColor,
          },
        ]}
      />

      {/* Inner Content Dial */}
      <View
        style={[
          styles.innerDial,
          {
            width: size - 24,
            height: size - 24,
            borderRadius: (size - 24) / 2,
            backgroundColor: theme.backgroundElement,
            borderColor: activeColor,
          },
        ]}
      >
        <Text style={[styles.percentageText, { color: theme.text }]}>
          {isOverdue ? '0' : percentage}%
        </Text>
        <Text style={[styles.statusSubtext, { color: activeColor }]}>
          {statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    
    // Glowing shadow for premium feel
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 4,
  },
  innerDial: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statusSubtext: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
