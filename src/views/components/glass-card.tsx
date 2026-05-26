import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface GlassCardProps extends ViewProps {
  intensity?: number; // Visual frosted intensity
  children: React.ReactNode;
}

/**
 * A highly premium presentational frosted glass container (Glassmorphism card).
 * Blends a subtle semi-transparent background color with fine borders and dropshadows.
 */
export function GlassCard({ children, style, ...props }: GlassCardProps) {
  const { theme } = useAuth();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    overflow: 'hidden',
    
    // Sleek shadow elevations for native devices
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
});
