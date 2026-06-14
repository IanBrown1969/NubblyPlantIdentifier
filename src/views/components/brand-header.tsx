import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface BrandHeaderProps {
  /** Optional extra controls rendered to the left of the profile name (e.g. widget-edit toggle). */
  extraControls?: React.ReactNode;
}

/**
 * Shared top header bar: logo + NUBBLYPLANT title + profile name.
 * Used by HomeView, ExploreView, and ScanView.
 */
export function BrandHeader({ extraControls }: BrandHeaderProps) {
  const { theme, userName } = useAuth();

  return (
    <View style={[styles.brandHeaderBar, { backgroundColor: theme.background, borderBottomColor: theme.cardBorder }]}>
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

      <View style={styles.headerProfileRow}>
        {extraControls}
        <SymbolView
          name={{ ios: 'person', android: 'person', web: 'person' }}
          size={18}
          tintColor={theme.primary}
        />
        <Text style={[styles.headerUserName, { color: theme.text }]} numberOfLines={1}>
          {userName || 'Ian B.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: 52,
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
});
