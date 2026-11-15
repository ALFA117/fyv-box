import type { Mission } from "@/missions/schema";

type Track = Mission["track"];

interface TrackStyle {
  text: string;
  bg: string;
  border: string;
  bar: string;
  /** Tinted card: subtle background + border. */
  chip: string;
}

export const TRACK_ORDER: Track[] = [
  "phishing",
  "fake-assets",
  "social-engineering",
  "dangerous-approvals",
  "presale-scam",
  "key-hygiene",
];

export const TRACK_STYLE: Record<Track, TrackStyle> = {
  "phishing": {
    text: "text-danger", bg: "bg-danger-subtle", border: "border-danger-border", bar: "bg-danger",
    chip: "text-danger bg-danger-subtle border-danger-border",
  },
  "fake-assets": {
    text: "text-amber", bg: "bg-amber-subtle", border: "border-amber-border", bar: "bg-amber",
    chip: "text-amber bg-amber-subtle border-amber-border",
  },
  "social-engineering": {
    text: "text-info", bg: "bg-info-subtle", border: "border-info-border", bar: "bg-info",
    chip: "text-info bg-info-subtle border-info-border",
  },
  "dangerous-approvals": {
    text: "text-orange", bg: "bg-orange-subtle", border: "border-orange-border", bar: "bg-orange",
    chip: "text-orange bg-orange-subtle border-orange-border",
  },
  "presale-scam": {
    text: "text-violet", bg: "bg-violet-subtle", border: "border-violet-border", bar: "bg-violet",
    chip: "text-violet bg-violet-subtle border-violet-border",
  },
  "key-hygiene": {
    text: "text-success", bg: "bg-success-subtle", border: "border-success-border", bar: "bg-success",
    chip: "text-success bg-success-subtle border-success-border",
  },
};

export const DIFFICULTY: Record<Mission["difficulty"], { label: string; chip: string }> = {
  beginner:     { label: "Básico",     chip: "text-success bg-success-subtle border-success-border" },
  intermediate: { label: "Intermedio", chip: "text-amber bg-amber-subtle border-amber-border" },
  advanced:     { label: "Avanzado",   chip: "text-danger bg-danger-subtle border-danger-border" },
};
