import { z } from "zod";

export const MissionActionSchema = z.enum([
  "receive_payment",
  "send_payment",
  "receive_claimable_balance",
  "check_asset_domain",
  "simulate_dangerous_sign",
  "identify_phishing_domain",
  "refuse_seed_phrase",
]);

export const MissionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  isCorrect: z.boolean(),
});

export const MissionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  track: z.enum([
    "phishing",
    "fake-assets",
    "social-engineering",
    "dangerous-approvals",
    "presale-scam",
    "key-hygiene",
  ]),
  title: z.string().min(1),
  narrative: z.string().min(1),
  action: MissionActionSchema,
  actionParams: z.record(z.string(), z.unknown()).optional(),
  options: z.array(MissionOptionSchema).min(2),
  explanation: z.string().min(1),
  comingSoon: z.boolean().default(false),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  xp: z.number().int().positive().default(100),
});

export type Mission = z.infer<typeof MissionSchema>;
export type MissionAction = z.infer<typeof MissionActionSchema>;
export type MissionOption = z.infer<typeof MissionOptionSchema>;

export const TrackMeta: Record<Mission["track"], { label: string; emoji: string; description: string }> = {
  phishing: {
    label: "Phishing e Impersonación",
    emoji: "🎣",
    description: "Aprende a identificar páginas falsas y dominios engañosos",
  },
  "fake-assets": {
    label: "Activos y Airdrops Falsos",
    emoji: "🪙",
    description: "No todo lo que brilla es oro — ni todo token que aparece es legítimo",
  },
  "social-engineering": {
    label: "Ingeniería Social",
    emoji: "🗣️",
    description: "El mayor vector de ataque eres tú; aprende a reconocer la manipulación",
  },
  "dangerous-approvals": {
    label: "Aprobaciones Peligrosas",
    emoji: "⚠️",
    description: "Qué ocurre cuando autorizas demasiado en una transacción",
  },
  "presale-scam": {
    label: "Preventa y Rendimiento Falso",
    emoji: "📈",
    description: "Promesas irreales, FOMO y esquemas ponzi disfrazados de oportunidades",
  },
  "key-hygiene": {
    label: "Higiene de Llaves",
    emoji: "🔑",
    description: "Cómo guardar y proteger tus secretos de forma segura",
  },
};
