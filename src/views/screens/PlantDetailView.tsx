import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { WaterProgress } from '../components/water-progress';
import { Plant } from '../../models/PlantModel';
import { GardenItem, PlantProgressLog } from '../../models/GardenModel';

interface PlantDetailViewProps {
  loading: boolean;
  isSavedInGarden: boolean;
  plantDetails: Plant | GardenItem | null;
  wateringLogs: string[];
  progressLogs?: PlantProgressLog[];
  hydrationPercentage: number;
  daysRemaining: number;
  isOverdue: boolean;
  onWaterPlant: () => Promise<boolean>;
  onAddToGarden: (nickname?: string) => Promise<boolean>;
  onDeleteFromGarden: () => Promise<boolean>;
  onAddProgressLog?: (photoUri: string, notes: string) => Promise<boolean>;
  onBack: () => void;
}

/**
 * Plant Care Details & Symptom Clinic Screen.
 * Renders circular gauges, spec badges, care guides, and discovery geolocations.
 */
export function PlantDetailView({
  loading,
  isSavedInGarden,
  plantDetails,
  wateringLogs,
  progressLogs = [],
  hydrationPercentage,
  daysRemaining,
  isOverdue,
  onWaterPlant,
  onAddToGarden,
  onDeleteFromGarden,
  onAddProgressLog,
  onBack,
}: PlantDetailViewProps) {
  const { theme, themeMode } = useAuth();
  
  const [nickname, setNickname] = useState('');
  
  // Growth Journal Entry States
  const [progressNote, setProgressNote] = useState('');
  const [progressPhotoUri, setProgressPhotoUri] = useState<string | null>(null);
  const [isLoggingProgress, setIsLoggingProgress] = useState(false);

  // Expandable Care Accordions States
  const [expandedSection, setExpandedSection] = useState<'care' | 'soil' | 'troubleshoot' | null>('care');

  if (loading || !plantDetails) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading care guides...</Text>
      </View>
    );
  }

  // Cast plant item properties cleanly
  const p = plantDetails as any; // Cast as any to resolve flexible dynamic columns
  const castGardenItem = isSavedInGarden ? (plantDetails as GardenItem) : null;
  const isPetSafe = p.isPetSafe;

  const toggleSection = (section: 'care' | 'soil' | 'troubleshoot') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  /**
   * Triggers image library picker to select a growth update.
   */
  const handleChooseProgressPhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProgressPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log('[PlantDetailView] Error picking progress photo:', e);
    }
  };

  /**
   * Saves the growth log entry.
   */
  const handleSaveProgressLog = async () => {
    if (!onAddProgressLog || !progressPhotoUri) return;
    setIsLoggingProgress(true);
    try {
      const success = await onAddProgressLog(progressPhotoUri, progressNote || 'Growth milestone logged.');
      if (success) {
        setProgressNote('');
        setProgressPhotoUri(null);
      }
    } catch (e) {
      console.error('[PlantDetailView] Failed to save progress log:', e);
    } finally {
      setIsLoggingProgress(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero Image Banner with Back Action */}
      <View style={styles.heroSection}>
        <Image source={{ uri: p.photoUri }} style={styles.heroImage} contentFit="cover" />
        <View style={styles.imageOverlay} />
        
        {/* Back Button */}
        <Pressable onPress={onBack} style={[styles.backBtn, { backgroundColor: 'rgba(11, 14, 12, 0.5)' }]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={16}
            tintColor="#fff"
          />
        </Pressable>

        {/* Floating Common & Botanical titles inside Overlay */}
        <View style={styles.heroTitles}>
          <Text style={styles.heroCommonName} numberOfLines={2}>
            {isSavedInGarden && castGardenItem ? castGardenItem.customName : p.commonName}
          </Text>
          <Text style={styles.heroBotanicalName}>
            {p.botanicalName} ({p.family})
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Phase 6: AI Doctor Symptoms Clinic Report Card */}
        {isSavedInGarden && p.healthStatus === 'Diseased' && (
          <GlassCard style={[styles.clinicCard, { borderColor: 'rgba(239, 68, 68, 0.35)' }]}>
            <View style={styles.clinicHeader}>
              <SymbolView
                name={{ ios: 'medical.thermometer.fill', android: 'medical_services', web: 'medical_services' }}
                size={18}
                tintColor={theme.danger}
              />
              <Text style={[styles.clinicTitle, { color: theme.danger }]}>🩺 AI Doctor Symptoms Diagnosis</Text>
            </View>
            <View style={styles.clinicBadgeRow}>
              <View style={[styles.clinicIssueBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Text style={[styles.clinicIssueText, { color: theme.danger }]}>
                  {p.diagnosedIssue || 'Diseased Foliage Detected'}
                </Text>
              </View>
              <View style={[styles.clinicConfBadge, { backgroundColor: theme.backgroundElement }]}>
                <Text style={[styles.clinicConfText, { color: theme.textSecondary }]}>
                  {p.confidencePct || 90}% AI Confidence
                </Text>
              </View>
            </View>
            <View style={styles.clinicBodyContent}>
              <Text style={[styles.clinicSectionLabel, { color: theme.textSecondary }]}>SYMPTOMS OBSERVED</Text>
              <Text style={[styles.clinicText, { color: theme.text }]}>
                {p.symptomDescription || 'Discolored spots and visual decay spotted during scanner calibration.'}
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.clinicSectionLabel, { color: theme.primary }]}>REMEDY & ORGANIC TREATMENT PLAN</Text>
              <Text style={[styles.clinicTreatmentText, { color: theme.text }]}>
                {p.organicTreatment || 'Isolate from healthy house plants. Clean affected leaves and apply neem oil sprays weekly.'}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* About Card */}
        <GlassCard>
          <Text style={[styles.aboutTitle, { color: theme.textSecondary }]}>SPECIES PROFILE</Text>
          <Text style={[styles.aboutText, { color: theme.text }]}>{p.description}</Text>
        </GlassCard>

        {/* Dynamic Moisture Hydration Circular Progress Dial */}
        {isSavedInGarden && (
          <GlassCard style={styles.dialCard}>
            <WaterProgress percentage={hydrationPercentage} isOverdue={isOverdue} />
            <Text style={[styles.dialLabel, { color: theme.text }]}>
              {isOverdue
                ? `Watering is ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue!`
                : `Next watering action due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}
            </Text>
          </GlassCard>
        )}

        {/* Plant Care Metrics Specifications Grid */}
        <View style={styles.metricsGrid}>
          {/* Water Interval */}
          <GlassCard style={styles.metricItem}>
            <SymbolView
              name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }}
              size={16}
              tintColor={theme.primary}
            />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>WATERING</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>Every {p.waterIntervalDays}d</Text>
          </GlassCard>

          {/* Sunlight Need */}
          <GlassCard style={styles.metricItem}>
            <SymbolView
              name={{ ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' }}
              size={16}
              tintColor="#F59E0B"
            />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>SUNLIGHT</Text>
            <Text style={[styles.metricValue, { color: theme.text }]} numberOfLines={1}>
              {p.sunlight.split(' ').slice(0, 2).join(' ')}
            </Text>
          </GlassCard>

          {/* Pet Safety Status */}
          <GlassCard style={styles.metricItem}>
            <SymbolView
              name={{
                ios: isPetSafe ? 'checkmark.shield.fill' : 'exclamationmark.shield.fill',
                android: isPetSafe ? 'security' : 'gpp_maybe',
                web: isPetSafe ? 'security' : 'gpp_maybe',
              }}
              size={16}
              tintColor={isPetSafe ? theme.success : theme.danger}
            />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>PET SAFETY</Text>
            <Text style={[styles.metricValue, { color: isPetSafe ? theme.success : theme.danger }]}>
              {isPetSafe ? 'Safe' : 'Toxic'}
            </Text>
          </GlassCard>
        </View>

        {/* GPS Discovery Location Panel */}
        {castGardenItem?.discoveryLocation && (
          <GlassCard style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <SymbolView
                name={{ ios: 'mappin.circle.fill', android: 'place', web: 'place' }}
                size={16}
                tintColor={theme.primary}
              />
              <Text style={[styles.locationTitle, { color: theme.text }]}>Scan Location Metadata</Text>
            </View>
            <Text style={[styles.locationName, { color: theme.textSecondary }]}>
              {castGardenItem.discoveryLocation.placeName || 'Saved discovered geolocation'}
            </Text>
            <View style={[styles.gpsBadge, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.gpsText, { color: theme.textSecondary }]}>
                LAT: {castGardenItem.discoveryLocation.latitude.toFixed(6)}° | LON:{' '}
                {castGardenItem.discoveryLocation.longitude.toFixed(6)}°
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Phase 5 Growth Progress Photo Timeline */}
        {isSavedInGarden && (
          <GlassCard style={styles.journalCard}>
            <View style={styles.journalHeader}>
              <SymbolView
                name={{ ios: 'camera.filters', android: 'photo_library', web: 'photo_library' }}
                size={16}
                tintColor={theme.primary}
              />
              <Text style={[styles.journalHeaderTitle, { color: theme.text }]}>Foliage Photo Journal</Text>
            </View>
            <Text style={[styles.journalSubText, { color: theme.textSecondary }]}>
              Document physical changes, foliage expansions, or growth milestones:
            </Text>

            {/* Input log progress inline form */}
            <View style={[styles.journalForm, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
              <TextInput
                style={[styles.journalNoteInput, { color: theme.text }]}
                placeholder="Milestone note (e.g. New leaf popped!)"
                placeholderTextColor={theme.textSecondary}
                value={progressNote}
                onChangeText={setProgressNote}
              />
              <View style={styles.journalFormActions}>
                <Pressable
                  style={[styles.journalPicBtn, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                  onPress={handleChooseProgressPhoto}
                >
                  {progressPhotoUri ? (
                    <Image source={{ uri: progressPhotoUri }} style={styles.journalPicThumbnail} />
                  ) : (
                    <SymbolView
                      name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
                      size={12}
                      tintColor={theme.primary}
                    />
                  )}
                  <Text style={[styles.journalPicBtnText, { color: theme.text }]} numberOfLines={1}>
                    {progressPhotoUri ? 'Photo Picked' : 'Pick Photo'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.journalSaveBtn,
                    { backgroundColor: progressPhotoUri ? theme.primary : 'rgba(255,255,255,0.05)' }
                  ]}
                  onPress={handleSaveProgressLog}
                  disabled={!progressPhotoUri || isLoggingProgress}
                >
                  {isLoggingProgress ? (
                    <ActivityIndicator size="small" color={themeMode === 'dark' ? '#070c09' : '#ffffff'} />
                  ) : (
                    <>
                      <SymbolView
                        name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                        size={12}
                        tintColor={themeMode === 'dark' ? '#070c09' : '#ffffff'}
                      />
                      <Text style={[styles.journalSaveBtnText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>Save Entry</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Render Horizontal Timeline Scroll */}
            {progressLogs.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.journalSlider}>
                {progressLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <View key={log.id} style={[styles.journalTimelineItem, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                      <Image source={{ uri: log.photoUri }} style={styles.journalTimelineImage} contentFit="cover" />
                      <View style={styles.journalTimelineInfo}>
                        <Text style={[styles.journalTimelineDate, { color: theme.primary }]}>{formattedDate}</Text>
                        <Text style={[styles.journalTimelineNote, { color: theme.text }]} numberOfLines={3}>
                          {log.notes || 'Growth milestone logged.'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={[styles.emptyJournalBox, { backgroundColor: theme.backgroundElement }]}>
                <SymbolView
                  name={{ ios: 'photo.on.rectangle.angled', android: 'collections', web: 'collections' }}
                  size={24}
                  tintColor={theme.textSecondary}
                />
                <Text style={[styles.emptyJournalText, { color: theme.textSecondary }]}>
                  {"Your journal is empty. Select a photo to begin mapping your plant's progress timeline!"}
                </Text>
              </View>
            )}
          </GlassCard>
        )}

        {/* Active Saved Actions (Water triggers & Relational log summaries) */}
        {isSavedInGarden ? (
          <View style={styles.savedActions}>
            <Pressable
              style={({ pressed }) => [
                styles.waterBtn,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
                pressed && styles.pressed,
              ]}
              onPress={onWaterPlant}
            >
              <SymbolView
                name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }}
                size={16}
                tintColor={themeMode === 'dark' ? '#070c09' : '#ffffff'}
              />
              <Text style={[styles.waterBtnText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>Record Watering Log</Text>
            </Pressable>

            {/* Relational Watering Logs History List */}
            {wateringLogs.length > 0 && (
              <GlassCard style={styles.historyCard}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>Watering Logs History (SQLite)</Text>
                {wateringLogs.slice(0, 3).map((log, index) => {
                  const dateObj = new Date(log);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <View key={index} style={styles.historyRow}>
                      <SymbolView
                        name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
                        size={11}
                        tintColor={theme.textSecondary}
                      />
                      <Text style={[styles.historyLogLabel, { color: theme.textSecondary }]}>
                        Event recorded on {formattedDate}
                      </Text>
                    </View>
                  );
                })}
              </GlassCard>
            )}

            {/* Delete Garden Item Card */}
            <Pressable
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
              onPress={onDeleteFromGarden}
            >
              <SymbolView
                name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }}
                size={14}
                tintColor={theme.danger}
              />
              <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete from My Garden</Text>
            </Pressable>
          </View>
        ) : (
          /* Static Add to Garden Interface */
          <GlassCard style={styles.addCard}>
            <Text style={[styles.addTitle, { color: theme.text }]}>Add Plant to My Library</Text>
            <Text style={[styles.addDesc, { color: theme.textSecondary }]}>
              Enter a custom nickname to import this species into your active SQLite database garden, geocoding your current GPS location coordinates:
            </Text>
            
            <TextInput
              style={[
                styles.nicknameInput,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder={`Nickname (e.g. My ${p.commonName})`}
              placeholderTextColor={theme.textSecondary}
              value={nickname}
              onChangeText={setNickname}
            />

            <Pressable
              style={({ pressed }) => [
                styles.addSubmitBtn,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => onAddToGarden(nickname)}
            >
              <SymbolView name="plus.circle.fill" size={14} tintColor={themeMode === 'dark' ? '#070c09' : '#ffffff'} />
              <Text style={[styles.addSubmitText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>Save to Garden Database</Text>
            </Pressable>
          </GlassCard>
        )}

        {/* Expandable Frosted Care Instruction Accordion Cards */}
        <View style={styles.accordionContainer}>
          {/* Tab 1: Watering & Light */}
          <Pressable style={styles.accordionHeader} onPress={() => toggleSection('care')}>
            <Text style={[styles.accordionTitle, { color: theme.text }]}>Water & Sunlight Handbooks</Text>
            <SymbolView
              name={{
                ios: expandedSection === 'care' ? 'chevron.up' : 'chevron.down',
                android: expandedSection === 'care' ? 'chevron_up' : 'chevron_down',
                web: expandedSection === 'care' ? 'chevron_up' : 'chevron_down',
              }}
              size={12}
              tintColor={theme.text}
            />
          </Pressable>
          {expandedSection === 'care' && (
            <GlassCard style={styles.accordionBody}>
              <View style={styles.bodySection}>
                <Text style={[styles.bodySectionTitle, { color: theme.primary }]}>💧 Hydration Guidelines</Text>
                <Text style={[styles.bodySectionText, { color: theme.text }]}>{p.careGuide.watering}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
              <View style={styles.bodySection}>
                <Text style={[styles.bodySectionTitle, { color: '#F59E0B' }]}>☀️ Lighting Placements</Text>
                <Text style={[styles.bodySectionText, { color: theme.text }]}>{p.careGuide.sunlight}</Text>
              </View>
            </GlassCard>
          )}

          {/* Tab 2: Soil & Fertilizer */}
          <Pressable style={styles.accordionHeader} onPress={() => toggleSection('soil')}>
            <Text style={[styles.accordionTitle, { color: theme.text }]}>Soil Formulas & Fertilizers</Text>
            <SymbolView
              name={{
                ios: expandedSection === 'soil' ? 'chevron.up' : 'chevron.down',
                android: expandedSection === 'soil' ? 'chevron_up' : 'chevron_down',
                web: expandedSection === 'soil' ? 'chevron_up' : 'chevron_down',
              }}
              size={12}
              tintColor={theme.text}
            />
          </Pressable>
          {expandedSection === 'soil' && (
            <GlassCard style={styles.accordionBody}>
              <View style={styles.bodySection}>
                <Text style={[styles.bodySectionTitle, { color: theme.primary }]}>🌱 Soil Formulas</Text>
                <Text style={[styles.bodySectionText, { color: theme.text }]}>{p.careGuide.soil}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
              <View style={styles.bodySection}>
                <Text style={[styles.bodySectionTitle, { color: '#F59E0B' }]}>🧪 Seasonal Fertilization</Text>
                <Text style={[styles.bodySectionText, { color: theme.text }]}>{p.careGuide.fertilizer}</Text>
              </View>
            </GlassCard>
          )}

          {/* Tab 3: Troubleshooting Clinic */}
          <Pressable style={styles.accordionHeader} onPress={() => toggleSection('troubleshoot')}>
            <Text style={[styles.accordionTitle, { color: theme.text }]}>Foliage Troubleshooting Clinic</Text>
            <SymbolView
              name={{
                ios: expandedSection === 'troubleshoot' ? 'chevron.up' : 'chevron.down',
                android: expandedSection === 'troubleshoot' ? 'chevron_up' : 'chevron_down',
                web: expandedSection === 'troubleshoot' ? 'chevron_up' : 'chevron_down',
              }}
              size={12}
              tintColor={theme.text}
            />
          </Pressable>
          {expandedSection === 'troubleshoot' && (
            <GlassCard style={styles.accordionBody}>
              <Text style={[styles.clinicIntro, { color: theme.textSecondary }]}>
                Diagnose symptoms and execute care steps to save sick foliage:
              </Text>
              
              {p.careGuide.troubleshooting.map((item: any, idx: number) => (
                <View key={idx} style={[styles.symptomCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.symptomName, { color: theme.danger }]}>⚠️ Symptom: {item.symptom}</Text>
                  <Text style={[styles.symptomDetail, { color: theme.text }]}>
                    <Text style={{ fontWeight: '800' }}>Biological Cause: </Text>
                    {item.cause}
                  </Text>
                  <Text style={[styles.symptomDetail, { color: theme.text }]}>
                    <Text style={{ fontWeight: '800' }}>Actionable Cure: </Text>
                    {item.solution}
                  </Text>
                </View>
              ))}
            </GlassCard>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroSection: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 14, 12, 0.45)', // Custom bottom gradient fade
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitles: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 4,
  },
  heroCommonName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  heroBotanicalName: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  aboutTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  dialCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  dialLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  locationCard: {
    gap: 6,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  locationName: {
    fontSize: 12,
    fontWeight: '700',
  },
  gpsBadge: {
    borderRadius: 8,
    padding: 6,
    alignSelf: 'flex-start',
  },
  gpsText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  savedActions: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  waterBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  waterBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  historyCard: {
    gap: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyLogLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.one,
    marginTop: Spacing.one,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  addCard: {
    gap: Spacing.two,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  nicknameInput: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  addSubmitBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  addSubmitText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  accordionContainer: {
    marginTop: Spacing.one,
    gap: 4,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  accordionBody: {
    marginTop: 8,
    gap: Spacing.two,
  },
  bodySection: {
    gap: 4,
  },
  bodySectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bodySectionText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  clinicIntro: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  symptomCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 4,
    marginBottom: 4,
  },
  symptomName: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  symptomDetail: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.9,
  },
  
  // Phase 5: Growth Timeline Styles
  journalCard: {
    gap: Spacing.two,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  journalHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  journalSubText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 2,
  },
  journalForm: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: Spacing.two,
    gap: 10,
    marginBottom: Spacing.one,
  },
  journalNoteInput: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
  },
  journalFormActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  journalPicBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  journalPicThumbnail: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  journalPicBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  journalSaveBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  journalSaveBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  journalSlider: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  journalTimelineItem: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  journalTimelineImage: {
    width: '100%',
    height: 120,
  },
  journalTimelineInfo: {
    padding: 10,
    gap: 4,
  },
  journalTimelineDate: {
    fontSize: 9,
    fontWeight: '800',
  },
  journalTimelineNote: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  emptyJournalBox: {
    borderRadius: 14,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyJournalText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },

  // Phase 6: AI Doctor Symptoms Clinic Styles
  clinicCard: {
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: 'rgba(239, 68, 68, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clinicTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  clinicBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clinicIssueBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clinicIssueText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  clinicConfBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clinicConfText: {
    fontSize: 9,
    fontWeight: '800',
  },
  clinicBodyContent: {
    gap: 8,
    marginTop: 4,
  },
  clinicSectionLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  clinicText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  clinicTreatmentText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});

