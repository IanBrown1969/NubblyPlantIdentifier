import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Spacing, BottomTabInset } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { BrandHeader } from '../components/brand-header';
import { Plant } from '../../models/PlantModel';

interface ExploreViewProps {
  searchQuery: string;
  selectedFilter: string;
  filteredPlants: Plant[];
  filterCategories: string[];
  wishlistIds: string[];
  onSearchChange: (text: string) => void;
  onFilterSelect: (category: string) => void;
  onResetFilters: () => void;
  onToggleWishlist: (plant: Plant) => void;
}

/**
 * Plant Encyclopedia & Care Catalog View.
 * Displays searchable indexes of popular plants with chip categories filters.
 */
export function ExploreView({
  searchQuery,
  selectedFilter,
  filteredPlants,
  filterCategories,
  wishlistIds = [],
  onSearchChange,
  onFilterSelect,
  onResetFilters,
  onToggleWishlist,
}: ExploreViewProps) {
  const { theme } = useAuth();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BrandHeader />

      {/* Search Header Banner */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={16}
            tintColor={theme.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search botanical or common names..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={onResetFilters} style={styles.clearBtn}>
              <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Filter Chips Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {filterCategories.map(cat => {
            const isSelected = selectedFilter === cat;
            const bgCol = isSelected ? theme.primary : theme.backgroundElement;
            const textCol = isSelected ? '#fff' : theme.text;
            const borderCol = isSelected ? 'transparent' : theme.cardBorder;

            return (
              <Pressable
                key={cat}
                onPress={() => onFilterSelect(cat)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: bgCol,
                    borderColor: borderCol,
                  },
                ]}
              >
                <Text style={[styles.chipLabel, { color: textCol }]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Encyclopedia List */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.four }]}>
        {filteredPlants.length === 0 ? (
          <View style={styles.noResults}>
            <SymbolView
              name={{ ios: 'leaf.arrow.triangle.circlepath', android: 'autorenew', web: 'autorenew' }}
              size={48}
              tintColor={theme.textSecondary}
            />
            <Text style={[styles.noResultsTitle, { color: theme.text }]}>No Matches Found</Text>
            <Text style={[styles.noResultsDesc, { color: theme.textSecondary }]}>
              Try adjusting your query or resetting category filters to browse all catalog items.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.resetBtn, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}
              onPress={onResetFilters}
            >
              <Text style={[styles.resetBtnText, { color: theme.text }]}>Reset All Filters</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredPlants.map(plant => {
              const isInWishlist = wishlistIds.includes(plant.id);
              return (
                <Pressable
                  key={plant.id}
                  style={({ pressed }) => [pressed && styles.pressed]}
                  onPress={() => router.push(`/plant/${plant.id}`)}
                >
                  <GlassCard style={styles.plantCard}>
                    {/* Left: Pressable navigation area (represented as View since parent card is now pressable) */}
                    <View style={styles.cardNavTouch}>
                      <Image source={{ uri: plant.photoUri }} style={styles.image} contentFit="cover" />

                      <View style={styles.info}>
                        <View style={styles.titles}>
                          <Text style={[styles.commonName, { color: theme.text }]} numberOfLines={1}>
                            {plant.commonName}
                          </Text>
                          <Text style={[styles.botanicalName, { color: theme.textSecondary }]} numberOfLines={1}>
                            {plant.botanicalName}
                          </Text>
                        </View>

                        {/* Small Quick Badges Grid */}
                        <View style={styles.badges}>
                          {/* Water Badge */}
                          <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
                            <SymbolView
                              name={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }}
                              size={8}
                              tintColor={theme.primary}
                            />
                            <Text style={[styles.badgeLabel, { color: theme.text }]}>{plant.waterIntervalDays}d</Text>
                          </View>

                          {/* Pet Safety Badge */}
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: plant.isPetSafe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                              },
                            ]}
                          >
                            <SymbolView
                              name={{
                                ios: plant.isPetSafe ? 'checkmark.circle.fill' : 'exclamationmark.circle.fill',
                                android: plant.isPetSafe ? 'check_circle' : 'error',
                                web: plant.isPetSafe ? 'check_circle' : 'error',
                              }}
                              size={8}
                              tintColor={plant.isPetSafe ? theme.success : theme.danger}
                            />
                            <Text style={[styles.badgeLabel, { color: plant.isPetSafe ? theme.success : theme.danger }]}>
                              {plant.isPetSafe ? 'Safe' : 'Toxic'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Right: Wishlist Star Button */}
                    <Pressable
                      style={({ pressed }) => [styles.wishlistStarBtn, pressed && styles.pressed]}
                      onPress={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(plant);
                      }}
                    >
                      <SymbolView
                        name={{
                          ios: isInWishlist ? 'star.fill' : 'star',
                          android: isInWishlist ? 'star' : 'star_border',
                          web: isInWishlist ? 'star' : 'star_border',
                        }}
                        size={18}
                        tintColor={isInWishlist ? '#F59E0B' : theme.textSecondary}
                      />
                    </Pressable>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}
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
    gap: 8,
  },
  headerUserName: {
    fontSize: 11,
    fontWeight: '900',
  },
  searchHeader: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
    marginTop: Spacing.one,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.three,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six * 1.5,
    gap: Spacing.two,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  noResultsDesc: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  resetBtn: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Spacing.one,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  grid: {
    gap: Spacing.two,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  cardNavTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wishlistStarBtn: {
    padding: Spacing.two,
    alignSelf: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    height: 64,
  },
  titles: {
    gap: 1,
  },
  commonName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  botanicalName: {
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
