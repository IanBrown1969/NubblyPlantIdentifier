import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator, TextInput, Linking } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../components/glass-card';
import { WishlistItem } from '../../models/GardenModel';
import { getOnlineNurseries } from '../../services/NurseryService';

interface WishlistViewProps {
  loading: boolean;
  wishlist: WishlistItem[];
  onToggleBought: (id: string, isBought: boolean) => Promise<boolean>;
  onRemoveItem: (id: string) => Promise<boolean>;
  onImportToGarden: (item: WishlistItem, nickname?: string) => Promise<boolean>;
  onBack: () => void;
}

export function WishlistView({
  loading,
  wishlist,
  onToggleBought,
  onRemoveItem,
  onImportToGarden,
  onBack,
}: WishlistViewProps) {
  const { theme, themeMode } = useAuth();
  
  // Quick-import modal nickname state
  const [importingItem, setImportingItem] = useState<WishlistItem | null>(null);
  const [nickname, setNickname] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Online nursery expansion state
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleOpenNursery = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn('[WishlistView] Cannot open URL:', url);
      }
    } catch (e) {
      console.error('[WishlistView] Error opening nursery URL:', e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading nursery wishlists...</Text>
      </View>
    );
  }

  const handleImport = async () => {
    if (!importingItem) return;
    setIsImporting(true);
    try {
      const success = await onImportToGarden(importingItem, nickname);
      if (success) {
        setImportingItem(null);
        setNickname('');
      }
    } catch (e) {
      console.error('[WishlistView] Error importing wishlist plant:', e);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Bar */}
      <View style={[styles.brandHeaderBar, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={16}
            tintColor={theme.text}
          />
        </Pressable>
        <Text style={[styles.brandTitleText, { color: theme.text }]}>NURSERY SHOPPING LIST</Text>
        <View style={styles.badgeFrame}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>{wishlist.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro Info */}
        <GlassCard style={styles.introCard}>
          <View style={styles.introHeader}>
            <SymbolView
              name={{ ios: 'star.fill', android: 'star', web: 'star' }}
              size={18}
              tintColor="#F59E0B"
            />
            <Text style={[styles.introTitle, { color: theme.text }]}>Nursery Shopping List</Text>
          </View>
          <Text style={[styles.introDesc, { color: theme.textSecondary }]}>
            Collect species cards from the encyclopedia, check them off as purchased at your local organic nursery, and instantly import them into your physical garden collection!
          </Text>
        </GlassCard>

        {/* Quick nickname input dialog modal overlay */}
        {importingItem && (
          <GlassCard style={styles.importModal}>
            <Text style={[styles.importTitle, { color: theme.text }]}>Import {importingItem.commonName}</Text>
            <Text style={[styles.importDesc, { color: theme.textSecondary }]}>
              Enter a custom nickname to add this species into your garden SQLite collection:
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
              placeholder={`Nickname (e.g. My ${importingItem.commonName})`}
              placeholderTextColor={theme.textSecondary}
              value={nickname}
              onChangeText={setNickname}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancelBtn, { backgroundColor: theme.backgroundElement }]}
                onPress={() => {
                  setImportingItem(null);
                  setNickname('');
                }}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalConfirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <ActivityIndicator size="small" color={themeMode === 'dark' ? '#070c09' : '#fff'} />
                ) : (
                  <Text style={[styles.modalConfirmText, { color: themeMode === 'dark' ? '#070c09' : '#fff' }]}>Save to Garden</Text>
                )}
              </Pressable>
            </View>
          </GlassCard>
        )}

        {/* Wishlist Checklist Cards */}
        {wishlist.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView
              name={{ ios: 'star.bubble.fill', android: 'star', web: 'star' }}
              size={38}
              tintColor={theme.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Shopping Basket is Empty</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Navigate to the Searchable Encyclopedia (Explore tab) and tap the ⭐️ star button on catalog profiles to queue plants here!
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {wishlist.map(item => {
              const nurseries = getOnlineNurseries(item.commonName, item.botanicalName);
              const isExpanded = expandedItemId === item.id;
              
              return (
                <GlassCard
                  key={item.id}
                  style={[
                    styles.itemCard,
                    item.isBought && { opacity: 0.65, borderColor: theme.success }
                  ]}
                >
                  {/* Primary Row Info */}
                  <View style={styles.itemCardMainRow}>
                    <Pressable
                      style={styles.checkboxTouch}
                      onPress={() => {
                        onToggleBought(item.id, !item.isBought);
                        if (!item.isBought) {
                          setExpandedItemId(null); // Collapse drawer when marked as bought
                        }
                      }}
                    >
                      <SymbolView
                        name={{
                          ios: item.isBought ? 'checkmark.square.fill' : 'square',
                          android: item.isBought ? 'check_box' : 'check_box_outline_blank',
                          web: item.isBought ? 'check_box' : 'check_box_outline_blank',
                        }}
                        size={20}
                        tintColor={item.isBought ? theme.success : theme.textSecondary}
                      />
                    </Pressable>

                    <Image source={{ uri: item.photoUri }} style={styles.thumbnail} contentFit="cover" />

                    <View style={styles.itemInfo}>
                      <Text
                        style={[
                          styles.itemCommonName,
                          { color: theme.text },
                          item.isBought && styles.purchasedText
                        ]}
                        numberOfLines={1}
                      >
                        {item.commonName}
                      </Text>
                      <View style={styles.botanicalRow}>
                        <Text style={[styles.itemBotanicalName, { color: theme.textSecondary }]} numberOfLines={1}>
                          {item.botanicalName}
                        </Text>
                        {!item.isBought && (
                          <Pressable
                            style={[
                              styles.buyOnlineTrigger,
                              isExpanded && styles.buyOnlineTriggerActive
                            ]}
                            onPress={() => setExpandedItemId(isExpanded ? null : item.id)}
                          >
                            <SymbolView
                              name={{ ios: 'globe', android: 'language', web: 'language' }}
                              size={10}
                              tintColor={theme.accent}
                            />
                            <Text style={[styles.buyOnlineTriggerText, { color: theme.accent }]}>
                              {isExpanded ? 'Hide Stores' : 'Buy Online'}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>

                    {/* Import to Garden Action if Bought, otherwise Delete Action */}
                    <View style={styles.rightActions}>
                      {item.isBought ? (
                        <Pressable
                          style={({ pressed }) => [
                            styles.importBtn,
                            { backgroundColor: theme.primary },
                            pressed && styles.pressed
                          ]}
                          onPress={() => setImportingItem(item)}
                        >
                          <SymbolView
                            name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                            size={12}
                            tintColor={themeMode === 'dark' ? '#070c09' : '#fff'}
                          />
                          <Text style={[styles.importBtnText, { color: themeMode === 'dark' ? '#070c09' : '#fff' }]}>Import</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                          onPress={() => onRemoveItem(item.id)}
                        >
                          <SymbolView
                            name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }}
                            size={14}
                            tintColor={theme.danger}
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Expanded Nurseries List */}
                  {isExpanded && !item.isBought && (
                    <View style={[styles.nurseriesSection, { borderTopColor: theme.cardBorder }]}>
                      <View style={styles.nurseriesHeader}>
                        <SymbolView
                          name={{ ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }}
                          size={12}
                          tintColor={theme.accent}
                        />
                        <Text style={[styles.nurseriesTitle, { color: theme.accent }]}>
                          RECOMMENDED ONLINE STORES
                        </Text>
                      </View>
                      
                      <View style={styles.nurseryOptionsList}>
                        {nurseries.map((nursery, idx) => (
                          <Pressable
                            key={nursery.url}
                            style={({ pressed }) => [
                              styles.nurseryRow,
                              { backgroundColor: theme.backgroundElement },
                              pressed && styles.pressed
                            ]}
                            onPress={() => handleOpenNursery(nursery.url)}
                          >
                            <View style={[styles.nurseryLogo, { backgroundColor: theme.backgroundSelected }]}>
                              <Text style={[styles.nurseryLogoText, { color: theme.primary }]}>
                                {nursery.logoText}
                              </Text>
                            </View>
                            <View style={styles.nurseryMeta}>
                              <Text style={[styles.nurseryName, { color: theme.text }]} numberOfLines={1}>
                                {nursery.name}
                              </Text>
                              <Text style={[styles.nurseryDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                                {nursery.description}
                              </Text>
                            </View>
                            <View style={styles.nurseryAction}>
                              <SymbolView
                                name={{ ios: 'arrow.up.right.circle.fill', android: 'arrow_outward', web: 'arrow_outward' }}
                                size={18}
                                tintColor={theme.accent}
                              />
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </GlassCard>
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
  brandTitleText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  badgeFrame: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
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
  emptyContainer: {
    borderRadius: 16,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  listContainer: {
    gap: Spacing.two,
  },
  itemCard: {
    padding: 0,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  itemCardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  botanicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  buyOnlineTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(233, 216, 166, 0.12)',
  },
  buyOnlineTriggerActive: {
    backgroundColor: 'rgba(233, 216, 166, 0.25)',
  },
  buyOnlineTriggerText: {
    fontSize: 9,
    fontWeight: '800',
  },
  nurseriesSection: {
    borderTopWidth: 1,
    padding: 12,
    gap: 8,
  },
  nurseriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nurseriesTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nurseryOptionsList: {
    gap: 6,
    marginTop: 4,
  },
  nurseryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    gap: 10,
  },
  nurseryLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nurseryLogoText: {
    fontSize: 11,
    fontWeight: '900',
  },
  nurseryMeta: {
    flex: 1,
    gap: 1,
  },
  nurseryName: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  nurseryDesc: {
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 12,
  },
  nurseryAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTouch: {
    padding: 4,
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemCommonName: {
    fontSize: 14,
    fontWeight: '800',
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  itemBotanicalName: {
    fontSize: 10.5,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  rightActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  importBtnText: {
    fontSize: 9,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 8,
  },
  pressed: {
    opacity: 0.8,
  },

  // Inline modal styles
  importModal: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  importTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  importDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  nicknameInput: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
