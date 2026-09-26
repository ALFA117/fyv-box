import { Fish, Coins, MessageSquare, Zap, TrendingUp, KeyRound, Shield } from "lucide-react";
import type { Mission } from "@/missions/schema";
import { TRACK_STYLE } from "./trackStyle";

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

export function TrackIcon({ track, className = "", size = 18 }: Props) {
  const Icon = trackIcons[track] ?? Shield;
  return (
    <Icon
      className={`${TRACK_STYLE[track].text} ${className}`}
      width={size}
      height={size}
      strokeWidth={1.75}
      aria-hidden="true"
    />
  );
}

export function TrackIconBadge({ track, size = 36 }: { track: Mission["track"]; size?: number }) {
  const Icon = trackIcons[track] ?? Shield;
  const s = TRACK_STYLE[track];
  const iconSize = Math.round(size * 0.5);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border ${s.bg} ${s.border}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon className={s.text} width={iconSize} height={iconSize} strokeWidth={1.75} />
    </div>
  );
}
