import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';

interface ScanHUDProps {
  telemetryMessage: string;
  progress: number;
  isActive: boolean;
  imageUri?: string | null;
}

/**
 * Animated camera scanner HUD.
 * Sweeps a physical laser line up/down and renders active diagnostic stats.
 */
export function ScanHUD({ telemetryMessage, progress, isActive, imageUri }: ScanHUDProps) {
  const { theme } = useAuth();

  // Reanimated Shared Value for sweeping laser line
  const translateY = useSharedValue(0);
  // Shared Value for continuous swirling aperture rotation
  const spinRotation = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Loop the laser sweep continuously
      translateY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1800 }),
          withTiming(0, { duration: 1800 })
        ),
        -1, // Infinite loops
        false
      );

      // Continuous linear spin cycle rotation
      spinRotation.value = withRepeat(
        withTiming(1, { duration: 2500, easing: Easing.linear }),
        -1, // Infinite loops
        false
      );
    } else {
      translateY.value = 0;
      spinRotation.value = 0;
    }
  }, [isActive, translateY, spinRotation]);

  const laserStyle = useAnimatedStyle(() => {
    return {
      top: `${translateY.value * 100}%`,
    };
  });

  const spinnerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinRotation.value * 360}deg` }],
    };
  });

  if (!isActive) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Ambient Blurred Background of the processing image */}
      {imageUri && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFill, { opacity: 0.35 }]}
            blurRadius={20}
            contentFit="cover"
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(7, 12, 9, 0.4)' }]} />
        </View>
      )}

      {/* Target Crosshair Corners with Contained Sweeping Laser */}
      <View style={styles.viewfinder}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
            contentFit="cover"
          />
        )}
        <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />

        {/* Swirling Center Core Progress Indicator */}
        <Animated.View style={[styles.spinner, spinnerStyle, { borderColor: theme.primary }]} />

        {/* Sweeping Laser Line inside Viewfinder */}
        <Animated.View style={[styles.laser, laserStyle, { backgroundColor: theme.primary }]} />
      </View>

      {/* Diagnostic HUD Metadata Console */}
      <View style={[styles.hudConsole, { backgroundColor: 'rgba(11, 14, 12, 0.85)', borderColor: theme.cardBorder }]}>
        <View style={styles.consoleHeader}>
          <View style={[styles.pulseDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.consoleTitle, { color: theme.success }]}>BOTANICAL SCAN HUD v1.4</Text>
        </View>

        <Text style={[styles.consoleLog, { color: theme.text }]} numberOfLines={2}>
          {telemetryMessage || 'Calibrating optical lens scope...'}
        </Text>

        {/* Dynamic Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressPct, { color: theme.textSecondary }]}>
          SYSTEM ANALYSIS: {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  laser: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  viewfinder: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '80%',
    height: '50%',
    opacity: 0.75,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  hudConsole: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 8,
  },
  consoleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  consoleTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  consoleLog: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginLeft: -32,
    marginTop: -32,
    opacity: 0.85,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
});
