import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { GlassCard } from './glass-card';
import { useAuth } from '../../context/AuthContext';
import { ScanStatus } from '../../controllers/useScanController';

interface ScanLoadingOverlayProps {
  isActive: boolean;
  status: ScanStatus;
  progress: number;
  telemetryMessage: string;
  selectedImageUri: string | null;
}

/**
 * Full-screen glassmorphic overlay shown while a scan is in progress.
 */
export function ScanLoadingOverlay({
  isActive,
  status,
  progress,
  telemetryMessage,
  selectedImageUri,
}: ScanLoadingOverlayProps) {
  const { theme } = useAuth();

  if (!isActive) return null;

  const statusLabel =
    status === 'capturing' ? 'Aligning Optical Focus...' :
    status === 'gps'       ? 'Geocoding Coordinate Location...' :
    status === 'uploading' ? 'Transmitting Visual Base64 payload...' :
    status === 'analyzing' ? 'Claude is Analyzing Foliage...' :
    status === 'saving'    ? 'Relational SQLite mapping...' :
                             'Cataloging Houseplant...';

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      {selectedImageUri && (
        <Image
          source={{ uri: selectedImageUri }}
          style={[StyleSheet.absoluteFill, styles.blurBg]}
          blurRadius={30}
          contentFit="cover"
        />
      )}

      <GlassCard style={styles.card}>
        <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 12 }} />

        <Text style={[styles.title, { color: theme.text }]}>{statusLabel}</Text>

        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          {telemetryMessage || 'Calibrating system lens...'}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
        </View>

        <Text style={[styles.progressText, { color: theme.primary }]}>
          SYSTEM RESOLUTION: {Math.round(progress * 100)}%
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 12, 9, 0.4)',
  },
  blurBg: {
    opacity: 0.25,
  },
  card: {
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    padding: 24,
    gap: 12,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  desc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
    minHeight: 32,
  },
  progressTrack: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
});
