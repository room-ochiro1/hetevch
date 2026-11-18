/**
 * Rules for categories users add themselves (owner_id set). Built-in categories have no owner
 * and only admins change them. The same limits are checked in the database
 * (supabase/migrations/*_user_categories.sql), so keep the numbers in sync.
 */

/** Longest name, in characters (code points, as Postgres char_length counts them). */
export const CATEGORY_NAME_MAX = 40;

/** Longest icon in code points: a ZWJ family or a tagged flag emoji is several. */
export const CATEGORY_ICON_MAX = 16;

/** User categories sort after the built-in ones (those use 10–90). */
export const USER_CATEGORY_SORT_ORDER = 1000;

const ZWJ = 0x200d;
const VARIATION_SELECTOR = 0xfe0f;
const KEYCAP = 0x20e3;
const SINGLE_SYMBOLS = new Set([
  0x00a9, 0x00ae, 0x203c, 0x2049, 0x2122, 0x2139, 0x24c2, 0x3030, 0x303d, 0x3297, 0x3299,
]);

const isRegionalIndicator = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff;
const isSkinTone = (cp: number) => cp >= 0x1f3fb && cp <= 0x1f3ff;
const isTag = (cp: number) => cp >= 0xe0020 && cp <= 0xe007f;

/** Code points that start an emoji: pictographs, dingbats, arrows, shapes and a few symbols. */
function isPictograph(cp: number): boolean {
  return (
    (cp >= 0x1f000 && cp <= 0x1faff && !isRegionalIndicator(cp)) ||
    (cp >= 0x2600 && cp <= 0x27bf) ||
    (cp >= 0x2300 && cp <= 0x23ff) ||
    (cp >= 0x2b00 && cp <= 0x2bff) ||
    (cp >= 0x2190 && cp <= 0x21ff) ||
    (cp >= 0x2900 && cp <= 0x297f) ||
    (cp >= 0x25a0 && cp <= 0x25ff) ||
    SINGLE_SYMBOLS.has(cp)
  );
}

/**
 * True when the text is exactly one emoji, including skin tones, ZWJ sequences (👨‍👩‍👧),
 * flags (🇲🇳), keycaps (1️⃣) and tagged flags. Works by code point because Hermes (React
 * Native) lacks Intl.Segmenter.
 */
export function isSingleEmoji(value: string): boolean {
  const cps = Array.from(value, (char) => char.codePointAt(0) ?? 0);
  if (cps.length === 0 || cps.length > CATEGORY_ICON_MAX) return false;
  const [first = 0, second, third] = cps;

  if ((first >= 0x30 && first <= 0x39) || first === 0x23 || first === 0x2a) {
    return (
      (cps.length === 2 && second === KEYCAP) ||
      (cps.length === 3 && second === VARIATION_SELECTOR && third === KEYCAP)
    );
  }
  if (isRegionalIndicator(first)) {
    return cps.length === 2 && second !== undefined && isRegionalIndicator(second);
  }

  let i = 0;
  while (i < cps.length) {
    if (!isPictograph(cps[i] ?? 0)) return false;
    i += 1;
    while (i < cps.length) {
      const cp = cps[i] ?? 0;
      if (cp !== VARIATION_SELECTOR && !isSkinTone(cp) && !isTag(cp)) break;
      i += 1;
    }
    if (i === cps.length) return true;
    if (cps[i] !== ZWJ) return false;
    i += 1;
  }
  return false;
}

/** Mongolian error for a user category's name and icon, or null when both are fine. */
export function categoryDraftError(name: string, icon: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Ангиллын нэрээ бичнэ үү.';
  if (Array.from(trimmed).length > CATEGORY_NAME_MAX) {
    return `Нэр ${CATEGORY_NAME_MAX} тэмдэгтээс ихгүй байна.`;
  }
  if (!icon.trim()) return 'Ангилалдаа emoji сонгоно уу.';
  if (!isSingleEmoji(icon.trim())) return 'Зөвхөн нэг emoji оруулна уу.';
  return null;
}
