import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { GridCell, CompanionStatus } from '../../controllers/usePlannerController';

interface PlannerViewProps {
  loading: boolean;
  grid: GridCell[];
  selectedCell: { row: number; col: number } | null;
  gardenList: any[];
  catalogList: any[];
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  onPlacePlant: (row: number, col: number, plantId: string | null, commonName: string | null) => Promise<void>;
  onClearGrid: () => Promise<void>;
  getCellCompatibility: (row: number, col: number, testPlantName: string | null) => CompanionStatus;
  onBack: () => void;
}

export function PlannerView({
  loading,
  grid,
  selectedCell,
  gardenList,
  catalogList,
  setSelectedCell,
  onPlacePlant,
  onClearGrid,
  getCellCompatibility,
  onBack,
}: PlannerViewProps) {
  const { theme } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Recalibrating Bed Layout grids...</Text>
      </View>
    );
  }

  // Group items to place: Combine saved garden and static catalog nicely
  const availablePlants = [
    ...gardenList.map(g => ({ id: g.id, name: g.customName || g.commonName, type: 'My Garden' })),
    ...catalogList.map(c => ({ id: c.id, name: c.commonName, type: 'Encyclopedia' })),
  ];

  // Remove duplicate names to keep select picker concise
  const uniquePlants = availablePlants.filter(
    (value, index, self) => self.findIndex(t => t.name === value.name) === index
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Brand Header Bar */}
      <View style={[styles.brandHeaderBar, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <SymbolView name="chevron.left" size={16} tintColor={theme.text} />
        </Pressable>
        <Text style={[styles.brandTitleText, { color: theme.text }]}>BED GRID LAYOUT PLANNER</Text>
        <Pressable onPress={onClearGrid} style={styles.clearBtn}>
          <SymbolView name="trash.fill" size={14} tintColor={theme.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Planner Header Guide */}
        <GlassCard style={styles.introCard}>
          <View style={styles.introHeader}>
            <SymbolView name="square.grid.3x3.fill" size={18} tintColor={theme.primary} />
            <Text style={[styles.introTitle, { color: theme.text }]}>Interactive Bed Design</Text>
          </View>
          <Text style={[styles.introDesc, { color: theme.textSecondary }]}>
            Map out physical garden beds, configure square-foot spacings, and check companion planting compatibility rules automatically.
          </Text>
        </GlassCard>

        {/* 3x3 Flex Grid Matrix */}
        <View style={styles.gridOuterFrame}>
          <View style={styles.gridContainer}>
            {[0, 1, 2].map(r => (
              <View key={r} style={styles.gridRow}>
                {[0, 1, 2].map(c => {
                  const cell = grid.find(g => g.row === r && g.col === c);
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const plantName = cell?.commonName || null;

                  // Assess neighboring compatibility
                  const compatibility = cell ? getCellCompatibility(r, c, plantName) : 'neutral';
                  
                  let borderGlowColor: string = theme.cardBorder;
                  if (isSelected) borderGlowColor = theme.primary;
                  else if (compatibility === 'companion') borderGlowColor = theme.success;
                  else if (compatibility === 'antagonist') borderGlowColor = theme.danger;

                  return (
                    <Pressable
                      key={c}
                      style={[
                        styles.gridCell,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: borderGlowColor,
                          borderWidth: isSelected || compatibility !== 'neutral' ? 2 : 1.5,
                        }
                      ]}
                      onPress={() => setSelectedCell({ row: r, col: c })}
                    >
                      {plantName ? (
                        <View style={styles.cellContent}>
                          <SymbolView
                            name="leaf.fill"
                            size={16}
                            tintColor={compatibility === 'companion' ? theme.success : (compatibility === 'antagonist' ? theme.danger : theme.primary)}
                          />
                          <Text style={[styles.cellText, { color: theme.text }]} numberOfLines={2}>
                            {plantName}
                          </Text>
                          {compatibility !== 'neutral' && (
                            <View style={[
                              styles.compBadge,
                              { backgroundColor: compatibility === 'companion' ? theme.success : theme.danger }
                            ]}>
                              <Text style={styles.compBadgeText}>
                                {compatibility === 'companion' ? 'GOOD' : 'BAD'}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.cellContentEmpty}>
                          <SymbolView name="plus" size={12} tintColor={theme.textSecondary} />
                          <Text style={[styles.cellTextEmpty, { color: theme.textSecondary }]}>Add Plant</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Companion Planting Interactive Instructions Card */}
        {selectedCell === null && (
          <GlassCard style={styles.legendCard}>
            <Text style={[styles.legendTitle, { color: theme.text }]}>Companion Planting Guide Legend</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendColorBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: theme.success }]} />
              <Text style={[styles.legendLabelText, { color: theme.text }]}>
                <Text style={{ fontWeight: '800', color: theme.success }}>Green Glow:</Text> Beneficial companions (e.g. Tomatoes + Basil grow stronger together).
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColorBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: theme.danger }]} />
              <Text style={[styles.legendLabelText, { color: theme.text }]}>
                <Text style={{ fontWeight: '800', color: theme.danger }}>Red Glow:</Text> Conflicting species (e.g. Snake Plant + Fern have conflicting humidity needs).
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Slide-Up Select Picker Sheet */}
        {selectedCell && (
          <GlassCard style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>
                Place Plant at Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
              </Text>
              <Pressable onPress={() => setSelectedCell(null)} style={styles.pickerCloseBtn}>
                <SymbolView name="xmark.circle.fill" size={16} tintColor={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.pickerList} contentContainerStyle={{ gap: 8 }}>
              {/* Clear Slot Option */}
              <Pressable
                key="clear-slot"
                style={({ pressed }) => [
                  styles.pickerItem,
                  { backgroundColor: theme.background, borderColor: theme.cardBorder },
                  pressed && styles.pressed
                ]}
                onPress={() => onPlacePlant(selectedCell.row, selectedCell.col, null, null)}
              >
                <SymbolView name="minus.circle.fill" size={14} tintColor={theme.danger} />
                <Text style={[styles.pickerItemName, { color: theme.danger }]}>Empty Grid Slot</Text>
              </Pressable>

              {/* Plant selection with compatibility precheck */}
              {uniquePlants.map((plant, index) => {
                const comp = getCellCompatibility(selectedCell.row, selectedCell.col, plant.name);
                
                let compLabel = '';
                let compColor: string = theme.textSecondary;
                if (comp === 'companion') {
                  compLabel = ' (Beneficial Companion!)';
                  compColor = theme.success;
                } else if (comp === 'antagonist') {
                  compLabel = ' (Conflicting Species!)';
                  compColor = theme.danger;
                }

                return (
                  <Pressable
                    key={plant.id}
                    style={({ pressed }) => [
                      styles.pickerItem,
                      { backgroundColor: theme.background, borderColor: theme.cardBorder },
                      pressed && styles.pressed
                    ]}
                    onPress={() => onPlacePlant(selectedCell.row, selectedCell.col, plant.id, plant.name)}
                  >
                    <SymbolView name="leaf.fill" size={12} tintColor={theme.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerItemName, { color: theme.text }]}>
                        {plant.name}
                        <Text style={{ fontSize: 9, fontWeight: '800', color: compColor }}>{compLabel}</Text>
                      </Text>
                      <Text style={[styles.pickerItemType, { color: theme.textSecondary }]}>{plant.type}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backBtn: {
    padding: Spacing.one,
  },
  clearBtn: {
    padding: Spacing.one,
  },
  brandTitleText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  introCard: {
    gap: 8,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  introDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  gridOuterFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.one,
  },
  gridContainer: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    gap: 10,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  gridCell: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    elevation: 1,
  },
  cellContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: '100%',
    width: '100%',
  },
  cellContentEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cellText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  cellTextEmpty: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  compBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  compBadgeText: {
    fontSize: 6,
    fontWeight: '900',
    color: '#fff',
  },
  legendCard: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  legendLabelText: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 15,
    flex: 1,
  },
  pickerCard: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  pickerCloseBtn: {
    padding: 2,
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerItemName: {
    fontSize: 11,
    fontWeight: '800',
  },
  pickerItemType: {
    fontSize: 8,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
