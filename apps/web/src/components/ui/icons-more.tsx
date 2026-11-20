import { createIcon } from '@/components/ui/icons';

// More stroke icons (Lucide-style geometry, ISC); icons.tsx holds the first set.

export const CheckIcon = createIcon('Check', <path d="M20 6 9 17l-5-5" />);
export const ShieldIcon = createIcon(
  'Shield',
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
);
export const InfoIcon = createIcon(
  'Info',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>,
);
export const ArrowRightIcon = createIcon(
  'ArrowRight',
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
);
export const TrashIcon = createIcon(
  'Trash',
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>,
);
export const SparkIcon = createIcon(
  'Spark',
  <path d="M9.94 14.06 4 21m5.94-6.94L3 12l6.94-2.06L12 3l2.06 6.94L21 12l-6.94 2.06L12 21z" />,
);
