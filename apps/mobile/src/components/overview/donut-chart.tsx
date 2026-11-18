import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { hitTest, ringGeometry } from '@/components/overview/donut-hit';

export type DonutSegment = { key: string; value: number; color: string };

type DonutChartProps = {
  segments: readonly DonutSegment[];
  /** Ring color when there's nothing to show, and behind the segments. */
  trackColor: string;
  /** Spoken summary; the ring itself is decorative for screen readers. */
  accessibilityLabel: string;
  size?: number;
  thickness?: number;
  /** The tapped segment: drawn thicker while the others fade. */
  selectedKey?: string | null;
  /** Tapping a segment selects it, tapping it again (or outside the ring) clears it. */
  onSelect?: (key: string | null) => void;
  /** Tapping the hole while a segment is selected. */
  onPressCenter?: () => void;
  /** Shown in the hole, e.g. the total. */
  children?: ReactNode;
};

/** Gap between segments along the ring, in px (the surface shows through, no outlines). */
const GAP = 3;
/** How much thicker the selected segment is drawn. */
const GROW = 8;

/** Part-to-whole ring, clockwise from 12 o'clock, largest segment first. Segments are tappable. */
export function DonutChart({
  segments,
  trackColor,
  accessibilityLabel,
  size = 216,
  thickness = 22,
  selectedKey = null,
  onSelect,
  onPressCenter,
  children,
}: DonutChartProps) {
  const ring = ringGeometry(segments, size, thickness, GROW);
  const { center, radius, circumference, lengths, starts } = ring;
  const gap = segments.length > 1 ? GAP : 0;

  function handlePress(event: GestureResponderEvent) {
    const hit = hitTest(event.nativeEvent.locationX, event.nativeEvent.locationY, ring);
    if (hit.type === 'center') {
      if (selectedKey) onPressCenter?.();
    } else if (hit.type === 'outside') {
      onSelect?.(null);
    } else {
      onSelect?.(hit.key === selectedKey ? null : hit.key);
    }
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width: size, height: size }}>
      <Pressable accessible={false} onPress={onSelect ? handlePress : undefined} style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={thickness} fill="none" />
          <G rotation={-90} origin={`${center}, ${center}`}>
            {segments.map((segment, i) => {
              const length = lengths[i] ?? 0;
              if (length <= 0) return null;
              const selected = segment.key === selectedKey;
              return (
                <Circle
                  key={segment.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={selected ? thickness + GROW : thickness}
                  strokeOpacity={selectedKey && !selected ? 0.3 : 1}
                  fill="none"
                  strokeDasharray={`${Math.max(0.5, length - gap)} ${circumference}`}
                  strokeDashoffset={-(starts[i] ?? 0)}
                />
              );
            })}
          </G>
        </Svg>
      </Pressable>
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
