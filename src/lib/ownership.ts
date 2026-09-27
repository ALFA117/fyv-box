// Shared by the browser (signs) and /api/missions/complete (verifies).
export const OWNERSHIP_MAX_AGE_MS = 10 * 60 * 1000;

export function completionMessage(p: {
  stellarAddress: string;
  missionId: string;
  selectedOptionId: string;
  issuedAt: number;
}): string {
  return `fyv-box:complete:${p.stellarAddress}:${p.missionId}:${p.selectedOptionId}:${p.issuedAt}`;
}

export const STELLAR_ADDRESS_RE = /^G[A-Z2-7]{55}$/;

export function isStellarAddress(value: string): boolean {
  return STELLAR_ADDRESS_RE.test(value);
}

export function midTruncate(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export const STELLAR_EXPERT_ACCOUNT = "https://stellar.expert/explorer/testnet/account";
export const STELLAR_EXPERT_TX = "https://stellar.expert/explorer/testnet/tx";
