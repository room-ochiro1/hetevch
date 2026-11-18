---
name: research
description: Research before building or deciding in Hetevch — a new feature's UX, a real-world finance fact (interest, tax, exchange rates, bank products), a library or an external API. Use when the user asks to research ("судал", "sudal", "судалгаа хий"), asks for a "professional" result, or before hard-coding any fact about money, law or a third-party service.
---

# Research first

Building on guesses is how a finance app shows wrong numbers. Spend a few searches before the first line of code.

## Steps

1. **Frame 2–4 concrete questions**: what users expect (UX), what the rule or fact is (finance/law), which API or library fits and whether it works here.
2. **Search in parallel** with WebSearch (`mode: "standard"`; `"extended"` only for niche or very fresh facts). Mongolian queries for local facts (Монголбанк, хадгаламжийн хүү, хүүгийн татвар); English for UX and technical patterns.
3. **Prefer primary sources**: Mongolbank, the banks' own product pages, legalinfo.mn, official docs (Expo: `https://docs.expo.dev/llms.txt`; Next.js: `node_modules/next/dist/docs/`; Supabase docs). Blogs, case studies and forums show patterns, not proof.
4. **Verify what you can run**: call the API and check the field you need is there (`curl … | node -e …`); reproduce a published number (e.g. 12% compounded monthly → 12.68% effective, as XacBank lists).
5. **Report** in Mongolian: what you found, what you decided, what stays uncertain. End with an `**Эх сурвалж:**` list of markdown links.
6. **Carry uncertainty into the product**: if a fact may vary (tax exemptions, bank rules), say so in the UI copy instead of stating it as certain.

## Rules

- Never invent rates, taxes, laws or API behaviour. Volatile numbers are fetched (with a cache and a fallback) or typed by the user, not hard-coded.
- Never put user data, emails or keys into a search query or a third-party request.
- A third-party service that receives requests from the app must be named in the privacy policy (`apps/mobile/src/content/privacy.ts`).

## Findings so far (append new ones)

| Topic | Decision | Source |
| --- | --- | --- |
| Deposit interest | Day = yearly rate ÷ 365, month = ÷ 12 (`packages/shared/src/interest.ts`) | Mongolbank methodology |
| Interest tax | Show 10% separately, marked "may apply"; exemptions exist | PwC tax summaries, KPMG MN 2026 (sources disagree) |
| USD↔MNT rate | `open.er-api.com/v6/latest/USD` (free, no key, daily, attribution required), cached 12 h | ExchangeRate-API docs; verified MNT present |
| Savings UX | Separate "cards" (pots) with name, colour, image, goal + progress; moves are not income/expense | Monzo Pots, Revolut Pockets write-ups |
| Multi-currency | One base currency (₮) for storage; display currency converts; keep the original currency on savings cards | Practitioner write-ups on multi-currency trackers |
| Quick entry | Adding a transaction is the #1 action: one tap from home, amount focused, category preselectable | Expense-tracker UX case studies |
| IMEI | Not readable: Android 10+ needs READ_PRIVILEGED_PHONE_STATE (system apps only); iOS never exposes it. Play policy forbids linking IMEI-type IDs to personal data | source.android.com device-identifiers; Play User Data policy |
| Reinstall-stable device key | Android: `ANDROID_ID` (per signing key+user+device; survives reinstall, resets on factory reset). iOS: random secret in Keychain (expo-secure-store) survives reinstall in practice, not guaranteed by Apple; IDFV resets when all vendor apps are gone | Android docs/MS Learn; Apple DTS forum (iOS 17.5); Expo SecureStore docs |
| Anonymous auth | Supabase anonymous session is local only: uninstall orphans the user unless an identity was linked first | Supabase auth-anonymous docs |
| Home layout | Keypad-first home (type amount → Зарлага / Орлого / savings → pick category); overview moved to its own tab; 5 tabs with home in the middle | User's reference screenshot (wallet-app pattern), adapted: no payments in this app |
| Age bands | under 18, 18–24, 25–34, 35–44, 45–54, 55–64, 65+, unknown (public.age_band, lib/age-bands.ts); de-facto survey convention, not an official standard | Survey-platform guides (SmartSurvey, Verint); CDC/UK ONS use other cut-points |
| Small groups | Statistics offices suppress cells under 5–10 people; admin research marks bands under 5 as «бага түүвэр» instead of hiding (admins see raw data anyway) | NCES/Maryland/NC suppression guidance; OMOP default 5 |
| Research scope | Admin research counts role = 'user' only, so the owner's own or demo data never skews user statistics | Product decision |
