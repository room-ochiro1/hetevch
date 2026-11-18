/** localStorage key holding 'light' | 'dark'; missing means "follow the system". */
export const THEME_STORAGE_KEY = 'hetevch.theme';

/** Dispatched on `window` after the preference changes in this tab. */
export const THEME_CHANGE_EVENT = 'hetevch:theme';

export type ThemePreference = 'system' | 'light' | 'dark';

/**
 * Inline <head> script (see Next's "Preventing flash before hydration" guide). It runs before
 * the first paint, resolves the saved preference or the OS setting to data-theme="light|dark"
 * on <html>, and re-applies when the preference changes (this tab or another) or the OS
 * switches while on "system". Plain ES5 on purpose: it is not bundled or transpiled.
 */
export const THEME_SCRIPT = `(function () {
  var key = ${JSON.stringify(THEME_STORAGE_KEY)};
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function preference() {
    try {
      var value = localStorage.getItem(key);
      return value === 'light' || value === 'dark' ? value : 'system';
    } catch (e) {
      return 'system';
    }
  }
  function apply() {
    var p = preference();
    root.setAttribute('data-theme', p === 'system' ? (media.matches ? 'dark' : 'light') : p);
  }
  apply();
  media.addEventListener('change', apply);
  window.addEventListener(${JSON.stringify(THEME_CHANGE_EVENT)}, apply);
  window.addEventListener('storage', apply);
})();`;
