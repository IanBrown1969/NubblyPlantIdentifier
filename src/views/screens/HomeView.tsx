import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Spacing, BottomTabInset } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { GardenItem, GardenDashboardStats } from '../../controllers/useHomeController';
import { WeatherTelemetry } from '../../services/WeatherService';

interface HomeViewProps {
  gardenList: GardenItem[];
  stats: GardenDashboardStats;
  weather: WeatherTelemetry | null;
  refreshing: boolean;
  onRefresh: () => void;
  onWaterPlant: (id: string) => Promise<boolean>;
  onDeletePlant: (id: string) => Promise<boolean>;
  
  // Phase 7 Customizable widgets
  widgetOrder: string[];
  visibleWidgets: Record<string, boolean>;
  isEditingWidgets: boolean;
  onToggleWidgetVisibility: (id: string) => Promise<void>;
  onMoveWidgetUp: (id: string) => Promise<void>;
  onMoveWidgetDown: (id: string) => Promise<void>;
  onToggleEditWidgetsMode: () => void;
  userName?: string;
}

/**
 * Personal Garden Dashboard View.
 * Displays total catalog items, water calendars, and care tasks.
 */
export function HomeView({
  gardenList,
  stats,
  weather,
  refreshing,
  onRefresh,
  onWaterPlant,
  onDeletePlant,
  widgetOrder,
  visibleWidgets,
  isEditingWidgets,
  onToggleWidgetVisibility,
  onMoveWidgetUp,
  onMoveWidgetDown,
  onToggleEditWidgetsMode,
  userName,
}: HomeViewProps) {
  const { theme, themeMode } = useAuth();
  const router = useRouter();

  const currentMonth = new Date().getMonth() + 1; // 1-indexed (1-12) for seasonal checks

  // Render weather alert widget
  const renderWeather = () => {
    if (!weather) return null;
    return (
      <GlassCard
        style={[
          styles.weatherCard,
          { borderColor: weather.frostAlert ? 'rgba(59, 130, 246, 0.35)' : theme.cardBorder }
        ]}
      >
        <View style={styles.weatherRow}>
          <View style={styles.weatherLeftCol}>
            <SymbolView
              name={weather.frostAlert ? 'thermometer.snowflake' : 'sun.max.fill'}
              size={20}
              tintColor={weather.frostAlert ? '#3B82F6' : '#F59E0B'}
            />
            <View style={{ gap: 2 }}>
              <Text style={[styles.weatherTempText, { color: theme.text }]}>
                {weather.temperature}°C
              </Text>
              <Text style={[styles.weatherDescText, { color: theme.textSecondary }]}>
                {weather.description}
              </Text>
            </View>
          </View>

          <View style={styles.weatherRightCol}>
            <SymbolView name="mappin.circle.fill" size={10} tintColor={theme.primary} />
            <Text style={[styles.weatherLocationText, { color: theme.text }]} numberOfLines={1}>
              {weather.placeName}
            </Text>
          </View>
        </View>

        {/* Premium Frost Warning Message */}
        {weather.frostAlert && (
          <View style={[styles.weatherWarningAlert, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <SymbolView name="exclamationmark.triangle.fill" size={11} tintColor="#3B82F6" />
            <Text style={styles.weatherWarningText}>
              Frost Alert! Cold fronts detected. Safeguard outdoor potted items.
            </Text>
          </View>
        )}
      </GlassCard>
    );
  };

  // Render water care status widget
  const renderCareStatus = () => {
    if (gardenList.length === 0 || !stats.nextCareItemId) return null;
    return (
      <Pressable
        style={({ pressed }) => [pressed && styles.pressed]}
        onPress={() => router.push({ pathname: '/plant/[id]', params: { id: stats.nextCareItemId } })}
      >
        <GlassCard
          style={[
            styles.statusBanner,
            {
              borderColor: stats.thirstyCount > 0 ? 'rgba(245, 158, 11, 0.2)' : theme.cardBorder,
            },
          ]}
        >
          <View style={styles.bannerRow}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: stats.thirstyCount > 0 ? theme.warning : theme.success,
                },
              ]}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.bannerTitle, { color: theme.text }]}>
                {stats.thirstyCount > 0
                  ? `${stats.thirstyCount} Plant${stats.thirstyCount > 1 ? 's' : ''} Need Water!`
                  : 'All Plants Hydrated!'}
              </Text>
              {stats.nextCareItemName && (
                <Text style={[styles.bannerDesc, { color: theme.textSecondary }]}>
                  {stats.nextCareItemDays !== null && stats.nextCareItemDays <= 0
                    ? `${stats.nextCareItemName} is thirsty now!`
                    : `Next care task: ${stats.nextCareItemName} in ${stats.nextCareItemDays} day${stats.nextCareItemDays === 1 ? '' : 's'}`}
                </Text>
              )}
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
              tintColor={theme.textSecondary}
            />
          </View>
        </GlassCard>
      </Pressable>
    );
  };

  // Render Bed Planner & Shopping wishlist widget row
  const renderToolsGrid = () => {
    return (
      <View style={styles.toolsLaunchRow}>
        {/* Bed Planner Widget */}
        <Pressable
          style={({ pressed }) => [
            styles.toolCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
            pressed && styles.pressed
          ]}
          onPress={() => router.push('/planner')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <SymbolView name="square.grid.3x3.fill" size={16} tintColor={theme.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.toolTitleText, { color: theme.text }]}>Bed Grid Planner</Text>
            <Text style={[styles.toolDescText, { color: theme.textSecondary }]}>Layout grid & check companions</Text>
          </View>
          <SymbolView name="chevron.right" size={12} tintColor={theme.textSecondary} />
        </Pressable>

        {/* Wishlist Widget */}
        <Pressable
          style={({ pressed }) => [
            styles.toolCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
            pressed && styles.pressed
          ]}
          onPress={() => router.push('/wishlist')}
        >
          <View style={[styles.toolIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
            <SymbolView name="star.fill" size={16} tintColor="#F59E0B" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.toolTitleText, { color: theme.text }]}>Nurseries Wishlist</Text>
            <Text style={[styles.toolDescText, { color: theme.textSecondary }]}>Checklists & seed collection</Text>
          </View>
          <SymbolView name="chevron.right" size={12} tintColor={theme.textSecondary} />
        </Pressable>
      </View>
    );
  };

  // Render garden plant cards list widget
  const renderLibrary = () => {
    if (gardenList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <SymbolView name="camera.filters" size={64} tintColor={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Garden is Empty</Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            Identify plants using Claude AI and capture GPS locations to build your catalog.
          </Text>
          <Pressable
            style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/scan')}
          >
            <Text style={[styles.emptyBtnText, { color: themeMode === 'dark' ? '#070c09' : '#ffffff' }]}>Scan First Plant</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.gardenContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Plant Library</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView name="leaf.fill" size={10} tintColor={theme.primary} />
            <Text style={[styles.countBadgeLabel, { color: theme.text }]}>{stats.totalCount} Plants</Text>
          </View>
        </View>
        
        {gardenList.map(item => {
          const lastWateredDate = new Date(item.lastWatered);
          const nextWaterDate = new Date(lastWateredDate);
          nextWaterDate.setDate(lastWateredDate.getDate() + item.waterIntervalDays);
          const diffTime = nextWaterDate.getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const isThirsty = diffDays <= 0;
          const daysLabel = isThirsty
            ? 'Thirsty Now!'
            : `Water in ${diffDays} day${diffDays === 1 ? '' : 's'}`;

          const isPruningMonth = item.pruningMonth === currentMonth;
          const isFertilizingMonth = item.fertilizingMonth === currentMonth;

          return (
             <Pressable
               key={item.id}
               style={({ pressed }) => [pressed && styles.pressed]}
               onPress={() => router.push({ pathname: '/plant/[id]', params: { id: item.id } })}
             >
              <GlassCard style={styles.plantCard}>
                <Image source={{ uri: item.photoUri }} style={styles.thumbnail} contentFit="cover" />

                <View style={styles.plantInfo}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.plantNickname, { color: theme.text }]} numberOfLines={1}>
                        {item.customName}
                      </Text>
                      {item.healthStatus === 'Diseased' && (
                        <SymbolView name="medical.thermometer.fill" size={11} tintColor={theme.danger} />
                      )}
                    </View>
                    <Text style={[styles.plantSpecies, { color: theme.textSecondary }]} numberOfLines={1}>
                      {item.botanicalName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {isPruningMonth && (
                      <View style={[styles.seasonalBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                        <Text style={[styles.seasonalBadgeText, { color: theme.primary }]}>✂️ Prune</Text>
                      </View>
                    )}
                    {isFertilizingMonth && (
                      <View style={[styles.seasonalBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                        <Text style={[styles.seasonalBadgeText, { color: '#F59E0B' }]}>🧪 Feed</Text>
                      </View>
                    )}
                    {item.discoveryLocation?.placeName && !isPruningMonth && !isFertilizingMonth && (
                      <View style={styles.locationRow}>
                        <SymbolView name="mappin.circle" size={10} tintColor={theme.textSecondary} />
                        <Text style={[styles.locationLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                          {item.discoveryLocation.placeName}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <View
                    style={[
                      styles.countdownBadge,
                      {
                        backgroundColor: isThirsty ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        borderColor: isThirsty ? theme.danger : theme.success,
                      },
                    ]}
                  >
                    <Text style={[styles.countdownLabel, { color: isThirsty ? theme.danger : theme.success }]}>
                      {daysLabel}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.waterQuickBtn,
                      { backgroundColor: theme.primary },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => onWaterPlant(item.id)}
                  >
                    <SymbolView name="drop.fill" size={12} tintColor={themeMode === 'dark' ? '#070c09' : '#ffffff'} />
                  </Pressable>
                </View>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>
    );
  };

  // Weather Placeholder
  const renderWeatherPlaceholder = () => (
    <GlassCard style={[styles.weatherCard, { opacity: 0.6, borderStyle: 'dashed' }]}>
      <View style={styles.weatherRow}>
        <View style={styles.weatherLeftCol}>
          <SymbolView name="sun.max" size={20} tintColor={theme.textSecondary} />
          <View style={{ gap: 2 }}>
            <Text style={[styles.weatherTempText, { color: theme.textSecondary }]}>--°C</Text>
            <Text style={[styles.weatherDescText, { color: theme.textSecondary }]}>Awaiting Weather Sync...</Text>
          </View>
        </View>
        <View style={styles.weatherRightCol}>
          <SymbolView name="mappin.circle" size={10} tintColor={theme.textSecondary} />
          <Text style={[styles.weatherLocationText, { color: theme.textSecondary }]}>Awaiting GPS</Text>
        </View>
      </View>
    </GlassCard>
  );

  // Status Placeholder
  const renderCareStatusPlaceholder = () => (
    <GlassCard style={[styles.statusBanner, { opacity: 0.6, borderStyle: 'dashed' }]}>
      <View style={styles.bannerRow}>
        <View style={[styles.statusIndicator, { backgroundColor: theme.textSecondary }]} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.bannerTitle, { color: theme.textSecondary }]}>All Plants Hydrated (Preview)</Text>
          <Text style={[styles.bannerDesc, { color: theme.textSecondary }]}>
            No active water schedules. Scan plants to initiate tracking telemetry!
          </Text>
        </View>
      </View>
    </GlassCard>
  );

  const renderEditBanner = () => {
    if (!isEditingWidgets) return null;
    return (
      <GlassCard style={[styles.editModeBanner, { borderColor: theme.primary }]}>
        <View style={styles.editModeBannerRow}>
          <SymbolView name="slider.horizontal.3" size={16} tintColor={theme.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.editModeBannerTitle, { color: theme.text }]}>
              Dashboard Customizer
            </Text>
            <Text style={[styles.editModeBannerDesc, { color: theme.textSecondary }]}>
              Tap the eye icon to toggle visibility. Use up/down arrows to change the layout sequence.
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  // Switch wrapper mapper supporting dynamic reordering
  const renderWidget = (widgetId: string) => {
    const isVisible = visibleWidgets[widgetId];
    if (!isVisible && !isEditingWidgets) return null;

    let content = null;
    let label = '';

    switch (widgetId) {
      case 'weather':
        content = renderWeather() || renderWeatherPlaceholder();
        label = '🌡️ Local Weather & Frost Telemetry';
        break;
      case 'status':
        content = renderCareStatus() || (isEditingWidgets ? renderCareStatusPlaceholder() : null);
        label = '💧 Global Plant Care Hydration Banner';
        break;
      case 'tools':
        content = renderToolsGrid();
        label = '📐 Bed Planner & Wishlist Launcher';
        break;
      case 'library':
        content = renderLibrary();
        label = '🌿 Saved Plant Library Catalog';
        break;
      default:
        return null;
    }

    if (!content) return null;

    const idx = widgetOrder.indexOf(widgetId);
    const isFirst = idx === 0;
    const isLast = idx === widgetOrder.length - 1;

    return (
      <View key={widgetId} style={styles.widgetWrapper}>
        {isEditingWidgets && (
          <View style={[styles.editWidgetControls, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
            <Pressable
              onPress={() => onToggleWidgetVisibility(widgetId)}
              style={styles.widgetVisibleBtn}
            >
              <SymbolView
                name={isVisible ? 'eye.fill' : 'eye.slash.fill'}
                size={14}
                tintColor={isVisible ? theme.primary : theme.danger}
              />
              <Text style={[styles.widgetVisibleText, { color: isVisible ? theme.text : theme.textSecondary }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>

            <View style={styles.widgetMoveGroup}>
              <Pressable
                onPress={() => !isFirst && onMoveWidgetUp(widgetId)}
                style={[styles.widgetMoveBtn, isFirst && { opacity: 0.3 }]}
                disabled={isFirst}
              >
                <SymbolView name="chevron.up" size={10} tintColor={isFirst ? theme.textSecondary : theme.primary} />
              </Pressable>
              <Pressable
                onPress={() => !isLast && onMoveWidgetDown(widgetId)}
                style={[styles.widgetMoveBtn, isLast && { opacity: 0.3 }]}
                disabled={isLast}
              >
                <SymbolView name="chevron.down" size={10} tintColor={isLast ? theme.textSecondary : theme.primary} />
              </Pressable>
            </View>
          </View>
        )}

        <View style={!isVisible ? { opacity: 0.35 } : null}>
          {content}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Locked Premium Top Header Bar */}
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

        {/* Right Side: Account Profile Details & Phase 7 Layout Editor Widget Toggle */}
        <View style={styles.headerProfileRow}>
          <Pressable
            style={({ pressed }) => [
              styles.editWidgetsToggleBtn,
              isEditingWidgets && { backgroundColor: theme.primary },
              pressed && styles.pressed
            ]}
            onPress={onToggleEditWidgetsMode}
          >
            <SymbolView
              name={isEditingWidgets ? 'checkmark' : 'slider.horizontal.3'}
              size={12}
              tintColor={isEditingWidgets ? (themeMode === 'dark' ? '#070c09' : '#fff') : theme.primary}
            />
          </Pressable>

          <View style={styles.headerProfileRowInner}>
            <SymbolView name="person" size={18} tintColor={theme.primary} />
            <Text style={[styles.headerUserName, { color: theme.text }]} numberOfLines={1}>
              {userName || 'Ian B.'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.four }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Render dynamically reordered widgets */}
        {widgetOrder.map(id => renderWidget(id))}
      </ScrollView>
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
    gap: 12,
  },
  headerProfileRowInner: {
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
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBanner: {
    flexDirection: 'row',
    padding: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIndicator: {
    width: 8,
    height: 38,
    borderRadius: 4,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bannerDesc: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six * 1.5,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  emptyDesc: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  emptyBtn: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: Spacing.one,
    elevation: 2,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  gardenContainer: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.one,
    letterSpacing: -0.5,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 4,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  plantInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 56,
  },
  plantNickname: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  plantSpecies: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 56,
  },
  countdownBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  countdownLabel: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  waterQuickBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  pressed: {
    opacity: 0.8,
  },

  // Phase 5: Weather Dashboard Styles
  weatherCard: {
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherTempText: {
    fontSize: 16,
    fontWeight: '900',
  },
  weatherDescText: {
    fontSize: 10,
    fontWeight: '700',
  },
  weatherRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    padding: 4,
  },
  weatherLocationText: {
    fontSize: 9,
    fontWeight: '800',
    maxWidth: 110,
  },
  weatherWarningAlert: {
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherWarningText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
    flex: 1,
  },

  // Phase 5: Seasonal Badge Styles
  seasonalBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  seasonalBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Phase 7: Tools Quick Launch Styles
  toolsLaunchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  toolCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
  },
  toolIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  toolDescText: {
    fontSize: 7.5,
    fontWeight: '600',
    lineHeight: 10,
  },

  // Phase 7 Customizable Layout Editor Styles
  editWidgetsToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  widgetWrapper: {
    gap: Spacing.one,
  },
  editWidgetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  widgetVisibleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  widgetVisibleText: {
    fontSize: 9.5,
    fontWeight: '800',
    flex: 1,
  },
  widgetMoveGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetMoveBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
