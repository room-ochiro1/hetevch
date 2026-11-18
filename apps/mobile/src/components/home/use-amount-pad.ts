import { useState } from 'react';

/** A key on the amount pad. `'000'` speeds up round tögrög sums; `'.'` is for dollar cents. */
export type PadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '000' | '.' | 'back';

/** Whole-number digits allowed: enough for 999 billion, under the column's limit. */
const MAX_DIGITS = 12;

/** The next typed text after `key`; invalid keys leave it unchanged. */
export function nextAmountText(current: string, key: PadKey, allowDecimal: boolean): string {
  if (key === 'back') return current.slice(0, -1);
  if (key === '.') {
    if (!allowDecimal || current.includes('.')) return current;
    return `${current || '0'}.`;
  }
  const [whole, decimals] = current.split('.');
  if (decimals !== undefined) {
    return key !== '000' && decimals.length < 2 ? current + key : current;
  }
  // No leading zeros: "0" then "5" is "5", and zeros alone stay empty.
  if (whole === '' || whole === '0') {
    return key === '0' || key === '000' ? '' : key;
  }
  const next = whole + key;
  return next.length > MAX_DIGITS ? current : next;
}

/** What the home keypad has typed so far, as plain text ("12500", "3.5"). */
export function useAmountPad(allowDecimal: boolean) {
  const [text, setText] = useState('');

  return {
    text,
    isEmpty: !/[1-9]/.test(text),
    press: (key: PadKey) => setText((current) => nextAmountText(current, key, allowDecimal)),
    clear: () => setText(''),
  };
}
