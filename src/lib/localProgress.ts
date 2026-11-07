/**
 * Avance guardado en el navegador (cliente).
 *
 * Cada misión acertada se anota aquí con el recibo que firma el servidor (ver lib/receipts.ts).
 * Si la base de datos no responde, el mapa y las credenciales se arman con esto y los recibos
 * se reenvían al servidor para que pueda emitir la credencial on-chain al cerrar un módulo.
 */
const PREFIX = "fyv_progress:";

type Store = Record<string, string>; // missionId → recibo ("" si el servidor no dio uno)

function read(address: string): Store {
  try {
    const raw = localStorage.getItem(PREFIX + address);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

export function localCompleted(address: string): Set<string> {
  return new Set(Object.keys(read(address)));
}

/** Recibos válidos para mandar al servidor (los vacíos no sirven de prueba). */
export function localReceipts(address: string): Record<string, string> {
  return Object.fromEntries(Object.entries(read(address)).filter(([, r]) => typeof r === "string" && r.length > 0));
}

export function saveLocalCompletion(address: string, missionId: string, receipt: string | null | undefined): void {
  try {
    const store = read(address);
    if (receipt || !(missionId in store)) store[missionId] = receipt ?? "";
    localStorage.setItem(PREFIX + address, JSON.stringify(store));
  } catch {
    /* almacenamiento bloqueado: el avance no se recuerda en este navegador */
  }
}
