'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

import { THEME_CHANGE_EVENT, THEME_STORAGE_KEY, type ThemePreference } from '@/lib/theme-script';

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Saves the choice; the inline theme script listens for the event and repaints. */
function choose(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked (private mode): the page keeps following the system theme.
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const OPTIONS: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  {
    value: 'light',
    label: 'Цайвар',
    icon: (
      <Svg>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </Svg>
    ),
  },
  {
    value: 'dark',
    label: 'Бараан',
    icon: (
      <Svg>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Svg>
    ),
  },
  {
    value: 'system',
    label: 'Систем',
    icon: (
      <Svg>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </Svg>
    ),
  },
];

/** Цайвар / Бараан / Систем switch. Every instance stays in sync through the change event. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  // The server can't know the stored choice, so it renders "system"; React then syncs.
  const preference = useSyncExternalStore(subscribe, readPreference, () => 'system' as const);

  return (
    <div
      role="radiogroup"
      aria-label="Өнгөний горим"
      className={`grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1 ${className}`}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === preference;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => choose(option.value)}
            className={`grid h-8 place-items-center rounded-lg transition-colors ${
              selected
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
