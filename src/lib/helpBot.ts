/**
 * Respuestas predeterminadas del asistente de ayuda (sin IA).
 * Cada tema tiene palabras clave; gana el que más coincidencias tenga con la pregunta.
 * Las respuestas son generales: nunca dan la opción correcta de una misión.
 */

export interface BotLink {
  label: string;
  href: string;
}

export interface BotTopic {
  id: string;
  /** Texto del botón de sugerencia. */
  chip: string;
  keywords: string[];
  answer: string;
  links?: BotLink[];
  /** Temas que se sugieren después de esta respuesta. */
  next?: string[];
}

export const BOT_TOPICS: BotTopic[] = [
  {
    id: "saludo",
    chip: "Hola",
    keywords: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hey", "que tal", "gracias"],
    answer: "¡Hola! Puedo explicarte cómo funciona FYV Box o revisar un mensaje que te parezca sospechoso. Elige una opción o escríbeme tu duda.",
    next: ["analizar", "que-es", "empezar", "sospechoso"],
  },
  {
    id: "analizar",
    chip: "Analizar un mensaje",
    keywords: ["analiza", "analizar", "revisa este", "revisar mensaje", "es estafa", "es real este", "es legit", "checa este"],
    answer: "",
  },
  {
    id: "que-es",
    chip: "¿Qué es FYV Box?",
    keywords: ["que es fyv", "que es esto", "que es esta", "fyv", "box", "para que sirve", "de que trata", "proyecto", "app"],
    answer:
      "FYV Box es un simulador de estafas crypto. Practicas con 22 situaciones reales (correos falsos, airdrops, DMs, firmas peligrosas, preventas) sin arriesgar dinero, y al aprobar cada módulo recibes una credencial registrada en Stellar testnet.",
    links: [{ label: "Ver los módulos", href: "/#tracks" }],
    next: ["empezar", "dinero-real", "credencial"],
  },
  {
    id: "empezar",
    chip: "¿Cómo empiezo?",
    keywords: ["empiezo", "empezar", "comenzar", "iniciar", "registro", "registrarme", "entrar", "cuenta", "login", "iniciar sesion"],
    answer:
      "Entra con tu correo: te mandamos un código de 6 dígitos y listo, sin contraseñas. Si prefieres no dar tu correo, puedes entrar como invitado con una billetera de prueba que vive en tu navegador.",
    links: [{ label: "Entrar con mi correo", href: "/entrar" }],
    next: ["correo", "invitado", "dinero-real"],
  },
  {
    id: "correo",
    chip: "Login con correo",
    keywords: ["correo", "email", "mail", "codigo", "otp", "pollar", "no me llega", "verificar correo", "spam"],
    answer:
      "El login con correo usa Pollar: te llega un código de un solo uso y se crea una billetera Stellar de testnet ligada a tu correo, así recuperas tu progreso desde cualquier dispositivo. Si no te llega el código, revisa spam o promociones y usa \"Reenviar código\" después de 30 segundos.",
    links: [{ label: "Ir a entrar", href: "/entrar" }],
    next: ["invitado", "privacidad"],
  },
  {
    id: "invitado",
    chip: "Entrar sin correo",
    keywords: ["sin correo", "invitado", "anonimo", "no quiero dar", "guest"],
    answer:
      "Puedes entrenar como invitado: creamos una billetera de prueba en tu navegador y la fondeamos en testnet. Ojo: si borras los datos del navegador o cambias de dispositivo, pierdes ese progreso. Con correo no pasa.",
    links: [{ label: "Elegir cómo entrar", href: "/entrar" }],
    next: ["correo", "dinero-real"],
  },
  {
    id: "dinero-real",
    chip: "¿Es dinero real?",
    keywords: ["dinero real", "real", "pagar", "cuesta", "gratis", "precio", "costo", "testnet", "riesgo", "cobran"],
    answer:
      "No. Todo pasa en Stellar testnet, una red de prueba donde las monedas no valen nada. Es gratis y no puedes perder dinero. Si alguien te pide pagar o depositar para \"usar FYV Box\", es una estafa.",
    next: ["que-es", "credencial"],
  },
  {
    id: "credencial",
    chip: "La credencial on-chain",
    keywords: ["credencial", "certificado", "certifico", "nft", "on-chain", "onchain", "blockchain", "transaccion", "stellar expert", "comprobante"],
    answer:
      "Al aprobar un módulo, FYV Box registra tu credencial y además la emite en Stellar testnet: una transacción de nuestra cuenta emisora hacia tu dirección con el memo \"FYV cert <módulo>\". Puedes abrirla en Stellar Expert desde tu página de credenciales.",
    links: [
      { label: "Mis credenciales", href: "/graduation" },
      { label: "Verificar una dirección", href: "/verify" },
    ],
    next: ["verificar", "stellar"],
  },
  {
    id: "verificar",
    chip: "Verificar a alguien",
    keywords: ["verificar", "verify", "validar", "comprobar", "api", "dapp", "wallet puede"],
    answer:
      "Pega cualquier dirección Stellar (empieza con G) en el verificador y verás qué módulos completó y el enlace a cada transacción. Wallets y dApps pueden consultar lo mismo con GET /api/verify?address=G…",
    links: [{ label: "Abrir el verificador", href: "/verify" }],
    next: ["credencial"],
  },
  {
    id: "stellar",
    chip: "¿Qué es Stellar?",
    keywords: ["que es stellar", "stellar", "xlm", "lumen", "red", "blockchain que", "horizon", "friendbot"],
    answer:
      "Stellar es una blockchain pensada para pagos: transacciones en segundos y con comisiones de fracciones de centavo. FYV Box usa su testnet para darte una cuenta real (de prueba) y registrar tus credenciales sin costo.",
    next: ["credencial", "dinero-real"],
  },
  {
    id: "puma",
    chip: "Me llegó un drop de $PUMA",
    keywords: ["puma", "drop", "airdrop", "goya", "hackathon", "tokens gratis", "me llegaron tokens", "reclamar", "claim"],
    answer:
      "Cuidado: cualquiera puede crear un token llamado PUMA. Antes de reclamar nada, confirma en el canal oficial de CriptoUNAM en qué red se entrega y desde qué emisor. Nunca sigas un link para \"activar\" o \"canjear\" un drop que te pida tu frase o una firma. Practícalo en la misión \"El Drop de $PUMA\".",
    links: [{ label: "Módulo de airdrops falsos", href: "/mission/fake-assets-001" }],
    next: ["sospechoso", "frase"],
  },
  {
    id: "sospechoso",
    chip: "Recibí algo sospechoso",
    keywords: ["sospechoso", "estafa", "scam", "fraude", "me escribieron", "dm", "mensaje", "link", "enlace", "soporte", "me contacto", "ayuda urgente", "hackearon"],
    answer:
      "Regla rápida: 1) no des clic ni firmes nada con prisa, 2) nadie legítimo te pide tu frase semilla, 3) el soporte real no te escribe primero por DM, 4) revisa el dominio letra por letra, 5) si promete ganancias garantizadas, es estafa. Si ya firmaste algo, mueve tus fondos a una wallet nueva desde un dispositivo limpio.",
    links: [
      { label: "Practicar phishing", href: "/mission/phishing-001" },
      { label: "Practicar ingeniería social", href: "/mission/social-eng-001" },
    ],
    next: ["frase", "firmas", "puma"],
  },
  {
    id: "frase",
    chip: "Mi frase semilla",
    keywords: ["frase", "semilla", "seed", "12 palabras", "24 palabras", "llave privada", "clave privada", "private key", "respaldo", "backup", "perdi"],
    answer:
      "Tu frase semilla es tu dinero: quien la tenga controla tus fondos. Escríbela en papel, guárdala fuera de línea y nunca la mandes por chat, correo, foto ni la pegues en una página. Ningún soporte, exchange ni FYV Box te la va a pedir jamás.",
    links: [{ label: "Módulo de higiene de llaves", href: "/mission/key-hygiene-001" }],
    next: ["sospechoso", "firmas"],
  },
  {
    id: "firmas",
    chip: "Firmas y aprobaciones",
    keywords: ["firma", "firmar", "aprobar", "aprobacion", "approve", "permiso", "transaccion rara", "multifirma", "signer", "trustline"],
    answer:
      "Antes de firmar, lee qué hace la transacción: a quién le das permiso, cuánto y por cuánto tiempo. Si tu wallet muestra algo que no entiendes, un cambio de firmantes o un permiso ilimitado, no firmes. Una firma puede ceder el control de tu cuenta.",
    links: [{ label: "Módulo de aprobaciones peligrosas", href: "/mission/dangerous-approvals-001" }],
    next: ["sospechoso", "preventa"],
  },
  {
    id: "preventa",
    chip: "Preventas y rendimientos",
    keywords: ["preventa", "presale", "rendimiento", "apy", "invertir", "inversion", "ganancia", "x100", "pool", "lista blanca", "whitelist"],
    answer:
      "Señales de alerta: cuenta regresiva para presionarte, rendimientos altísimos \"garantizados\", equipo anónimo, sin auditoría ni stellar.toml, y liquidez que controla una sola persona. Si suena demasiado bueno, lo es.",
    links: [{ label: "Módulo de preventas", href: "/mission/presale-scam-001" }],
    next: ["sospechoso", "firmas"],
  },
  {
    id: "progreso",
    chip: "Mi progreso",
    keywords: ["progreso", "xp", "nivel", "mapa", "misiones", "cuantas", "perdi mi progreso", "avance", "siguiente"],
    answer:
      "Tu mapa de misiones muestra tu nivel, tu XP y la siguiente misión. Hay 22 misiones en 6 módulos; al completar todas las de un módulo recibes su credencial. Si entraste como invitado y cambiaste de navegador, tu progreso se quedó en el anterior.",
    links: [{ label: "Abrir mi mapa", href: "/dashboard" }],
    next: ["credencial", "correo"],
  },
  {
    id: "estadisticas",
    chip: "Estadísticas",
    keywords: ["estadisticas", "stats", "datos", "cuanta gente", "porcentaje", "cae mas"],
    answer:
      "Las estadísticas muestran qué estafas engañan más en el primer intento, con respuestas reales de la app. Todavía es una muestra pequeña, así que tómalas como ilustrativas.",
    links: [{ label: "Ver estadísticas", href: "/stats" }],
    next: ["que-es"],
  },
  {
    id: "privacidad",
    chip: "Privacidad",
    keywords: ["privacidad", "datos personales", "guardan", "mi correo", "seguro", "seguridad", "custodia"],
    answer:
      "Guardamos tu dirección Stellar y tus respuestas para calcular tu progreso y las estadísticas. Tu correo lo maneja Pollar solo para enviarte el código; no lo publicamos ni lo ligamos a tu credencial pública. No custodiamos dinero real.",
    next: ["correo", "dinero-real"],
  },
  {
    id: "contacto",
    chip: "Código y contacto",
    keywords: ["github", "codigo", "open source", "contacto", "quien lo hizo", "criptounam", "equipo", "reportar", "bug", "error"],
    answer:
      "FYV Box es código abierto (licencia MIT) y lo hizo la comunidad CriptoUNAM. Si encontraste un error o quieres contribuir, abre un issue en GitHub.",
    links: [{ label: "Ver en GitHub", href: "https://github.com/ALFA117/fyv-box" }],
    next: ["que-es"],
  },
];

export const GREETING_CHIPS = ["analizar", "que-es", "empezar", "sospechoso", "puma"];

/** Sugerencias iniciales según la pantalla donde se abre el asistente. */
export function chipsForPath(pathname: string | null): string[] {
  if (!pathname) return GREETING_CHIPS;
  if (pathname.startsWith("/dashboard")) return ["progreso", "credencial", "analizar", "correo"];
  if (pathname.startsWith("/graduation")) return ["credencial", "verificar", "stellar", "analizar"];
  if (pathname.startsWith("/verify")) return ["verificar", "credencial", "stellar"];
  if (pathname.startsWith("/entrar")) return ["correo", "invitado", "privacidad", "dinero-real"];
  if (pathname.startsWith("/stats")) return ["estadisticas", "analizar", "sospechoso"];
  return GREETING_CHIPS;
}

export const FALLBACK =
  "No tengo una respuesta preparada para eso. Prueba con una de estas preguntas, escríbelo con otras palabras (por ejemplo: \"frase semilla\", \"airdrop\", \"credencial\") o pega el mensaje sospechoso completo y lo reviso.";

export const ANALYZE_PROMPT =
  "Pega aquí el mensaje, DM, correo o link que te llegó (tal cual) y te digo qué señales de estafa encuentro. No lo guardo ni lo envío a ningún lado: se revisa en tu navegador.";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9$ ]/g, " ").replace(/\s+/g, " ").trim();
}

/** true si a y b difieren en como mucho un cambio (insertar, borrar o sustituir una letra). */
function nearlyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Devuelve el tema que mejor coincide con la pregunta, o null. Tolera un error de dedo por palabra. */
export function matchTopic(question: string): BotTopic | null {
  const norm = normalize(question);
  if (!norm) return null;
  const q = ` ${norm} `;
  const words = norm.split(" ");
  let best: BotTopic | null = null;
  let bestScore = 0;
  for (const t of BOT_TOPICS) {
    let score = 0;
    for (const k of t.keywords) {
      const nk = normalize(k);
      if (q.includes(` ${nk} `) || (nk.length > 4 && q.includes(nk))) {
        score += nk.split(" ").length;
        continue;
      }
      // Palabras largas: acepta un error de dedo ("fraze", "semiya", "credensial").
      const parts = nk.split(" ");
      if (parts.every((p) => (p.length >= 5 ? words.some((w) => w.length >= 4 && nearlyEqual(w, p)) : words.includes(p)))) {
        score += parts.length * 0.8;
      }
    }
    if (score > bestScore) { best = t; bestScore = score; }
  }
  return bestScore >= 0.8 ? best : null;
}

export function topicById(id: string): BotTopic | undefined {
  return BOT_TOPICS.find((t) => t.id === id);
}

/* ─── Analizador de mensajes sospechosos (reglas, sin IA, corre en el navegador) ─── */

export interface Flag {
  id: string;
  label: string;
  detail: string;
  weight: number;
  mission?: string;
}

export interface Analysis {
  level: "alto" | "medio" | "bajo";
  flags: Flag[];
  summary: string;
  practice?: { label: string; href: string };
}

type Rule = Flag & { re: RegExp };

const RULES: Rule[] = [
  {
    id: "secreto", weight: 3, mission: "key-hygiene-001",
    label: "Te pide tu frase semilla o llave privada",
    detail: "Nadie legítimo la pide nunca: quien la tenga controla tus fondos.",
    re: /(frase (semilla|de recuperacion|secreta)|semilla|seed ?phrase|recovery phrase|mnemonic|12 palabras|24 palabras|llave privada|clave privada|private ?key|secret ?key)/,
  },
  {
    id: "enviar", weight: 3, mission: "social-eng-005",
    label: "Te pide enviar dinero primero",
    detail: "\"Manda X para recibir Y\" o una \"comisión para liberar\" tus fondos es fraude siempre.",
    re: /((envia|manda|deposita|transfiere|send|deposit)\b.{0,40}(xlm|usdt|usdc|btc|eth|sol|pesos|mxn|dolares|crypto|cripto|fondos))|(para (recibir|liberar|desbloquear))|(comision (de|para) (liberar|desbloqueo|retiro))|(unlock fee)/,
  },
  {
    id: "firma", weight: 2, mission: "dangerous-approvals-001",
    label: "Te pide conectar la wallet, firmar o aprobar",
    detail: "Una firma puede ceder permisos sobre tu cuenta. Nunca firmes desde un link que te mandaron.",
    re: /(conecta(r|ndo)? (tu )?(wallet|billetera|cartera)|connect (your )?wallet|firma(r)?\b|\bsign\b|signing|aprueba|approve|valida(r)? (tu )?wallet|sincroniza(r)?|verify (your )?wallet|walletconnect)/,
  },
  {
    id: "urgencia", weight: 2,
    label: "Te mete prisa",
    detail: "La urgencia es para que no pienses. Lo legítimo puede esperar a que lo verifiques.",
    re: /(urgente|inmediat|ahora mismo|d+ ?(horas|hrs|minutos|min)|solo hoy|hoy mismo|expira|caduca|24 ?h|ultimas? horas|antes de que|se cierra|cierra en|ultima oportunidad|bloquead|suspendid|last chance|expires|act now|limited time)/,
  },
  {
    id: "premio", weight: 2, mission: "fake-assets-001",
    label: "Promete un premio, airdrop o regalo",
    detail: "Los airdrops reales se anuncian en canales oficiales; uno que llega por DM casi siempre es cebo.",
    re: /(airdrop|\bdrop\b|giveaway|regalo|gratis|\bfree\b|\bclaim|reclama|ganaste|ganador|premio|\bbono\b|bonus|recompensa|reward)/,
  },
  {
    id: "ganancia", weight: 2, mission: "presale-scam-001",
    label: "Promete ganancias garantizadas o enormes",
    detail: "Nadie puede garantizar rendimientos. Un APY de cientos o miles por ciento es la señal clásica de un rug pull.",
    re: /(garantiza|\bx ?\d{2,}\b|\d{3,} ?%|duplica|triplica|multiplica|ganancias? seguras|sin riesgo|rendimiento|\bapy\b|\broi\b|preventa|presale|whitelist|lista blanca)/,
  },
  {
    id: "soporte", weight: 2, mission: "social-eng-001",
    label: "Dice ser soporte o del equipo oficial",
    detail: "El soporte real no te escribe primero por DM ni te pide datos. Contacta tú desde el sitio oficial.",
    re: /(soporte|support|servicio al cliente|\badmin\b|moderador|equipo oficial|official team|team member|helpdesk)/,
  },
  {
    id: "privado", weight: 1, mission: "social-eng-001",
    label: "Te lleva a un chat privado",
    detail: "Sacarte a Telegram, WhatsApp o DM evita que otros vean la estafa y te adviertan.",
    re: /(telegram|whatsapp|t\.me|wa\.me|mensaje privado|inbox|escribeme|escribenos|\bdm\b)/,
  },
];

const SHORTENERS = /(bit\.ly|tinyurl\.com|^t\.co$|goo\.gl|cutt\.ly|rb\.gy|is\.gd|shorturl\.at|ow\.ly|rebrand\.ly)/;
const LURE_WORDS = /(secure|login|verify|verif|wallet|claim|airdrop|support|soporte|recover|update|bonus|gift|promo|official|oficial|connect|auth)/;
const BRANDS = /(stellar|lobstr|freighter|xbull|albedo|binance|bitso|coinbase|metamask|phantom|trustwallet|ledger|trezor|criptounam|pollar|tangem|lumena)/;

function linkFlags(text: string): Flag[] {
  const urls = text.match(/\b(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/gi) ?? [];
  const out: Flag[] = [];
  const seen = new Set<string>();
  for (const raw of urls) {
    const host = raw.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].toLowerCase();
    if (seen.has(host) || host.split(".").length < 2 || /\.(png|jpe?g|gif|pdf)$/.test(host)) continue;
    seen.add(host);
    if (SHORTENERS.test(host)) {
      out.push({ id: `link-${host}`, weight: 2, mission: "phishing-001", label: `Link acortado (${host})`, detail: "Oculta el destino real. No lo abras; busca tú el sitio oficial." });
    } else if (host.startsWith("xn--") || host.includes(".xn--")) {
      out.push({ id: `link-${host}`, weight: 3, mission: "phishing-001", label: `Dominio con letras disfrazadas (${host})`, detail: "Usa caracteres de otros alfabetos para imitar un sitio conocido." });
    } else if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      out.push({ id: `link-${host}`, weight: 2, mission: "phishing-001", label: `Link a una dirección IP (${host})`, detail: "Los servicios reales usan su dominio, no una IP." });
    } else if (BRANDS.test(host) && (host.split(".")[0].includes("-") || LURE_WORDS.test(host.replace(BRANDS, "")))) {
      out.push({ id: `link-${host}`, weight: 3, mission: "phishing-001", label: `Dominio que imita una marca (${host})`, detail: "Agrega palabras como \"secure\", \"login\" o guiones al nombre real. Revisa el dominio letra por letra." });
    }
  }
  return out;
}

/** ¿Parece un mensaje pegado para analizar, y no una pregunta al asistente? */
export function looksLikeMessage(text: string): boolean {
  const t = text.trim();
  if (t.length > 140 || /https?:\/\/|www\.|\b[a-z0-9-]{2,}\.(com|io|xyz|app|net|org|me|link|site|online|top|live|ly|gl|gd|finance|vip|club)\b/i.test(t)) return true;
  // Mensajes cortos pero con varias señales ("Ganaste un airdrop, reclama antes de que cierre").
  return t.length > 50 && analyzeMessage(t).flags.length >= 2;
}

export function analyzeMessage(text: string): Analysis {
  const norm = ` ${text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")} `;
  const flags: Flag[] = [
    ...RULES.filter((r) => r.re.test(norm)).map(({ id, label, detail, weight, mission }) => ({ id, label, detail, weight, mission })),
    ...linkFlags(text),
  ];
  const score = flags.reduce((s, f) => s + f.weight, 0);
  const level: Analysis["level"] =
    score >= 5 || flags.some((f) => f.id === "secreto" || f.id === "enviar") ? "alto" : score >= 2 ? "medio" : "bajo";
  const summary =
    level === "alto"
      ? "Riesgo alto: tiene varias señales típicas de estafa. No respondas, no abras links y no firmes nada."
      : level === "medio"
        ? "Precaución: encontré señales de alerta. Verifica por tu cuenta en el sitio o canal oficial antes de hacer cualquier cosa."
        : "No encontré señales claras, pero eso no garantiza que sea seguro. Si te pide dinero, tu frase o una firma, detente.";
  const top = [...flags].sort((a, b) => b.weight - a.weight).find((f) => f.mission);
  return {
    level,
    flags,
    summary,
    practice: top?.mission ? { label: "Practicar este tipo de estafa", href: `/mission/${top.mission}` } : undefined,
  };
}
