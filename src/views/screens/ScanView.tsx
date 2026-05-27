import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Spacing, BottomTabInset } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { ScanHUD } from '../components/scan-hud';
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
  userName?: string;
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
  userName,
}: ScanViewProps) {
  const { theme, themeMode } = useAuth();
  const router = useRouter();

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
      {isScanningActive && (
        <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(7, 12, 9, 0.4)' }]}>
          {selectedImageUri && (
            <Image
              source={{ uri: selectedImageUri }}
              style={StyleSheet.absoluteFillObject}
              blurRadius={30}
              contentFit="cover"
              opacity={0.25}
            />
          )}
          
          <GlassCard style={styles.loadingOverlayCard}>
            <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 12 }} />
            
            <Text style={[styles.loadingTitle, { color: theme.text }]}>
              {status === 'capturing' ? 'Aligning Optical Focus...' :
               status === 'gps' ? 'Geocoding Coordinate Location...' :
               status === 'uploading' ? 'Transmitting Visual Base64 payload...' :
               status === 'analyzing' ? 'Claude is Analyzing Foliage...' :
               status === 'saving' ? 'Relational SQLite mapping...' : 'Cataloging Houseplant...'}
            </Text>

            <Text style={[styles.loadingDesc, { color: theme.textSecondary }]}>
              {telemetryMessage || 'Calibrating system lens...'}
            </Text>

            <View style={styles.miniProgressTrack}>
              <View 
                style={[
                  styles.miniProgressBar, 
                  { 
                    width: `${progress * 100}%`, 
                    backgroundColor: theme.primary 
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.miniProgressText, { color: theme.primary }]}>
              SYSTEM RESOLUTION: {Math.round(progress * 100)}%
            </Text>
          </GlassCard>
        </View>
      )}

      {/* Locked Premium Top Header Bar */}
      {!isScanningActive && (
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
      )}

      {/* Main Viewport Content */}
      {!isScanningActive && (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.four }]}>
          {status === 'idle' && (
            <View style={styles.idlePanel}>
              {/* Feature Introduction Banners */}
              <GlassCard style={styles.introCard}>
                <View style={styles.introHeader}>
                  <SymbolView name={scanMode === 'diagnosis' ? 'medical.thermometer.fill' : 'eye.fill'} size={20} tintColor={theme.primary} />
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

              {/* Phase 6: segmented Mode selector toggle */}
              <View style={[styles.modeTabContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <Pressable
                  style={[
                    styles.modeTabBtn,
                    scanMode === 'identity' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setScanMode('identity')}
                >
                  <SymbolView
                    name="leaf.fill"
                    size={12}
                    tintColor={scanMode === 'identity' ? (themeMode === 'dark' ? '#070c09' : '#fff') : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeTabLabel,
                      { color: scanMode === 'identity' ? (themeMode === 'dark' ? '#070c09' : '#fff') : theme.textSecondary }
                    ]}
                  >
                    Botanical ID
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modeTabBtn,
                    scanMode === 'diagnosis' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setScanMode('diagnosis')}
                >
                  <SymbolView
                    name="medical.thermometer.fill"
                    size={12}
                    tintColor={scanMode === 'diagnosis' ? (themeMode === 'dark' ? '#070c09' : '#fff') : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeTabLabel,
                      { color: scanMode === 'diagnosis' ? (themeMode === 'dark' ? '#070c09' : '#fff') : theme.textSecondary }
                    ]}
                  >
                    Plant Doctor
                  </Text>
                </Pressable>
              </View>

              {/* Core Scan Capture & Upload Options */}
              <View style={styles.actionsGrid}>
                {/* Take Photo Button */}
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

                {/* Upload Stored Image Button */}
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

              {/* Developer Bypass Test Deck */}
              <View style={styles.testDeckSection}>
                <Text style={[styles.deckTitle, { color: theme.textSecondary }]}>
                  DEVELOPER SIMULATOR BYPASS DECK
                </Text>
                <Text style={[styles.deckDesc, { color: theme.textSecondary }]}>
                  Running on an emulator without working cameras? Click a target species below to trigger simulated AI geocoding scan runs instantly:
                </Text>
                
                <View style={styles.deckGrid}>
                  <Pressable
                    style={({ pressed }) => [styles.deckBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }, pressed && styles.pressed]}
                    onPress={() => onTriggerSimulatedScan('fiddle')}
                  >
                    <Image
                      source="https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=300&auto=format&fit=crop"
                      style={styles.deckBtnImage}
                      contentFit="cover"
                    />
                    <Text style={[styles.deckBtnLabel, { color: theme.text }]} numberOfLines={1}>Fiddle Leaf Fig</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.deckBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }, pressed && styles.pressed]}
                    onPress={() => onTriggerSimulatedScan('jade')}
                  >
                    <Image
                      source="https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=300&auto=format&fit=crop"
                      style={styles.deckBtnImage}
                      contentFit="cover"
                    />
                    <Text style={[styles.deckBtnLabel, { color: theme.text }]} numberOfLines={1}>Jade Plant</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.deckBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }, pressed && styles.pressed]}
                    onPress={() => onTriggerSimulatedScan('fern')}
                  >
                    <Image
                      source="https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=300&auto=format&fit=crop"
                      style={styles.deckBtnImage}
                      contentFit="cover"
                    />
                    <Text style={[styles.deckBtnLabel, { color: theme.text }]} numberOfLines={1}>Boston Fern</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Success Sheet Modal (Locked in presentational layout) */}
          {status === 'success' && scannedResult && (
            <View style={styles.successPanel}>
              <View style={styles.successImageContainer}>
                <Image
                  source={{ uri: scannedResult.photoUri }}
                  style={[styles.successPlantImage, { borderColor: scannedResult.healthStatus === 'Diseased' ? theme.danger : theme.success }]}
                  contentFit="cover"
                />
                <View style={[styles.successIconBadge, { backgroundColor: theme.background, borderColor: scannedResult.healthStatus === 'Diseased' ? theme.danger : theme.success }]}>
                  <SymbolView
                    name={scannedResult.healthStatus === 'Diseased' ? 'medical.thermometer.fill' : 'checkmark.seal.fill'}
                    size={14}
                    tintColor={scannedResult.healthStatus === 'Diseased' ? theme.danger : theme.success}
                  />
                </View>
              </View>

              <GlassCard style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  {scannedResult.healthStatus === 'Diseased' ? (
                    <View style={[styles.matchBadge, { backgroundColor: theme.danger }]}>
                      <Text style={[styles.matchBadgeText, { color: '#fff' }]}>🩺 DIAGNOSED: {scannedResult.diagnosedIssue || 'Diseased fronds'}</Text>
                    </View>
                  ) : (
                    <View style={[styles.matchBadge, { backgroundColor: theme.success }]}>
                      <Text style={[styles.matchBadgeText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>98% AI MATCH</Text>
                    </View>
                  )}
                  
                  <Text style={[styles.resultTitle, { color: theme.text }]}>
                    {scannedResult.commonName}
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]}>
                    {scannedResult.botanicalName}
                  </Text>
                </View>

                {/* Discovery location preview if set */}
                {scannedResult.discoveryLocation?.placeName && (
                  <View style={[styles.resultLocation, { backgroundColor: theme.backgroundElement }]}>
                    <SymbolView name="mappin.circle.fill" size={14} tintColor={theme.primary} />
                    <Text style={[styles.locationNameText, { color: theme.text }]} numberOfLines={1}>
                      Captured at {scannedResult.discoveryLocation.placeName}
                    </Text>
                  </View>
                )}

                <Text style={[styles.resultDesc, { color: theme.textSecondary }]}>
                  {scannedResult.healthStatus === 'Diseased'
                    ? `Foliage Doctor Alert: ${scannedResult.symptomDescription}`
                    : scannedResult.description}
                </Text>

                <View style={styles.resultActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaBtn,
                      { backgroundColor: theme.primary },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      console.log('[ScanView] Navigating to plant details for ID:', scannedResult.id);
                      router.push({ pathname: '/plant/[id]', params: { id: scannedResult.id } });
                    }}
                  >
                    <Text style={[styles.ctaBtnLabel, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>
                      {scannedResult.healthStatus === 'Diseased' ? 'Open Clinic Remedy Guide' : 'Open Care Details Guide'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
                    onPress={onResetScanner}
                  >
                    <Text style={[styles.resetBtnLabel, { color: theme.textSecondary }]}>Scan Another Plant</Text>
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          )}

          {/* Error Sheet Modal */}
          {status === 'error' && (
            <View style={styles.successPanel}>
              <View style={[styles.successIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <SymbolView name="exclamationmark.triangle.fill" size={48} tintColor={theme.danger} />
              </View>

              <GlassCard style={styles.resultCard}>
                <Text style={[styles.resultTitle, { color: theme.text, textAlign: 'center' }]}>Scan Sequence Failed</Text>
                <Text style={[styles.resultDesc, { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }]}>
                  {scanError || 'An error occurred contacting Claude AI. Verify your internet connection or Claude API Key settings.'}
                </Text>

                <View style={[styles.resultActions, { marginTop: 16 }]}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaBtn,
                      { backgroundColor: theme.danger },
                      pressed && styles.pressed,
                    ]}
                    onPress={onResetScanner}
                  >
                    <Text style={[styles.ctaBtnLabel, { color: '#ffffff' }]}>Try Scanning Again</Text>
                  </Pressable>

                  <Pressable
                    style={styles.resetBtn}
                    onPress={() => router.push('/settings')}
                  >
                    <Text style={[styles.resetBtnLabel, { color: theme.textSecondary }]}>Open Key Configurations</Text>
                  </Pressable>
                </View>
              </GlassCard>
            </View>
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
  headerUserName: {
    fontSize: 11,
    fontWeight: '900',
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
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  testDeckSection: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  deckTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  deckDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: Spacing.one,
  },
  deckGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  deckBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    gap: 8,
    elevation: 1,
    borderWidth: 1.5,
  },
  deckBtnImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  deckBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  successPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  resultCard: {
    width: '100%',
    maxWidth: 420,
    gap: Spacing.three,
  },
  resultHeader: {
    alignItems: 'center',
    gap: 4,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  matchBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  resultSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  resultLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    padding: 8,
    width: '100%',
  },
  locationNameText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  resultActions: {
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
  ctaBtnLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.one,
  },
  resetBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.8,
  },
  successImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: Spacing.one,
  },
  successPlantImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  successIconBadge: {
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
  
  // Phase 6: Segmented Tab Selector Switch Styles
  modeTabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 4,
    width: '100%',
    gap: 4,
  },
  modeTabBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modeTabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  loadingOverlayCard: {
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    padding: 24,
    gap: 12,
    elevation: 5,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  loadingDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
    minHeight: 32,
  },
  miniProgressTrack: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  miniProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  miniProgressText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
});
