/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0b1d12', // Deep forest spruce black
    background: '#f1f7f3', // Luminous herbal mist white
    backgroundElement: '#e1ede4', // Soft herbal green card backgrounds
    backgroundSelected: '#d1e3d6', // Muted sage selected state
    textSecondary: '#4c6354', // Dark botanical moss gray-green
    primary: '#00b894', // Rich luxurious mint-teal emerald
    primaryLight: '#55efc4',
    accent: '#0984e3', // Deep ocean-sky water blue
    cardBg: 'rgba(255, 255, 255, 0.88)', // Frosted glass light card
    cardBorder: 'rgba(0, 184, 148, 0.1)', // Fine herbal-tinted translucent border
    success: '#00b894',
    warning: '#f39c12',
    danger: '#d63031',
  },
  dark: {
    text: '#f5fdf8', // Pearlescent crisp minty white
    background: '#070c09', // Midnight Forest Obsidian (extremely deep, high contrast black-green)
    backgroundElement: '#121a14', // Obsidian emerald green blocks
    backgroundSelected: '#1a2b21',
    textSecondary: '#8ba896', // Sophisticated elegant sage green
    primary: '#00ffb3', // Vibrant electric neon mint green (glows off screen)
    primaryLight: '#9cffd9',
    accent: '#00d2ff', // Electric Aqua Blue
    cardBg: 'rgba(18, 28, 22, 0.68)', // Obsidian frosted glass card
    cardBorder: 'rgba(0, 255, 179, 0.12)', // Luminous glow-tinted frosted glass border
    success: '#00ffb3',
    warning: '#fbc531', // Luminous amber glow
    danger: '#ff4d4d', // Neon coral red alert
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
