import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, strokeWidth = 1.8, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>
);
export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3 3 0 0 1 0 5.6" /><path d="M17.5 20a5.5 5.5 0 0 0-2.5-4.6" /></svg>
);
export const IconMegaphone = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1Z" /><path d="M18 9a3 3 0 0 1 0 6" /></svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>
);
export const IconBook = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 4.5C5 3.7 5.7 3 6.5 3H19v16H6.5A1.5 1.5 0 0 0 5 20.5Z" /><path d="M5 4.5A1.5 1.5 0 0 0 3.5 6v14.5H5" /></svg>
);
export const IconLink = (p: IconProps) => (
  <svg {...base(p)}><path d="M9.5 14.5 14.5 9.5" /><path d="M8 12 6.5 13.5a3.5 3.5 0 0 0 5 5L13 17" /><path d="M16 12l1.5-1.5a3.5 3.5 0 0 0-5-5L11 7" /></svg>
);
export const IconImages = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="4.5" width="12" height="12" rx="2" /><path d="M7 16.5h10.5a2 2 0 0 0 2-2V8" /><circle cx="8" cy="9.5" r="1.4" /></svg>
);
export const IconCamera = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1-1.6h6.6l1 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z" /><circle cx="12" cy="12.5" r="3.2" /></svg>
);
export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.5A1.6 1.6 0 0 0 11 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9.5A1.6 1.6 0 0 0 21 11h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.6 1.5Z" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconBell = (p: IconProps) => (
  <svg {...base(p)}><path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 5 1.5 6 1.5 6H5s1.5-1 1.5-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}><path d="M14.5 5.5 18.5 9.5 9 19l-4 1 1-4Z" /><path d="M13 7 17 11" /></svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M6 7v11.5A2.5 2.5 0 0 0 8.5 21h7a2.5 2.5 0 0 0 2.5-2.5V7" /><path d="M10 11v6M14 11v6" /></svg>
);
export const IconCopy = (p: IconProps) => (
  <svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
);
export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4v10m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></svg>
);
export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 16V6m0 0 4 4m-4-4-4 4" /><path d="M5 19h14" /></svg>
);
export const IconChevronUp = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 15 6-6 6 6" /></svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconGrip = (p: IconProps) => (
  <svg {...base(p)}><circle cx="9" cy="6" r="1.2" /><circle cx="15" cy="6" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="9" cy="18" r="1.2" /><circle cx="15" cy="18" r="1.2" /></svg>
);
export const IconX = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7" /></svg>
);
export const IconMore = (p: IconProps) => (
  <svg {...base(p)}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
);
export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}><path d="M19 12H5m0 0 6 6m-6-6 6-6" /></svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>
);
export const IconSparkles = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4.5 13.3 9 18 10.3 13.3 11.6 12 16.1 10.7 11.6 6 10.3 10.7 9Z" /><path d="M18.5 15.5 19 17.5 21 18l-2 .5L18.5 20.5 18 18.5 16 18l2-.5Z" /></svg>
);
export const IconFileText = (p: IconProps) => (
  <svg {...base(p)}><path d="M6.5 3h7L19 9.5V20a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3Z" /><path d="M13 3v6.5h6M8.5 13h7M8.5 16.5h5" /></svg>
);
export const IconTrendUp = (p: IconProps) => (
  <svg {...base(p)}><path d="m4 16 5-5 4 4 7-7" /><path d="M15 8h5v5" /></svg>
);
export const IconTrendDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m4 8 5 5 4-4 7 7" /><path d="M15 16h5v-5" /></svg>
);
export const IconShield = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
);
export const IconFlag = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 21V4m0 0 11 2-3 4 3 4-11-2" /></svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>
);
export const IconImage = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="8.5" cy="10" r="1.6" /><path d="m4 17 4.5-4.5L13 16l3-3 4 4" /></svg>
);
export const IconLayers = (p: IconProps) => (
  <svg {...base(p)}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>
);
export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 12H3m0 0 3.5-3.5M3 12l3.5 3.5" /></svg>
);
export const IconExternal = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 5h5v5" /><path d="M19 5 11 13" /><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" /></svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>
);
export const IconStar = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9Z" /></svg>
);
export const IconEye = (p: IconProps) => (
  <svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconEyeOff = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 3l18 18" /><path d="M10.6 6.2A9.7 9.7 0 0 1 12 6.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.1M6.2 6.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.3 3.9-.9" /><path d="M9.8 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" /></svg>
);
export const IconActivity = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 12h4l2.5 7 5-14L17 12h4" /></svg>
);
export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4 2.5 20h19Z" /><path d="M12 10v4M12 17.5v.01" /></svg>
);
export const IconInbox = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 13.5 7 5h10l3 8.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M4 13.5h4l1.5 2.5h5L16 13.5h4" /></svg>
);
export const IconFilter = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const IconTag = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
