/**
 * Soroban ReadinessRegistry — se activa con REGISTRY_BACKEND=soroban
 * El contrato Rust vive en /contracts/readiness/
 * Deploy: ver README sección "Deploy del Contrato"
 */
import type { ReadinessRecord, RegistryBackend } from "./interface";
import { makeRecord } from "./interface";

function rpcUrl(): string {
  return process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
}

function contractId(): string {
  const id = process.env.SOROBAN_CONTRACT_ID;
  if (!id) throw new Error("SOROBAN_CONTRACT_ID not set");
  return id;
}

export const sorobanRegistry: RegistryBackend = {
  async recordCompletion({ stellarAddress, module }) {
    const sdk = await import("@stellar/stellar-sdk");
    const { Keypair, Contract, TransactionBuilder, Networks, BASE_FEE, xdr } = sdk;
    // rpc may be namespaced differently depending on SDK version
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpc = (sdk as any).SorobanRpc ?? (sdk as any).rpc;
    if (!rpc) throw new Error("Soroban RPC not available in this SDK version");

    const secret = process.env.FYV_ISSUER_SECRET;
    if (!secret) throw new Error("FYV_ISSUER_SECRET not set");

    const server = new rpc.Server(rpcUrl());
    const issuer = Keypair.fromSecret(secret);
    const contract = new Contract(contractId());
    const account = await server.getAccount(issuer.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "record_completion",
          xdr.ScVal.scvString(stellarAddress),
          xdr.ScVal.scvString(module)
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    prepared.sign(issuer);
    await server.sendTransaction(prepared);
  },

  async getReadiness(stellarAddress: string): Promise<ReadinessRecord> {
    // Simplified: full implementation requires Contract simulation
    // Delegate to supabase fallback when contract query is complex
    console.warn("[FYV] sorobanRegistry.getReadiness is a stub — use supabase backend");
    return makeRecord(stellarAddress, []);
  },

  async isCertified(stellarAddress: string, module: string): Promise<boolean> {
    const readiness = await sorobanRegistry.getReadiness(stellarAddress);
    return readiness.isCertified(module);
  },
};
