/**
 * Etherfuse ramp — ESQUELETO, NO ACTIVO
 * Para activar: NEXT_PUBLIC_ENABLE_RAMP=true + ETHERFUSE_API_KEY
 */
import type { RampProvider, RampSession } from "./interface";

export const etherfuseRamp: RampProvider = {
  async createSession({ stellarAddress, amountUSD, orgSlug }): Promise<RampSession> {
    const apiKey = process.env.ETHERFUSE_API_KEY;
    if (!apiKey) throw new Error("ETHERFUSE_API_KEY not configured");

    // TODO Phase 2: POST https://api.etherfuse.com/v1/sessions
    void stellarAddress;
    void amountUSD;
    void orgSlug;

    throw new Error("Rampa Etherfuse no activada en esta versión");
  },

  async getSession(_sessionId: string): Promise<RampSession> {
    throw new Error("Rampa Etherfuse no activada en esta versión");
  },
};
