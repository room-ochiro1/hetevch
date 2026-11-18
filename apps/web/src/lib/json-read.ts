/**
 * Narrowing readers for jsonb returned by the admin detail RPCs, so their shapes are checked
 * at the boundary instead of trusted. Missing or wrong-typed fields fall back to empty values.
 */
export type JsonObject = Record<string, unknown>;

export function obj(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

export function list(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.map(obj) : [];
}

/** Numbers arrive as JSON numbers (or numeric strings for big values). */
export function num(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

export function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function textOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function numOrNull(value: unknown): number | null {
  return value === null || value === undefined ? null : num(value);
}
