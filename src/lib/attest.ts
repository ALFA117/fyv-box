/**
 * Credenciales on-chain en Stellar testnet (solo servidor).
 *
 * Al certificar un módulo, la cuenta emisora de FYV Box envía a la dirección del usuario
 * una transacción con el memo "FYV cert <módulo>" (0.0000001 XLM, o createAccount si la
 * cuenta aún no existe). Cualquiera puede comprobarla en Horizon o Stellar Expert:
 * la fuente es la cuenta emisora pública y el memo nombra el módulo.
 */
const HORIZON = "https://horizon-testnet.stellar.org";
const MEMO_PREFIX = "FYV cert ";

export const ATTESTOR_PUBLIC = process.env.NEXT_PUBLIC_FYV_ATTESTOR ?? "";

export interface Attestation {
  module: string;
  txHash: string;
  createdAt: string;
}

function memoFor(module: string): string {
  // Memo text admite 28 bytes: "FYV cert " (9) + id del módulo (≤ 19).
  return (MEMO_PREFIX + module).slice(0, 28);
}

async function accountExists(address: string): Promise<boolean> {
  const res = await fetch(`${HORIZON}/accounts/${encodeURIComponent(address)}`, { cache: "no-store" });
  if (res.ok) return true;
  if (res.status === 404) return false;
  throw new Error(`Horizon ${res.status}`);
}

/** Emite la credencial on-chain. Devuelve el hash o null si no está configurado. */
export async function attestModule(stellarAddress: string, module: string): Promise<string | null> {
  const secret = process.env.FYV_ATTESTOR_SECRET;
  if (!secret) return null;

  const { Asset, BASE_FEE, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } =
    await import("@stellar/stellar-sdk");
  const signer = Keypair.fromSecret(secret);
  const server = new Horizon.Server(HORIZON);
  const source = await server.loadAccount(signer.publicKey());

  const op = (await accountExists(stellarAddress))
    ? Operation.payment({ destination: stellarAddress, asset: Asset.native(), amount: "0.0000001" })
    : Operation.createAccount({ destination: stellarAddress, startingBalance: "1" });

  const tx = new TransactionBuilder(source, { fee: String(Number(BASE_FEE) * 10), networkPassphrase: Networks.TESTNET })
    .addOperation(op)
    .addMemo(Memo.text(memoFor(module)))
    .setTimeout(60)
    .build();
  tx.sign(signer);
  const res = await server.submitTransaction(tx);
  return res.hash;
}

/* ─── Contrato Soroban de credenciales (soroban/contracts/credential-registry) ─── */

const SOROBAN_RPC = "https://soroban-testnet.stellar.org";
export const CREDENTIAL_CONTRACT = process.env.NEXT_PUBLIC_FYV_CREDENTIAL_CONTRACT ?? "";

/** Los símbolos de Soroban no admiten guiones: id del módulo en la app → símbolo en el contrato. */
export const CONTRACT_MODULE: Record<string, string> = {
  phishing: "phishing",
  "fake-assets": "fake_assets",
  "social-engineering": "social_eng",
  "dangerous-approvals": "approvals",
  "presale-scam": "presale",
  "key-hygiene": "key_hygiene",
};
const APP_MODULE = Object.fromEntries(Object.entries(CONTRACT_MODULE).map(([a, c]) => [c, a]));

/** Registra la credencial en el contrato (issue es idempotente). Devuelve el hash o null si no está configurado. */
export async function issueOnContract(stellarAddress: string, module: string): Promise<string | null> {
  const secret = process.env.FYV_ATTESTOR_SECRET;
  const symbol = CONTRACT_MODULE[module];
  if (!secret || !CREDENTIAL_CONTRACT || !symbol) return null;

  const { Address, BASE_FEE, Contract, Keypair, Networks, TransactionBuilder, nativeToScVal, rpc } =
    await import("@stellar/stellar-sdk");
  const signer = Keypair.fromSecret(secret);
  const server = new rpc.Server(SOROBAN_RPC);
  const source = await server.getAccount(signer.publicKey());
  const op = new Contract(CREDENTIAL_CONTRACT).call(
    "issue",
    new Address(stellarAddress).toScVal(),
    nativeToScVal(symbol, { type: "symbol" }),
  );
  const built = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(op)
    .setTimeout(60)
    .build();
  const tx = await server.prepareTransaction(built);
  tx.sign(signer);
  const sent = await server.sendTransaction(tx);
  if (sent.status === "ERROR") throw new Error(`soroban send: ${sent.status}`);
  for (let i = 0; i < 20; i++) {
    const r = await server.getTransaction(sent.hash);
    if (r.status === "SUCCESS") return sent.hash;
    if (r.status === "FAILED") throw new Error("soroban tx failed");
    await new Promise((res) => setTimeout(res, 1000));
  }
  throw new Error("soroban tx not confirmed");
}

/** Módulos (ids de la app) que el contrato tiene registrados para la dirección. Solo lectura (simulación). */
export async function getContractModules(stellarAddress: string): Promise<string[]> {
  if (!CREDENTIAL_CONTRACT || !ATTESTOR_PUBLIC) return [];
  const { Address, BASE_FEE, Contract, Networks, TransactionBuilder, rpc, scValToNative } = await import("@stellar/stellar-sdk");
  const server = new rpc.Server(SOROBAN_RPC);
  const source = await server.getAccount(ATTESTOR_PUBLIC);
  const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(new Contract(CREDENTIAL_CONTRACT).call("modules", new Address(stellarAddress).toScVal()))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) throw new Error("soroban simulate failed");
  const list = scValToNative(sim.result.retval) as string[];
  return list.map((s) => APP_MODULE[s] ?? s);
}

/** Credenciales on-chain de una dirección, leídas de Horizon (fuente = cuenta emisora). */
export async function getAttestations(stellarAddress: string): Promise<Attestation[]> {
  if (!ATTESTOR_PUBLIC) return [];
  const res = await fetch(
    `${HORIZON}/accounts/${encodeURIComponent(stellarAddress)}/transactions?order=desc&limit=200`,
    { cache: "no-store" },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Horizon ${res.status}`);
  const data = (await res.json()) as {
    _embedded?: { records?: { hash: string; source_account: string; memo_type: string; memo?: string; created_at: string; successful: boolean }[] };
  };
  const seen = new Set<string>();
  const out: Attestation[] = [];
  for (const r of data._embedded?.records ?? []) {
    if (!r.successful || r.source_account !== ATTESTOR_PUBLIC || r.memo_type !== "text" || !r.memo?.startsWith(MEMO_PREFIX)) continue;
    const module = r.memo.slice(MEMO_PREFIX.length);
    if (seen.has(module)) continue;
    seen.add(module);
    out.push({ module, txHash: r.hash, createdAt: r.created_at });
  }
  return out;
}
