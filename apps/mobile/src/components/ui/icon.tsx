import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';

type SymbolName = Extract<ComponentProps<typeof SymbolView>['name'], { ios?: unknown }>;

/** One line icon per meaning: SF Symbols on iOS, Material Symbols on Android. */
export const ICONS = {
  home: { ios: 'house', android: 'home' },
  transactions: { ios: 'list.bullet.rectangle', android: 'receipt_long' },
  profile: { ios: 'person.crop.circle', android: 'person' },
  overview: { ios: 'chart.pie', android: 'pie_chart' },
  savings: { ios: 'building.columns', android: 'savings' },
  calculator: { ios: 'percent', android: 'calculate' },
  expense: { ios: 'arrow.up.right', android: 'north_east' },
  income: { ios: 'arrow.down.left', android: 'south_west' },
  sun: { ios: 'sun.max', android: 'light_mode' },
  moon: { ios: 'moon', android: 'dark_mode' },
  menu: { ios: 'line.3.horizontal', android: 'menu' },
  close: { ios: 'xmark', android: 'close' },
  add: { ios: 'plus', android: 'add' },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  color: string;
  size?: number;
};

export function Icon({ name, color, size = 22 }: IconProps) {
  const { ios, android } = ICONS[name];
  return (
    <SymbolView
      name={{ ios, android, web: android }}
      tintColor={color}
      size={size}
      importantForAccessibility="no"
      accessibilityElementsHidden
    />
  );
}
