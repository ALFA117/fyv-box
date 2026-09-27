// Emite on-chain (Stellar testnet) las credenciales ya registradas que aún no tienen transacción.
// Uso: node --env-file=.env.local scripts/backfill-attestations.mjs
import { createClient } from "@supabase/supabase-js";
import { Asset, BASE_FEE, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";

const HORIZON = "https://horizon-testnet.stellar.org";
const signer = Keypair.fromSecret(process.env.FYV_ATTESTOR_SECRET);
const server = new Horizon.Server(HORIZON);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await db.from("fyv_module_completions").select("stellar_address, module_id");
if (error) throw error;
console.log(`credenciales: ${data.length}`);

async function attested(address) {
  const r = await fetch(`${HORIZON}/accounts/${address}/transactions?limit=200&order=desc`);
  if (r.status === 404) return new Set();
  const j = await r.json();
  return new Set((j._embedded?.records ?? [])
    .filter((t) => t.successful && t.source_account === signer.publicKey() && t.memo?.startsWith("FYV cert "))
    .map((t) => t.memo.slice(9)));
}

let sent = 0;
for (const row of data) {
  const done = await attested(row.stellar_address);
  if (done.has(row.module_id)) continue;
  const exists = (await fetch(`${HORIZON}/accounts/${row.stellar_address}`)).ok;
  const source = await server.loadAccount(signer.publicKey());
  const op = exists
    ? Operation.payment({ destination: row.stellar_address, asset: Asset.native(), amount: "0.0000001" })
    : Operation.createAccount({ destination: row.stellar_address, startingBalance: "1" });
  const tx = new TransactionBuilder(source, { fee: String(Number(BASE_FEE) * 10), networkPassphrase: Networks.TESTNET })
    .addOperation(op).addMemo(Memo.text(("FYV cert " + row.module_id).slice(0, 28))).setTimeout(60).build();
  tx.sign(signer);
  try {
    const res = await server.submitTransaction(tx);
    sent++;
    console.log(`${row.module_id} ${row.stellar_address.slice(0, 6)}… → ${res.hash}`);
  } catch (e) {
    console.error(`FALLÓ ${row.module_id} ${row.stellar_address.slice(0, 6)}…`, e?.response?.data?.extras?.result_codes ?? e.message);
  }
}
console.log(`emitidas: ${sent}`);
