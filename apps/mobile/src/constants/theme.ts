/**
 * Hetevch palette (light + dark). A calm white canvas with soft borderless cards: one primary
 * (indigo), cool neutrals, three pastel card tints (mint, peach, lavender) each with an "ink"
 * for icons/charts on it, and semantic income = green, expense = red. Text pairs meet WCAG AA.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#16181D',
    textSecondary: '#5F6474',
    background: '#FFFFFF',
    surface: '#F4F5F9',
    backgroundElement: '#ECEEF4',
    backgroundSelected: '#DFE3ED',
    border: '#E6E8EF',
    accent: '#4F46E5',
    accentText: '#4338CA',
    accentSoft: '#ECEBFF',
    onAccent: '#FFFFFF',
    income: '#067647',
    incomeSoft: '#E3F6EC',
    expense: '#D92D20',
    expenseSoft: '#FDECEA',
    danger: '#D92D20',
    mint: '#E3F3EF',
    mintInk: '#2E7A70',
    peach: '#FCEBDD',
    peachInk: '#B4541A',
    lavender: '#ECEAFB',
    lavenderInk: '#5B4FC4',
  },
  dark: {
    text: '#F1F3F9',
    textSecondary: '#9AA3B8',
    background: '#0B0D14',
    surface: '#161925',
    backgroundElement: '#1D2130',
    backgroundSelected: '#2A2F42',
    border: '#262B3A',
    accent: '#5B54E8',
    accentText: '#A5B4FC',
    accentSoft: '#1F1D45',
    onAccent: '#FFFFFF',
    income: '#3DD68C',
    incomeSoft: '#10291D',
    expense: '#FF7A73',
    expenseSoft: '#2F1715',
    danger: '#FF7A73',
    mint: '#122723',
    mintInk: '#7CD3C4',
    peach: '#2A1E17',
    peachInk: '#F2A877',
    lavender: '#1E1C38',
    lavenderInk: '#B3AAF5',
  },
} as const;

/** Pastel card tints and the ink color used for icons and charts on each. */
export type CardTone = 'mint' | 'peach' | 'lavender';
export const TONE_INK = { mint: 'mintInk', peach: 'peachInk', lavender: 'lavenderInk' } as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = { [K in ThemeColor]: string };

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

export const Radius = {
  small: 10,
  medium: 14,
  large: 20,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Adds an alpha channel to a `#RRGGBB` color, e.g. a soft tile behind a category emoji. */
export function withAlpha(hex: string, alpha: number): string {
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex}${channel.toString(16).padStart(2, '0')}`;
}
