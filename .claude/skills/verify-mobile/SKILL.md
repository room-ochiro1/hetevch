---
name: verify-mobile
description: Prove a Hetevch mobile change works beyond typecheck — Metro bundling, the Android emulator (screenshots, JS logs) and light/dark checks. Use before telling the user a mobile change is done, when a screen "doesn't open", or when Metro/LogBox shows warnings.
---

# Verify a mobile change

`pnpm check` proves types and lint. It does not prove the app bundles, routes resolve or the screen looks right.

## 1. Bundle through the running Metro

Ask Metro for the exact bundle the device would load. A resolve error or a missing route shows up here without touching the device.

```bash
# The manifest gives the device's bundle URL (port 8081 = the user's Metro)
curl -s -H "expo-platform: android" -H "accept: application/json" http://localhost:8081/ | grep -o '"url":"[^"]*bundle[^"]*"'
# Fetch that URL: HTTP 200 and no "Unable to resolve" means it bundles
curl -s -o /tmp/b.js -w "%{http_code}\n" "<bundle url>"
```

Strings in JSX are escaped in the bundle, so search for file paths (e.g. `savings/edit`) rather than Mongolian text.

## 2. Routes

- Every `Stack.Screen name` in `src/app/_layout.tsx` must match a file; Metro warns `No route named …` otherwise.
- Typed routes (`.expo/types/router.d.ts`) regenerate while Metro runs. An `index.tsx` inside a folder without `_layout` was typed as `/folder/index`, so name such screens explicitly (`savings/accounts.tsx`).

## 3. The emulator (Android)

- adb lives under `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe` (on this machine a junction to the Claude-packaged SDK).
- Read-only checks need no permission: `adb devices`, `adb exec-out screencap -p > shot.png` (then view the PNG), `adb logcat -d -s ReactNativeJS:V` for console warnings. Always add `-d` or a timeout; plain `logcat` waits for ever when no device is attached.
- **Taps, key events and settings changes need the user's OK** (it is their emulator and app state). If refused, say what you could not check and ask the user to look.
- Check both themes before calling UI done (`design-guide`): the light/dark switch is in the home drawer.

## 4. Report honestly

Say what was verified (bundle, screenshot, logs) and what was not (e.g. "not checked on device; taps not allowed").
