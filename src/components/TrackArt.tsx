import type { Mission } from "@/missions/schema";

/* Duotone line illustrations per module: an outline in the text color plus a
   gold shape offset behind it. Original drawings for FYV Box. */

const OFF = 3; // gold offset, px in the 64×64 grid

function Art({ track }: { track: Mission["track"] }) {
  switch (track) {
    case "phishing":
      return (
        <>
          <rect x={10 + OFF} y={24 + OFF} width="40" height="28" rx="4" fill="var(--gold)" stroke="none" />
          <rect x="10" y="24" width="40" height="28" rx="4" />
          <path d="M11 26l19 14 19-14" />
          <path d="M44 4v10a6 6 0 1 1-6 6" />
          <path d="M38 20l-2-3" />
        </>
      );
    case "fake-assets":
      return (
        <>
          <circle cx={26 + OFF} cy={32 + OFF} r="16" fill="var(--gold)" stroke="none" />
          <circle cx="26" cy="32" r="16" />
          <path d="M21.5 27.5a4.5 4.5 0 1 1 6.5 4c-1.5.8-2 1.8-2 3.5" />
          <path d="M26 40.5v.5" />
          <circle cx="47" cy="20" r="9" />
          <path d="M44 15l3 5-2 3 4 5" />
        </>
      );
    case "social-engineering":
      return (
        <>
          <path d={`M${8 + OFF} ${12 + OFF}h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H${22 + OFF}l-8 7v-7h-2a4 4 0 0 1-4-4V${16 + OFF}a4 4 0 0 1 4-4z`} fill="var(--gold)" stroke="none" />
          <path d="M8 12h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H22l-8 7v-7h-2a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" />
          <path d="M25 18v8" />
          <path d="M25 30v.5" />
          <path d="M46 26h6a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-1v6l-7-6h-8a4 4 0 0 1-4-4v-2" />
        </>
      );
    case "dangerous-approvals":
      return (
        <>
          <rect x={12 + OFF} y={8 + OFF} width="32" height="42" rx="3" fill="var(--gold)" stroke="none" />
          <rect x="12" y="8" width="32" height="42" rx="3" />
          <path d="M18 18h20M18 25h20M18 32h12" />
          <path d="M34 50l16-16 5 5-16 16-7 2z" />
          <path d="M46 38l5 5" />
        </>
      );
    case "presale-scam":
      return (
        <>
          <rect x={14 + OFF} y={36 + OFF} width="8" height="16" fill="var(--gold)" stroke="none" />
          <rect x={28 + OFF} y={26 + OFF} width="8" height="26" fill="var(--gold)" stroke="none" />
          <path d="M8 8v46h48" />
          <rect x="14" y="36" width="8" height="16" />
          <rect x="28" y="26" width="8" height="26" />
          <path d="M42 30l8-18M44 12h6v6" />
          <path d="M50 40h6M50 40l3 4-3 4h6" />
        </>
      );
    case "key-hygiene":
      return (
        <>
          <rect x={10 + OFF} y={28 + OFF} width="28" height="24" rx="4" fill="var(--gold)" stroke="none" />
          <rect x="10" y="28" width="28" height="24" rx="4" />
          <path d="M16 28v-6a8 8 0 0 1 16 0v6" />
          <path d="M24 38v6" />
          <circle cx="49" cy="18" r="7" />
          <path d="M49 25v22M49 34h5M49 41h4" />
        </>
      );
  }
}

export function TrackArt({ track, size = 56, className = "" }: { track: Mission["track"]; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-cream ${className}`}
      aria-hidden="true"
    >
      <Art track={track} />
    </svg>
  );
}
