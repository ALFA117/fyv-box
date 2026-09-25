/**
 * Rampa fiat → crypto — APAGADA (NEXT_PUBLIC_ENABLE_RAMP=false)
 * Gancho para graduados: "ahora hazlo con dinero real"
 * Phase 2: integrar Etherfuse, configurar fee de partner y flujo KYC
 */
export interface RampSession {
  sessionId: string;
  kycStatus: "pending" | "approved" | "rejected";
  redirectUrl: string;
}

export interface RampProvider {
  createSession(params: {
    stellarAddress: string;
    amountUSD: number;
    orgSlug: string;
  }): Promise<RampSession>;
  getSession(sessionId: string): Promise<RampSession>;
}
