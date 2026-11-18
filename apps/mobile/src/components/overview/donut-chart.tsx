import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export type DonutSegment = { key: string; value: number; color: string };

type DonutChartProps = {
  segments: readonly DonutSegment[];
  /** Ring color when there's nothing to show, and behind the segments. */
  trackColor: string;
  /** Spoken summary; the ring itself is decorative for screen readers. */
  accessibilityLabel: string;
  size?: number;
  thickness?: number;
  /** Shown in the hole, e.g. the total. */
  children?: ReactNode;
};

/** Gap between segments along the ring, in px (the surface shows through, no outlines). */
const GAP = 3;

/** Part-to-whole ring, clockwise from 12 o'clock, largest segment first. */
export function DonutChart({
  segments,
  trackColor,
  accessibilityLabel,
  size = 216,
  thickness = 22,
  children,
}: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const gap = segments.length > 1 ? GAP : 0;
  const lengths = segments.map((s) => (total > 0 ? (s.value / total) * circumference : 0));
  const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((sum, l) => sum + l, 0));
  const center = size / 2;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={thickness} fill="none" />
        <G rotation={-90} origin={`${center}, ${center}`}>
          {segments.map((segment, i) => {
            const length = lengths[i] ?? 0;
            if (length <= 0) return null;
            return (
              <Circle
                key={segment.key}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={`${Math.max(0.5, length - gap)} ${circumference}`}
                strokeDashoffset={-(starts[i] ?? 0)}
              />
            );
          })}
        </G>
      </Svg>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.hole]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hole: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
  },
});
