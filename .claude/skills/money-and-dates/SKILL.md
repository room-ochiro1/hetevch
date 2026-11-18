---
name: money-and-dates
description: Hetevch's rules for money, currencies, interest and dates — storage, conversion, formatting, rounding, Mongolian date text. Use whenever code shows, stores, converts or calculates an amount, a rate or a date (transactions, savings cards, calculator, admin charts).
---

# Money and dates

## Money

- **Storage**: `numeric(14, 2)`. Income and expenses (`transactions`) are always **tögrög** (the base currency). Savings cards keep their own `currency` (`MNT` | `USD`) and every amount on a card is in that currency.
- **Display (mobile)**: always through `useMoney()` (`apps/mobile/src/hooks/use-money.ts`): `format`, `net`, `forKind`, `combine` (sums several currencies), `toBase` (typed display amount → tögrög to store). Never call `formatMoney` directly in mobile UI; it ignores the user's currency.
- **Display currency** is a per-device preference (Profile → Мөнгөн тэмдэгт), default ₮. The USD rate comes from `lib/exchange-rate.ts` (cached 12 h). Without a rate the app stays in ₮; it never shows a tögrög number with a $ sign.
- **Editing in another currency**: an amount the user did not change is saved as the original tögrög value (no round trip through the rate).
- **Formatting**: tögrög shows whole numbers (`12,500 ₮`); dollars always show cents (`$12.50`). Use a true minus `−` for expenses.
- **Admin dashboard** sums `transactions.amount` directly. That is only correct because transactions are single-currency; keep it that way.

## Interest (`packages/shared/src/interest.ts`, `savings.ts`)

- Mongolbank method: a day's interest = yearly rate ÷ 365, a month's = ÷ 12. Monthly compounding capitalises whole months; leftover days accrue simply.
- Each savings movement earns from its own date; interest stops at maturity; a matured card earns nothing more.
- Show the 10% interest tax as "may apply" (exemptions exist; see the `research` skill), never as certain.
- Effective yearly rate for monthly compounding: 12% → 12.68%. Use it as a regression check.

## Dates

- Calendar days are `YYYY-MM-DD` strings (`toISODate` / `fromISODate`), parsed as **local** dates, never `new Date('YYYY-MM-DD')` (that is UTC).
- Mongolian text comes from `formatShortDate` / `formatLongDate` / `formatDayLabel`. **Never** `Intl.DateTimeFormat('mn-MN')`: browsers have no Mongolian data, so the web shows "Oct 19" and hydration breaks.
- Weeks start on Monday (`periods.ts`). Admin analytics bucket days in `Asia/Ulaanbaatar`.
- Months: `addMonths` clamps to the month's end (Jan 31 + 1 → Feb 28/29).

## Tests

Run the money/interest math through a quick Node script (copy the shared files with `.ts` import extensions into the scratchpad and run `node test.ts`) whenever these helpers change.
