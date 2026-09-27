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
