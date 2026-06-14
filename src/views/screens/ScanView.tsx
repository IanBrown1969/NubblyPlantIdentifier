import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Spacing, BottomTabInset } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { ScanHUD } from '../components/scan-hud';
import { BrandHeader } from '../components/brand-header';
import { ScanLoadingOverlay } from '../components/scan-loading-overlay';
import { ScanModeSelector } from '../components/scan-mode-selector';
import { SimDeck } from '../components/sim-deck';
import { ScanResultCard } from '../components/scan-result-card';
import { ScanErrorCard } from '../components/scan-error-card';
import { ScanStatus } from '../../controllers/useScanController';
import { GardenItem } from '../../models/GardenModel';

interface ScanViewProps {
  status: ScanStatus;
  scanMode: 'identity' | 'diagnosis';
  progress: number;
  telemetryMessage: string;
  scannedResult: GardenItem | null;
  selectedImageUri: string | null;
  showPaywall: boolean;
  scanError: string | null;
  setScanMode: (mode: 'identity' | 'diagnosis') => void;
  onCapturePhoto: () => Promise<void>;
  onChoosePhoto: () => Promise<void>;
  onTriggerSimulatedScan: (plantType: 'fiddle' | 'jade' | 'fern') => Promise<void>;
  onResetScanner: () => void;
  onDismissPaywall: () => void;
}

/**
 * Visual Scanner & AI Diagnostic View.
 * Coordinates camera capture, stored gallery uploads, and scanning animations.
 */
export function ScanView({
  status,
  scanMode,
  progress,
  telemetryMessage,
  scannedResult,
  selectedImageUri,
  showPaywall,
  scanError,
  setScanMode,
  onCapturePhoto,
  onChoosePhoto,
  onTriggerSimulatedScan,
  onResetScanner,
}: ScanViewProps) {
  const { theme, themeMode } = useAuth();

  const isScanningActive = status !== 'idle' && status !== 'success' && status !== 'error';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dynamic Laser HUD Overlay */}
      <ScanHUD
        telemetryMessage={telemetryMessage}
        progress={progress}
        isActive={isScanningActive}
        imageUri={selectedImageUri}
      />

      {/* Full-Screen Glassmorphic Loading Progress Overlay */}
      <ScanLoadingOverlay
        isActive={isScanningActive}
        status={status}
        progress={progress}
        telemetryMessage={telemetryMessage}
        selectedImageUri={selectedImageUri}
      />

      {/* Top Header Bar */}
      {!isScanningActive && <BrandHeader />}

      {/* Main Viewport Content */}
      {!isScanningActive && (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.four }]}>
          {status === 'idle' && (
            <View style={styles.idlePanel}>
              {/* Feature Introduction Banner */}
              <GlassCard style={styles.introCard}>
                <View style={styles.introHeader}>
                  <SymbolView
                    name={scanMode === 'diagnosis' ? 'medical.thermometer.fill' : 'eye.fill'}
                    size={20}
                    tintColor={theme.primary}
                  />
                  <Text style={[styles.introTitle, { color: theme.text }]}>
                    {scanMode === 'diagnosis' ? 'AI Botanical Symptoms Doctor' : 'Claude AI Botanical Scan'}
                  </Text>
                </View>
                <Text style={[styles.introDesc, { color: theme.textSecondary }]}>
                  {scanMode === 'diagnosis'
                    ? 'Analyze leaf discolourations, spots, pests, or nutrient chlorosis instantly to generate organic remedy plans and treatment remedies.'
                    : 'Analyze leaf geometry, discover botanical names, map GPS discovery points, and unlock customized watering intervals instantly.'}
                </Text>
              </GlassCard>

              {/* Scan Mode Toggle */}
              <ScanModeSelector scanMode={scanMode} setScanMode={setScanMode} />

              {/* Camera & Upload Buttons */}
              <View style={styles.actionsGrid}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionCircle,
                    { backgroundColor: theme.primary },
                    pressed && styles.pressed,
                  ]}
                  onPress={onCapturePhoto}
                >
                  <SymbolView name="camera.fill" size={24} tintColor={themeMode === 'dark' ? '#070c09' : '#ffffff'} />
                  <Text style={[styles.circleLabel, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>Take Photo</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionCircle,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
                    pressed && styles.pressed,
                  ]}
                  onPress={onChoosePhoto}
                >
                  <SymbolView name="photo.fill" size={24} tintColor={theme.text} />
                  <Text style={[styles.circleLabel, { color: theme.text }]}>Upload Photo</Text>
                </Pressable>
              </View>

              {/* Developer Bypass Simulator Deck */}
              <SimDeck onTriggerSimulatedScan={onTriggerSimulatedScan} />
            </View>
          )}

          {status === 'success' && scannedResult && (
            <ScanResultCard scannedResult={scannedResult} onReset={onResetScanner} />
          )}

          {status === 'error' && (
            <ScanErrorCard scanError={scanError} onReset={onResetScanner} />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
  },
  idlePanel: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  introCard: {
    gap: Spacing.two,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  introDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.three,
    justifyContent: 'center',
    marginVertical: Spacing.one,
  },
  actionCircle: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  circleLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.8,
  },
});
