import { Fish, Coins, MessageSquare, Zap, TrendingUp, KeyRound, Shield } from "lucide-react";
import type { Mission } from "@/missions/schema";

interface Props {
  track: Mission["track"];
  className?: string;
  size?: number;
}

const trackIcons: Record<Mission["track"], React.ElementType> = {
  "phishing":            Fish,
  "fake-assets":         Coins,
  "social-engineering":  MessageSquare,
  "dangerous-approvals": Zap,
  "presale-scam":        TrendingUp,
  "key-hygiene":         KeyRound,
};

const trackColors: Record<Mission["track"], string> = {
  "phishing":            "text-[var(--danger)]",
  "fake-assets":         "text-[var(--amber)]",
  "social-engineering":  "text-blue-400",
  "dangerous-approvals": "text-orange-400",
  "presale-scam":        "text-purple-400",
  "key-hygiene":         "text-[var(--success)]",
};

const trackBg: Record<Mission["track"], string> = {
  "phishing":            "bg-[var(--danger-subtle)]",
  "fake-assets":         "bg-[var(--amber-subtle)]",
  "social-engineering":  "bg-blue-500/10",
  "dangerous-approvals": "bg-orange-500/10",
  "presale-scam":        "bg-purple-500/10",
  "key-hygiene":         "bg-[var(--success-subtle)]",
};

export function TrackIcon({ track, className = "", size = 18 }: Props) {
  const Icon = trackIcons[track] ?? Shield;
  return (
    <Icon
      className={`${trackColors[track]} ${className}`}
      width={size}
      height={size}
      strokeWidth={1.75}
      aria-hidden="true"
    />
  );
}

export function TrackIconBadge({ track, size = 36 }: { track: Mission["track"]; size?: number }) {
  const Icon = trackIcons[track] ?? Shield;
  const iconSize = Math.round(size * 0.48);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${trackBg[track]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon
        className={trackColors[track]}
        width={iconSize}
        height={iconSize}
        strokeWidth={1.75}
      />
    </div>
  );
}
