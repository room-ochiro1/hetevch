import { Image } from 'expo-image';

import LOGO from '@/assets/images/logo.png';

/** The Хэтэвч mark (blue rounded square with the wallet), at any size. */
export function Logo({ size }: { size: number }) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Хэтэвч"
    />
  );
}
