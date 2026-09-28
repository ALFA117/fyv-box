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

export const GREETING_CHIPS = ["que-es", "empezar", "sospechoso", "puma", "credencial"];

export const FALLBACK =
  "No tengo una respuesta preparada para eso. Prueba con una de estas preguntas o escríbelo con otras palabras (por ejemplo: \"frase semilla\", \"airdrop\", \"credencial\").";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9$ ]/g, " ").replace(/\s+/g, " ").trim();
}

/** Devuelve el tema que mejor coincide con la pregunta, o null. */
export function matchTopic(question: string): BotTopic | null {
  const q = ` ${normalize(question)} `;
  if (!q.trim()) return null;
  let best: BotTopic | null = null;
  let bestScore = 0;
  for (const t of BOT_TOPICS) {
    let score = 0;
    for (const k of t.keywords) {
      const nk = normalize(k);
      if (q.includes(` ${nk} `) || (nk.length > 4 && q.includes(nk))) score += nk.split(" ").length;
    }
    if (score > bestScore) { best = t; bestScore = score; }
  }
  return best;
}

export function topicById(id: string): BotTopic | undefined {
  return BOT_TOPICS.find((t) => t.id === id);
}
