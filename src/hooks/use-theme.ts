/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

export function useTheme() {
  const scheme = useColorScheme();

  try {
    const auth = useAuth();
    if (auth && auth.theme) {
      return auth.theme;
    }
  } catch {
    // Fallback if called outside AuthProvider
  }

  const theme = scheme === 'unspecified' || !scheme ? 'dark' : scheme;

  return Colors[theme];
}

