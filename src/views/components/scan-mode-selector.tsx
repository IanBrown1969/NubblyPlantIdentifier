import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useAuth } from '../../context/AuthContext';

interface ScanModeSelectorProps {
  scanMode: 'identity' | 'diagnosis';
  setScanMode: (mode: 'identity' | 'diagnosis') => void;
}

/**
 * Segmented two-button toggle: Botanical ID ↔ Plant Doctor.
 */
export function ScanModeSelector({ scanMode, setScanMode }: ScanModeSelectorProps) {
  const { theme, themeMode } = useAuth();

  const activeTextColor = themeMode === 'dark' ? '#070c09' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
      <Pressable
        style={[styles.tab, scanMode === 'identity' && { backgroundColor: theme.primary }]}
        onPress={() => setScanMode('identity')}
      >
        <SymbolView
          name="leaf.fill"
          size={12}
          tintColor={scanMode === 'identity' ? activeTextColor : theme.textSecondary}
        />
        <Text style={[styles.tabLabel, { color: scanMode === 'identity' ? activeTextColor : theme.textSecondary }]}>
          Botanical ID
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, scanMode === 'diagnosis' && { backgroundColor: theme.primary }]}
        onPress={() => setScanMode('diagnosis')}
      >
        <SymbolView
          name="medical.thermometer.fill"
          size={12}
          tintColor={scanMode === 'diagnosis' ? activeTextColor : theme.textSecondary}
        />
        <Text style={[styles.tabLabel, { color: scanMode === 'diagnosis' ? activeTextColor : theme.textSecondary }]}>
          Plant Doctor
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 4,
    width: '100%',
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
});
