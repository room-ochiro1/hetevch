import { Colors, type Palette } from '@/constants/theme';

/** The app's palette. The app is light only (app.json userInterfaceStyle: light). */
export function useTheme(): Palette {
  return Colors.light;
}
