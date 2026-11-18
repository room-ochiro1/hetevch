import {
  afterTax,
  balanceAfter,
  effectiveAnnualRate,
  formatAmountInput,
  interestPer,
  parseAmount,
  parseRate,
  type Compounding,
  type Span,
} from '@hetevch/shared';
import { useState } from 'react';

export type DurationUnit = 'day' | 'month' | 'year';

/** Longest span each unit accepts (100 years). */
const MAX_DURATION: Record<DurationUnit, number> = { day: 36_500, month: 1200, year: 100 };

/** Quick picks per unit, so most people never type the duration. */
export const DURATION_PRESETS: Record<DurationUnit, readonly number[]> = {
  day: [30, 90, 180, 365],
  month: [3, 6, 12, 24],
  year: [1, 2, 3, 5],
};

function toSpan(value: number, unit: DurationUnit): Span {
  if (unit === 'day') return { months: 0, days: value };
  return { months: unit === 'month' ? value : value * 12, days: 0 };
}

/** Inputs of the interest calculator and what they work out to (null until all are valid). */
export function useCalculator() {
  const [amountText, setAmount] = useState('');
  const [rateText, setRateText] = useState('');
  const [durationText, setDurationText] = useState('12');
  const [unit, setUnitState] = useState<DurationUnit>('month');
  const [compounding, setCompounding] = useState<Compounding>('monthly');

  const principal = parseAmount(amountText);
  const annualRate = parseRate(rateText);
  const duration = /^\d+$/.test(durationText) ? Number(durationText) : 0;
  const durationOk = duration > 0 && duration <= MAX_DURATION[unit];

  let result = null;
  if (principal !== null && annualRate !== null && durationOk) {
    const deposit = { principal, annualRate, compounding };
    const balance = balanceAfter(deposit, toSpan(duration, unit));
    result = {
      principal,
      balance,
      interest: balance - principal,
      net: afterTax(balance - principal),
      per: interestPer(deposit),
      effectiveRate: effectiveAnnualRate(deposit),
      compounding,
      annualRate,
      /** For "save as a deposit": a term only exists in whole months. */
      termMonths: unit === 'day' ? undefined : toSpan(duration, unit).months,
    };
  }

  /** Switching units keeps a sensible duration instead of e.g. "12 жил". */
  function setUnit(next: DurationUnit) {
    setUnitState(next);
    setDurationText(String(DURATION_PRESETS[next][2]));
  }

  return {
    amountText,
    setAmountText: (text: string) => setAmount(formatAmountInput(text)),
    rateText,
    setRateText,
    durationText,
    setDurationText: (text: string) => setDurationText(text.replace(/\D/g, '')),
    durationError: durationText !== '' && !durationOk,
    unit,
    setUnit,
    compounding,
    setCompounding,
    result,
  };
}

export type CalculatorResult = NonNullable<ReturnType<typeof useCalculator>['result']>;
