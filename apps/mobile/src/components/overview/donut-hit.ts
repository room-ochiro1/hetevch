/** Where the ring's segments sit along its circumference, clockwise from 12 o'clock. */
export type RingGeometry = {
  center: number;
  radius: number;
  thickness: number;
  circumference: number;
  keys: readonly string[];
  starts: readonly number[];
  lengths: readonly number[];
};

export type RingHit = { type: 'center' } | { type: 'outside' } | { type: 'segment'; key: string };

/** Extra px around the ring that still count as a tap on it (fingers are wide). */
const SLOP = 14;

export function ringGeometry(
  segments: readonly { key: string; value: number }[],
  size: number,
  thickness: number,
  grow: number,
): RingGeometry {
  // Room for the selected segment to grow without being clipped.
  const radius = (size - thickness - grow) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const lengths = segments.map((s) => (total > 0 ? (s.value / total) * circumference : 0));
  const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((sum, l) => sum + l, 0));
  return { center: size / 2, radius, thickness, circumference, keys: segments.map((s) => s.key), starts, lengths };
}

/** What a tap at (x, y) inside the chart's square landed on. */
export function hitTest(x: number, y: number, ring: RingGeometry): RingHit {
  const dx = x - ring.center;
  const dy = y - ring.center;
  const distance = Math.hypot(dx, dy);
  if (distance < ring.radius - ring.thickness / 2 - SLOP / 2) return { type: 'center' };
  if (distance > ring.radius + ring.thickness / 2 + SLOP) return { type: 'outside' };

  // Clockwise from 12 o'clock (screen y grows downward), as the segments are drawn.
  const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
  const position = (angle / (2 * Math.PI)) * ring.circumference;
  const index = ring.starts.findIndex(
    (start, i) => position >= start && position < start + (ring.lengths[i] ?? 0),
  );
  const key = ring.keys[index];
  return key === undefined ? { type: 'outside' } : { type: 'segment', key };
}
