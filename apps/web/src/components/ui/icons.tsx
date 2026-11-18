import type { ReactNode } from 'react';

/** Small stroke icon set (Lucide-style geometry, ISC) so the dashboard needs no icon package. */
export type IconProps = { className?: string };
export type IconComponent = (props: IconProps) => ReactNode;

function createIcon(name: string, paths: ReactNode): IconComponent {
  function Icon({ className = 'size-4' }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
      >
        {paths}
      </svg>
    );
  }
  Icon.displayName = `${name}Icon`;
  return Icon;
}

const person = (
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </>
);

export const DashboardIcon = createIcon(
  'Dashboard',
  <>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </>,
);
export const UsersIcon = createIcon(
  'Users',
  <>
    {person}
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
);
export const UserPlusIcon = createIcon(
  'UserPlus',
  <>
    {person}
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </>,
);
export const TransferIcon = createIcon(
  'Transfer',
  <>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </>,
);
export const TagIcon = createIcon(
  'Tag',
  <>
    <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </>,
);
export const WalletIcon = createIcon(
  'Wallet',
  <>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </>,
);
export const LogOutIcon = createIcon(
  'LogOut',
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>,
);
export const ActivityIcon = createIcon('Activity', <path d="M22 12h-4l-3 9L9 3l-3 9H2" />);
/** Bar chart with a magnifier: the Судалгаа (research) page. */
export const ResearchIcon = createIcon(
  'Research',
  <>
    <path d="M3 3v18h18" />
    <path d="M7 16v-4" />
    <path d="M11 16V9" />
    <circle cx="16.5" cy="9.5" r="3" />
    <path d="m21 14-2.4-2.4" />
  </>,
);
export const ReceiptIcon = createIcon(
  'Receipt',
  <>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
  </>,
);
export const TrendUpIcon = createIcon(
  'TrendUp',
  <>
    <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
    <path d="M16 7h6v6" />
  </>,
);
export const TrendDownIcon = createIcon(
  'TrendDown',
  <>
    <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
    <path d="M16 17h6v-6" />
  </>,
);
export const InboxIcon = createIcon(
  'Inbox',
  <>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </>,
);
export const SearchIcon = createIcon(
  'Search',
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
);
export const ChevronLeftIcon = createIcon('ChevronLeft', <path d="m15 18-6-6 6-6" />);
export const ChevronRightIcon = createIcon('ChevronRight', <path d="m9 18 6-6-6-6" />);
export const ArrowLeftIcon = createIcon(
  'ArrowLeft',
  <>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </>,
);

export const XIcon = createIcon(
  'X',
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);
