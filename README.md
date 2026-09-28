# FYV Box

Simulador gratuito de estafas crypto en español. Las personas enfrentan escenarios realistas (phishing, airdrops falsos, ingeniería social, firmas peligrosas, preventas falsas, manejo de llaves) y, al completar un track, obtienen una credencial verificable ligada a su dirección de Stellar testnet.

**Live:** [fyv-box.vercel.app](https://fyv-box.vercel.app) · **Pitch:** `/pitch` · **Licencia:** MIT

## Qué comprobar en Stellar (para jueces)

| Qué | Dónde abrirlo |
|---|---|
| Cuenta emisora de credenciales (testnet) | [GBQZNP6Y…7HPNI](https://stellar.expert/explorer/testnet/account/GBQZNP6YEBBOZ332OES6G4GTGEKBLT2BUCRINNXNIDZEPH4NNZN7HPNI) — cada transacción con memo `FYV cert <módulo>` es una credencial |
| Una credencial on-chain de ejemplo (módulo phishing) | [tx a50a7632…](https://stellar.expert/explorer/testnet/tx/a50a76325c7714a45bf35a7e09e8f12518cff17af57bf3cfd0a61c9d7104eff3) |
| Verificador público | [/verify](https://fyv-box.vercel.app/verify?address=GAMIQH3NJTXDD2HAAQOG6VX65ICTLCDQMRSNPX4AWGH6X64YZYBQYNCK) y `GET /api/verify?address=G…` (devuelve el `txHash` de cada módulo) |
| Firma de cada respuesta | SEP-53 (`signMessage`), verificada en `src/app/api/missions/complete/route.ts` |
| Login con correo | Pollar (`@pollar/core`): billetera custodiada en testnet, `/entrar` |

**Por qué Stellar:** cada persona que entrena termina con una cuenta real en testnet (creada por Friendbot o por Pollar) y una credencial que otra wallet o dApp puede leer sin pedirle nada a FYV Box: basta consultar las transacciones de la cuenta emisora en Horizon. Las comisiones casi nulas permiten emitir una credencial por módulo a cada estudiante sin costo relevante.

## Reproducirlo

```
git clone https://github.com/ALFA117/fyv-box && cd fyv-box
npm install
cp .env.example .env.local   # o crea .env.local con las variables de abajo
npm run dev                   # http://localhost:3000
```

Sin `SUPABASE_SERVICE_ROLE_KEY` la app carga y se puede recorrer, pero no guarda respuestas. Sin `NEXT_PUBLIC_POLLAR_API_KEY` solo existe el modo invitado. Sin `FYV_ATTESTOR_SECRET` las credenciales se guardan pero no se emiten on-chain. Esquema de base: `supabase/migrations/`.

## Uso de IA y código reutilizado

- **IA:** el proyecto se desarrolló con asistencia de IA (Claude, de Anthropic, vía Claude Code) para escribir y revisar código, textos de las misiones, diseño y documentación. Las decisiones de producto, las pruebas con usuarios y la revisión final son del equipo.
- **Código base:** plantilla de `create-next-app` (Next.js). Librerías de terceros vía npm: `@stellar/stellar-sdk`, `@pollar/core`, `@supabase/supabase-js`, `framer-motion`, `lucide-react`, `zod`, Tailwind CSS. Fuentes de Google Fonts (Playfair Display, Inter, IBM Plex Mono).
- **Construido durante GOYA HACK (25–27 sep 2026):** todo el repositorio; el primer commit es del 25 de septiembre de 2026.

---

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind v4
- Supabase (Postgres) para progreso y credenciales
- Stellar testnet: identidad con Pollar (correo + billetera custodiada) o keypair de invitado fondeado con Friendbot; firma SEP-53 de cada respuesta; credencial emitida on-chain como transacción de la cuenta emisora (`src/lib/attest.ts`)
- Framer Motion para animaciones (siempre con `useReducedMotion`)
- Vercel (deploy automático en cada push a `master`)

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # SOLO servidor. Necesaria para cerrar las escrituras anónimas (ver FIX_NOTES)
REGISTRY_BACKEND=supabase     # "supabase" (default) | "soroban"
FYV_ISSUER_SECRET=            # solo si REGISTRY_BACKEND=soroban
SOROBAN_CONTRACT_ID=          # solo si REGISTRY_BACKEND=soroban
NEXT_PUBLIC_POLLAR_API_KEY=   # opcional: llave PUBLICABLE pub_testnet_… de Pollar. Activa el login con correo; vacía = solo modo invitado
FYV_ATTESTOR_SECRET=          # SOLO servidor: cuenta testnet que emite las credenciales on-chain
NEXT_PUBLIC_FYV_ATTESTOR=     # su dirección pública (G…), para leerlas desde /api/verify
NEXT_PUBLIC_SITE_URL=         # opcional: dominio canónico para SEO (default: dominio de producción de Vercel)
```

Ninguna llave secreta llega al navegador: solo las variables `NEXT_PUBLIC_*` se exponen, y son públicas por diseño (la anon key de Supabase lo es).

## Desarrollo

```
npm install
npm run dev
```

Para levantar un segundo servidor local sin chocar con el candado de `.next` (por ejemplo, una vista previa), usa `NEXT_DIST_DIR=.next-preview`.

## Tablas Supabase

- `fyv_mission_progress` — cada intento por misión (alimenta `/stats`)
- `fyv_completed_missions` — misiones respondidas correctamente
- `fyv_module_completions` — tracks certificados (la credencial)
- `fyv_verify_log` — log de consultas a `/api/verify` (se crea en la migración 002)

---

## FIX_NOTES

_Corrida de reparación y pulido móvil — 2026-09-26. Evaluado en viewport de 380 px y 320 px, más escritorio a 1280 px._

### 1. Inventario (estado encontrado → estado final)

| Pantalla / función | Estado encontrado | Estado final |
|---|---|---|
| Landing `/` | Funciona, pero con textos falsos ("certifícate on-chain", "cada simulacro usa transacciones reales"), conteos hardcodeados ("7+ tipos de estafa") y un formulario de correo **simulado sin avisar** (esperaba 900 ms y no guardaba nada) | Textos honestos, conteos leídos del catálogo real, el botón "Comenzar entrenamiento" crea la billetera de prueba real, la fondea con Friendbot y abre el mapa |
| Faucets (landing) | **Roto a medias**: el enlace de Friendbot abría una página de error JSON (400); el de Laboratory redirigía a la portada; LOBSTR se anunciaba con modo testnet que no tiene | Enlaces a las páginas reales de Stellar Lab (fondear / crear cuenta), Stellar Expert y Freighter (sí tiene testnet) |
| Billetera de prueba | Funciona a medias: el fondeo con Friendbot era "dispara y olvida", sin comprobar si la cuenta existía | Comprueba la cuenta en Horizon y la fondea solo si falta (una sola vez por pestaña, con timeout). Verificable en Stellar Expert desde el chip de billetera |
| Dashboard `/dashboard` | Funciona, pero un fallo de Supabase mostraba 0 % en silencio y un fallo de la billetera dejaba el esqueleto para siempre | Estados de carga, error con reintento y vacío; enlace a Estadísticas visible en móvil (antes estaba oculto en teléfono) |
| Misión `/mission/[id]` | Funciona en el camino feliz. **Roto** en errores: si la API respondía error, la pantalla se caía (`result.newCertifications` indefinido); si la billetera fallaba enviaba una dirección falsa `GTEST…`. Un fallo de red se mostraba como "Misión no encontrada" | Página de servidor (22 misiones prerenderizadas, 404 real). Errores humanos + toast, se conserva la selección, "Intentar de nuevo" tras fallar, botón de confirmar fijo al alcance del pulgar |
| Respuestas correctas | **Filtradas**: `/api/missions/list` enviaba `isCorrect` y la explicación al navegador | El catálogo público ya no incluye respuestas ni explicaciones; se evalúa solo en el servidor |
| `/api/missions/complete` | **Inseguro**: cualquiera podía registrar misiones (y credenciales) a nombre de cualquier dirección; errores de Supabase ignorados | Exige firma SEP-53 de la billetera (prueba de propiedad, ventana de 10 min); valida misión y opción; responde 503 con mensaje claro si Supabase falla; idempotente (upserts) |
| Credenciales `/graduation` | Funciona, pero se quedaba cargando si la billetera o Supabase fallaban | Estados de error/vacío, credenciales ordenadas por track, pendientes visibles |
| Verificador `/verify` | Funciona; input de 12 px (iOS hacía zoom al enfocar), sin validación en cliente, mostraba `backend: supabase` como texto crudo | Validación en cliente con mensajes concretos, input de 16 px con teclado adecuado, timeout, reintento, enlace al explorador |
| `/api/verify` | Funciona; el log escribía en una tabla **que no existe** (`fyv_verify_log`) sin avisar | Log best-effort que nunca rompe la verificación; la tabla se crea en la migración 002; valida `module` |
| Estadísticas `/stats` + `/api/stats` | Funciona a medias: "Usuarios" era el máximo por track, no personas únicas; un error se mostraba como "Sin datos aún" | Cuenta personas únicas reales, primer intento ordenado por fecha, estado de error distinto del vacío |
| `/pitch` | Funciona; afirmaba "NFT Soroban", marcaba 3 tracks existentes como "Próximamente" y mostraba un JSON de API que no existe | Datos corregidos para que coincidan con el producto actual |
| Pollar / Soroban / rampa Etherfuse | Tras flags apagados (`REGISTRY_BACKEND`, `NEXT_PUBLIC_ENABLE_RAMP`) | Soroban y rampa siguen apagados. Pollar ya está integrado (ver "Verificación por correo con Pollar") |
| Escenarios de misión | Simulaciones de UI (correo, Discord, wallet, firma, preventa) sin decirlo; `fake-assets-001` afirmaba que "FYV Box te envió" un balance "ya en tu historial" | Cada escenario lleva la etiqueta visible **Simulación**; narrativa corregida |
| SEO / compartir | Un solo título para todo el sitio, sin canonical, sin sitemap/robots/manifest, imagen OG con un emoji que se veía como cuadro y favicon `.ico` de Next por defecto | Ver sección SEO abajo |

### 2. Problemas visuales encontrados en móvil (380 px)

- Áreas táctiles pequeñas: flecha de volver 16×16, toggle de tema 29–32 px, enlaces del footer de 16 px de alto, botones decorativos del correo 34×26 que no hacían nada.
- Texto de 9–11 px en etiquetas, badges, estadísticas y tarjetas bloqueadas.
- CTAs del hero de anchos distintos al apilarse.
- El hero y las secciones salían en el HTML del servidor con `opacity: 0`: con red lenta el título quedaba invisible hasta cargar el JS.
- Header sin áreas seguras (notch) y breadcrumb fijo con `top` en píxeles.
- Header del dashboard: el wordmark y el chip de billetera se partían en dos líneas y el último botón quedaba a 1 px del borde.
- Colores de track inconsistentes entre pantallas (Preventa verde en un lado y morado en otro, etc.).
- Barras de progreso con `bg-white/8`, invisibles en modo claro.

No se encontraron desbordes horizontales; tras los cambios, la auditoría automática (script que mide cada elemento) da **0 desbordes, 0 textos < 12 px y 0 elementos tocables < 44 px** en todas las pantallas, a 380 y a 320 px.

### 3. Arreglos de funcionalidad y seguridad (por criticidad)

1. **Suplantación de direcciones** — `src/lib/ownership.ts`, `src/identity/test-wallet.ts`, `src/app/api/missions/complete/route.ts`: el cliente firma `fyv-box:complete:<dirección>:<misión>:<opción>:<timestamp>` con SEP-53 y el servidor lo verifica con `Keypair.verifyMessage`. Una firma falsa responde 401.
2. **Fuga de respuestas** — `toPublicMission()` en `src/missions/engine.ts`.
3. **Pantalla de misión que se caía con errores** — `MissionClient.tsx`: validación de la respuesta, timeout de 20 s, guardia contra doble envío, toasts.
4. **Errores de Supabase ignorados** — rutas `complete`, `stats`, `verify` y `supabase-registry.ts` ahora comprueban `error` y responden con mensajes en español, nunca con trazas.
5. **Estados colgados** — dashboard, graduation y stats distinguen cargando / error / vacío / listo, con reintento.
6. **Formulario de correo falso** — reemplazado por la creación real de la billetera de prueba.
7. **Enlaces rotos de faucets** y **conteos hardcodeados**.
8. **Bug de reglas de hooks** en `ParticleCanvas` (hooks después de un `return` condicional) y script inline que React marcaba como error; ahora `next/script` con `beforeInteractive`.
9. Parser del escenario de Discord que mostraba el nombre del atacante como primera frase del mensaje.

### 4. Pendientes que requieren acción manual (no se pudieron hacer desde aquí)

- ~~Cerrar las escrituras anónimas en Supabase~~ **Hecho (2026-09-26):** `SUPABASE_SERVICE_ROLE_KEY` configurada en Vercel (Production, Sensitive) y migración `002_lockdown_writes.sql` aplicada. Verificado: la anon key recibe 401 al insertar en las tres tablas y la API guarda respuestas (200).
- **Soroban `getReadiness`** sigue siendo un stub; el backend por defecto (`supabase`) es el que está en uso.
- **Pollar** integrado (`@pollar/core`); se activa al configurar `NEXT_PUBLIC_POLLAR_API_KEY`.
- **Tests automatizados**: el proyecto no tiene suite. Lo prioritario sería cubrir `engine.ts` y la verificación de firma de `complete`.

### 5. Decisiones tomadas

- La credencial se describe como "verificable ligada a tu dirección Stellar", no "on-chain", porque el backend activo es Supabase.
- La pantera (`logo-panther.webp`) se mantiene como ilustración del hero; no es un escudo ni un logo oficial de la UNAM. La marca en navegación, OG y favicon es solo el wordmark.
- "Salir" y el wordmark llevan al mismo sitio, así que "Salir" solo aparece desde `sm`; bajo 360 px el chip de billetera muestra solo el ícono.
- `/dashboard` y `/graduation` son `noindex` (dependen de la billetera local); landing, verificador, estadísticas y las 22 misiones sí se indexan.

### SEO y compartir

- Metadatos base en `src/app/layout.tsx` (plantilla `%s · FYV Box`, descripción, keywords, robots, `formatDetection`, `appleWebApp`) y por página con `pageMetadata()` de `src/lib/seo.ts`, que arma Open Graph y Twitter completos (Next reemplaza, no mezcla, esos objetos entre layouts).
- Título, descripción y canonical propios en cada ruta; cada misión genera los suyos (`generateMetadata`).
- `robots.txt`, `sitemap.xml` (incluye las 22 misiones), `manifest.webmanifest`, `icon.svg`, `apple-icon` y JSON-LD (`WebSite` + `Course`) en la portada.
- Imagen OG/Twitter de 1200×630 con el wordmark en Syne (cargada en build, con respaldo si no hay red).
- El HTML del servidor ya no esconde contenido con `opacity: 0`.

### Checklist — verificar en dos minutos en el celular

```
1. Abre fyv-box.vercel.app en el teléfono → se ve el título completo al instante, sin zoom ni scroll lateral.
2. Toca "Comenzar gratis" → baja a "¿Listo para entrenar?". Toca "Comenzar entrenamiento" → toast "Billetera lista y fondeada" y abre el mapa.
3. En el mapa, toca el chip de la billetera (arriba) → abre Stellar Expert con tu cuenta y 10,000 XLM de prueba.
4. Abre una misión → el escenario dice "Simulación"; el botón de abajo dice "Elige una opción" y queda sobre la barra del sistema.
5. Elige una opción y confirma → resultado con explicación; si fallaste, "Intentar de nuevo" funciona.
6. Vuelve al mapa → la misión aparece como completada y suben los XP.
7. Activa modo avión y recarga el mapa → mensaje "No se pudo cargar tu mapa" con "Reintentar" (no una pantalla en blanco).
8. Ve a /verify, pega "GABC" → error bajo el campo; pega tu dirección → "Sin credenciales todavía" o tus tracks.
9. Ve a /stats → números y barras sin cortarse.
10. Comparte el link en WhatsApp → vista previa con "No caigas en estafas crypto".
```

---

## DESIGN_NOTES

### Tokens (única fuente: `src/app/globals.css`)

Todos los colores, sombras, radios y áreas seguras son variables CSS. `@theme inline` los expone a Tailwind como utilidades nativas (`bg-navy`, `text-gold`, `border-line`, `bg-danger-subtle`…). Los componentes no tienen colores hexadecimales; las únicas excepciones documentadas son `src/lib/brand.ts` (valores crudos para OG, manifest y `theme-color`, que no pueden leer CSS) y las recetas de filtro de la pantera en `globals.css`.

| Token | Oscuro (default) | Claro | Uso |
|---|---|---|---|
| `--navy` | `#0A1A33` | `#F3F0E7` | Fondo base (`body` lo usa explícitamente) |
| `--surface` / `-2` / `-3` | `#11284D` / `#162F58` / `#1B3764` | blancos cálidos | Tarjetas, hover, active |
| `--gold` / `-hover` / `-active` | `#C9A227` / `#E0C35A` / `#B08C1F` | `#8A5E0A` / `#A07010` / `#6F4B07` | Acento de marca y CTA primario |
| `--on-gold` | `#0A1A33` | `#FFFBF0` | Texto sobre oro |
| `--cream` / `-muted` / `-dim` | `#F5F1E6` / `#B8C2D6` / 62 % | `#14203A` / `#475569` / 62 % | Texto primario / secundario / terciario |
| `--border` / `-strong` / `-gold` | 8 % / 16 % blanco / oro 32 % | 10 % / 18 % marino | Bordes sutiles (`border-line…`) |
| `--success` | `#3DB882` | `#1F7A55` | Correcto, certificado |
| `--danger` | `#EF6363` | `#B42318` | Trampa, error (subido de `#E05252` para AA sobre marino) |
| `--amber` | `#F5A524` | `#9A5B00` | Aviso, testnet, simulación |
| `--info` / `--violet` / `--orange` | `#6BA4F8` / `#B794F6` / `#F29A4A` | versiones oscuras | Acentos de track |
| `--sim-*` | fijos | fijos | Pieles de apps simuladas (Discord, semáforo de ventana) |

Cada semántico tiene `-subtle` (fondo) y `-border`. Estado deshabilitado: `opacity .45` + `cursor-not-allowed`.

**Colores por track** (`src/components/trackStyle.ts`, única fuente): Phishing → danger, Activos falsos → amber, Ingeniería social → info, Aprobaciones → orange, Preventa → violet, Higiene de llaves → success.

### Tipografía

- Display, títulos y wordmark: **Playfair Display** 600–800 (serif elegante, `next/font`, variable `--font-playfair`), elegida con la skill ui-ux-pro-max (pareja "Classic Elegant" con Inter).
- Cuerpo: **Inter**. Mono: **IBM Plex Mono** para direcciones, hashes y código.
- Escala: `text-display` (36→52 px fluido), `text-title-1` (26→36), `text-title-2` (22), `text-title-3` (17), `text-body` (16), `text-body-sm` (14), `text-label` (12, semibold), `text-eyebrow` (12, mayúsculas, tracking amplio). Mínimo en toda la app: 12 px. Inputs a 16 px para evitar el zoom de iOS.
- Direcciones Stellar siempre en mono y truncadas al centro con `midTruncate()` (`src/lib/ownership.ts`); la dirección completa va en `title` y en la etiqueta accesible.

### Espaciado, radios, sombras

- Escala de 4 px de Tailwind. Margen lateral mínimo de 16 px con `px-gutter` (respeta `safe-area-inset-left/right`).
- Radios: controles `rounded-xl` (12), tarjetas `rounded-2xl` (16), tarjetas destacadas `rounded-3xl` (24).
- Sombras: `--shadow-sm/md/lg` y `--shadow-gold` para lo destacado.

### Móvil primero

- `viewport-fit=cover` y utilidades `pt-safe`, `pb-safe`, `px-gutter` con `env(safe-area-inset-*)`. Header fijo con `--header-h` y breadcrumb calculado con `calc(var(--header-h) + var(--safe-top))`.
- Área táctil mínima 44×44 (`tap`); CTAs primarios de 48–52 px, a ancho completo en teléfono.
- Contenido ancho (código) dentro de `scroll-x` con su propio scroll.
- En misiones, el botón de confirmar vive en una barra fija inferior en teléfono (fuera de contenedores con `transform` para que `fixed` funcione) y en línea en escritorio.

### Estados y movimiento

- `StatePanel` para vacío/error: ícono ilustrativo, título, mensaje humano y una acción.
- Esqueletos con la forma real del contenido; toasts (`useToast`) para éxito/error, con `aria-live`.
- Framer Motion con springs para interacción y tweens cortos para entradas; todas las animaciones respetan `useReducedMotion()` y `prefers-reduced-motion`. El contenido nunca se sirve oculto desde el servidor.

### Marca

- Wordmark `FYV Box` (Playfair Display 700, "Box" en oro) en navegación, 404, OG y footer. Sin escudos ni logos oficiales de la UNAM.
- Favicon SVG: monograma "F" en oro sobre marino; ícono de Apple "FYV." generado.

### Pendientes visuales

- Imagen OG específica por misión (hoy todas comparten la general).
- Confeti o celebración al certificar un track.
- Modo "repaso" de misiones completadas mostrando la respuesta correcta.

### Segunda pasada (skills ui-ux-pro-max + motion)

- Sin animaciones decorativas infinitas (logo flotante, halo pulsante, gradiente animado, formas flotantes): solo el shimmer de carga es continuo. Partículas solo en escritorio con mouse.
- Barras de progreso animan `transform` en vez de `width`; opciones de misión con feedback de presión (`active:scale`), desactivado con reduced-motion.
- Ninguna pantalla se sirve con contenido en `opacity: 0` desde el servidor (landing y misión).
- `/pitch` rehecho con el sistema de marca: Playfair + Inter + Plex Mono, íconos SVG (sin emojis ni escudo), conteos reales del catálogo, swipe nativo con scroll-snap, controles de 44 px, áreas seguras, teclado, `prefers-reduced-motion` y enlace directo a diapositiva (`/pitch#4`). El dato "$3.2B en LATAM" no tenía fuente y se reemplazó por una afirmación verificable.
- Pendiente: en Chrome headless dentro de un iframe el dashboard se quedó en esqueleto; en el navegador normal carga bien. Revisar en el celular (paso 2–3 del checklist).

### Feedback de prueba con usuarios (2026-09-26)

| Observación | Cambio |
|---|---|
| "100% caen" no dice de quién ni cuándo | Chips dicen "X% falló" y cada módulo explica "N de M personas que lo intentaron cayeron en la trampa en su primer intento". Recuadro "Cómo leer estos números" arriba de `/stats`. |
| "Track más difícil" es ambiguo | Ahora "módulo donde más gente falla", con el nombre del módulo debajo. |
| "0/5" no es obvio | "0 de 5 misiones" en encabezados y "0 de 5" en las barras, bajo el título "Misiones completadas por módulo". |
| Todo en cero parece vacío | "Siguiente meta: nivel N · te faltan X XP", botón "Empieza aquí / Tu siguiente misión" con la primera misión pendiente y mensaje "Es normal empezar en cero". |
| No queda claro para qué sirve la credencial | Bloque "¿Para qué sirve una credencial?" en `/graduation` (prueba sin datos personales, verificable por wallets/exchanges/comunidades, firmada por tu billetera, sin valor monetario) y texto concreto en la landing. |
| "Datos reales" con 3 personas | Se explica qué son (respuestas guardadas por la app, billeteras de prueba anónimas) y aparece un aviso de "muestra pequeña" mientras haya menos de 30 personas. |
| Mezcla de "track" y "módulo" | Toda la UI dice "módulo" (en el pitch "tracks" solo se usa para los tracks del hackathon). |

### Revisión en producción (2026-09-26)

- **Escenarios que contradecían su historia (bug previo):** el marco de phishing tenía fijos el remitente "Soporte Lumena" y el asunto "tu cuenta está comprometida" en las 5 misiones (incluida la del QR pegado en un evento); el airdrop de USDC mostraba "0 USDC"; el pool con 950% APY se pintaba como "balance recibido"; la whitelist APEX mostraba valores por defecto; y la firma decía "Red: Stellar Mainnet" en una misión de testnet. Los marcos se movieron a `src/app/mission/[id]/ScenarioFrames.tsx` y ahora leen todo de `actionParams` (se agregaron `channel`, `senderName`, `subject` y `amount` donde faltaban). Marcos nuevos: QR + formulario y pago con memo.
- `/stats`: si dos módulos empatan como "donde más gente falla", se indica el empate.
- La regla base de `h1–h4` pasó a `@layer base` para que las utilidades de Tailwind puedan sobrescribirla.

### Pasada visual "menos sencillo" (2026-09-26)

- **Hero:** vista previa real de la misión `phishing-001` (`src/app/HeroPreview.tsx`) con sus 3 señales de alerta numeradas y el resultado "+100 XP"; en escritorio acompaña a la pantera en la columna derecha, en móvil aparece bajo las cifras. Los datos salen del catálogo, no están inventados.
- **Nueva sección "Cómo funciona":** 3 pasos numerados con línea conectora (vertical en móvil, horizontal en escritorio).
- **Ritmo visual:** bandas de fondo alternadas en "Quiénes somos" y "¿A quién le sirve?".
- **Tarjetas de módulo:** acento de color del módulo, rango de dificultad real ("Básico → Avanzado") y leve elevación al pasar el cursor (desactivada con reduced-motion).
- **Bug:** los contadores animados de "Quiénes somos" podían quedarse en 0; ahora muestran el número real sin animación.
- **Dashboard:** anillo de progreso hacia el siguiente nivel en lugar del ícono plano.

### Feedback de Morita (2026-09-27)

- **Temporizadores estáticos:** la preventa ahora tiene una cuenta regresiva real (`⏱ Cierra en 01:59:57`, se reinicia al llegar a cero como haría una página fraudulenta) y las horas del correo, del DM de Discord y del pago con memo salen del reloj real del teléfono. Se calculan solo en el cliente para no provocar desajustes de hidratación.
- **Mapa tipo "caminito":** `src/app/dashboard/ModulePath.tsx`. Cada módulo es un encabezado con ilustración y progreso, seguido de nodos en zigzag unidos por un camino (punteado pendiente, verde completado). La siguiente misión se destaca en dorado con la etiqueta "Siguiente". Se quitó la lista de barras por módulo del bloque superior para no mostrar todo de golpe.
- **Mascota animada:** Stellar no tiene mascota oficial y sus ilustraciones son de su marca, así que se usa la mascota propia de FYV Box, la pantera (`public/panther-face.webp`, recortada del logo). En cada misión aparece como guía (`MascotGuide.tsx`) con un globo que cambia según el estado (leyendo, opción elegida, guardando, acierto, trampa, error) y reacciones de una sola vez: salta al acertar y sacude la cabeza al caer. Sin animaciones infinitas y sin movimiento con reduced-motion.
- **Estilo de ilustración tipo Stellar:** ilustraciones propias por módulo (`src/components/TrackArt.tsx`): contorno en el color del texto más una forma dorada desplazada. Se usan en el camino y en las tarjetas de la landing. En modo claro quedan con trazo oscuro y relleno dorado.
- `MissionCard` quedó sin uso y se eliminó.

### Feedback de Eli (2026-09-27)

- **"Todas las respuestas correctas son la C" (bug de contenido grave):** confirmado, 18 de 22 eran C y en 19 de 22 la correcta era además la opción más larga y la única con justificación. Ahora `loadCatalog()` coloca la correcta en una posición rotativa y estable (6 A · 6 B · 5 C · 5 D; la evaluación usa ids, así que no afecta el guardado ni las estadísticas). Se reescribieron las 88 opciones: correctas concisas y distractores con un razonamiento creíble; la correcta ahora es la más larga en 8 misiones, la 2.ª en 3, la 3.ª en 6 y la más corta en 5.
- **Faltaba "Siguiente misión":** el resultado ahora muestra un botón principal a la siguiente misión (o "Siguiente módulo" al terminar uno) y "Volver al mapa" como secundario. `MissionClient` se monta con `key={mission.id}` para que cada misión empiece limpia al navegar entre ellas.
- **Faltaba pie de página en la app:** `AppFooter` en mapa, misiones, estadísticas, credenciales y verificador (en misiones deja espacio para la barra fija de "Confirmar").

### Fondo ambiental 3D (2026-09-27)

- `src/components/AmbientBackground.tsx`, montado una vez en `layout.tsx` detrás de todo (`position: fixed; z-index: -10`, `body { isolation: isolate }`). Capas: aurora de gradientes que deriva, haces de luz que barren la escena, campo de estrellas en canvas que viaja hacia la cámara y se une en constelaciones, y figuras 3D reales con CSS (cubos, prismas y giroscopios con núcleo que pulsa) con brillo, más grano y viñeta para legibilidad.
- Parallax con el puntero (escritorio) y con el scroll (framer-motion `useScroll`/`useSpring`); cada figura se mueve según su profundidad.
- **Variante completa** en la landing y **tranquila** en el resto de pantallas (menos figuras y estrellas, opacidad menor) para no distraer durante las misiones. En modo claro las figuras se atenúan.
- **Rendimiento:** solo se animan `transform`/`opacity`, sin `filter: blur`; en móvil se muestran menos figuras y ~55% de las estrellas; el canvas se pausa cuando la pestaña está oculta. Con `prefers-reduced-motion` todo queda como una escena estática.
- Sustituye al fondo de partículas que solo tenía la landing.

### Verificación por correo con Pollar (2026-09-27)

- **Qué hace:** `/entrar` es un flujo de 3 pasos (Correo → Código → Listo). Pollar envía un código de un solo uso, al verificarlo crea una billetera Stellar **custodiada en testnet** ligada a ese correo, y el progreso se recupera desde cualquier dispositivo. Sin contraseñas.
- **Firmas:** cada respuesta se sigue firmando con SEP-53; con Pollar la firma la hace su servidor (`client.stellar.sep53.signMessage`) con el mismo esquema, así que `/api/missions/complete` la verifica igual que la de la billetera de prueba. No cambió nada del backend.
- **Pantalla:** indicador de pasos, código en 6 casillas con `autocomplete="one-time-code"` (el teléfono lo sugiere desde el correo) y envío automático al escribir el último dígito, reenvío con cuenta regresiva de 30 s, "Cambiar correo", errores en español (código incorrecto, expirado, sin conexión), y pantalla final con el correo y la dirección enlazada a Stellar Expert. `?next=` solo acepta rutas internas.
- **Modo invitado:** "Prefiero entrar sin correo" usa la billetera de prueba local de siempre. Sin `NEXT_PUBLIC_POLLAR_API_KEY` el sitio funciona exactamente como antes y `/entrar` ofrece solo el modo invitado.
- **Sesión:** mapa, misiones y credenciales mandan a `/entrar?next=…` si el modo es correo y no hay sesión. En el nav aparece la etiqueta "correo" y un botón real de **Cerrar sesión** (también en móvil).
- **Activarlo:** en [dashboard.pollar.xyz](https://dashboard.pollar.xyz) → Build → API Keys → Generate → tipo *publishable*, red *testnet* (`pub_testnet_…`, segura en el navegador; límite de 1,000 peticiones/día). Si el dashboard pide dominios permitidos, agregar `https://fyv-box.vercel.app` y `http://localhost:3000`. Luego `NEXT_PUBLIC_POLLAR_API_KEY` en Vercel (Production) y redeploy. **Nunca** usar la llave secreta `sec_…` en el frontend.

### Misión "El Drop de $PUMA" (2026-09-27)

- `fake-assets-001` (antes "El Airdrop Misterioso" con LUNACOIN) ahora simula un drop falso de **$PUMA**, el token de CriptoUNAM que reparte GOYA HACK: llegan 50,000,000 PUMA a Stellar desde un emisor desconocido con el memo "GOYA HACK drop · claim now". La lección: el nombre del token no prueba nada; según la página oficial del hackathon el drop real es en Avalanche, así que se confirma red y emisor en el canal oficial antes de abrir un trustline. Opciones de longitud pareja (67–75 caracteres) para no delatar la correcta.
- `WalletFrame` acepta un `memo` opcional en `actionParams`.

### Credenciales on-chain (2026-09-27)

- Al certificar un módulo, `/api/missions/complete` registra la credencial en Supabase y, después de responder (`after()`), la cuenta emisora envía a la dirección del usuario una transacción de testnet con memo `FYV cert <módulo>` (0.0000001 XLM, o `createAccount` si la cuenta no existe). Si Horizon falla, la credencial queda en Supabase y la UI dice "Registro on-chain pendiente".
- `/api/verify` lee esas transacciones de Horizon (fuente = cuenta emisora) y devuelve `txHash` por módulo; `/verify` y la página de credenciales enlazan cada una a Stellar Expert.
- `scripts/backfill-attestations.mjs` emitió on-chain las 6 credenciales que ya existían.

### Asistente de ayuda (2026-09-27)

- `src/components/HelpBot.tsx` + `src/lib/helpBot.ts`: botón flotante con la pantera que abre un chat de **respuestas predeterminadas (no es IA)**. 17 temas (qué es, cómo empezar, login con correo, invitado, dinero real, credencial on-chain, verificar, Stellar, drop de $PUMA, mensajes sospechosos, frase semilla, firmas, preventas, progreso, estadísticas, privacidad, código). Entiende preguntas libres por palabras clave (sin acentos ni mayúsculas) y sugiere preguntas relacionadas; cada respuesta enlaza a la pantalla o misión útil.
- No aparece dentro de las misiones para que no sirva de ayuda para contestar. Diálogo accesible (Esc cierra y regresa el foco al botón, aria-live), input de 16 px, 44 px de área táctil, animación con spring y sin movimiento con reduced-motion.

### Asistente: analizador de mensajes (2026-09-28)

- **Analizador de mensajes sospechosos (reglas, sin IA):** pegas un DM, correo o link y el asistente marca las señales: pide frase o llave, pide enviar dinero primero, pide conectar o firmar, urgencia, premio o airdrop, ganancias garantizadas, se hace pasar por soporte, te lleva a chat privado, y links peligrosos (acortadores, punycode, IP, dominios que imitan marcas como `lobstr-secure-login.com`). Da un nivel (riesgo alto, precaución o sin señales claras) y enlaza a la misión para practicar ese tipo de estafa. Todo corre en el navegador; el mensaje no se guarda ni se envía. Probado: 4 estafas reales en riesgo alto y 2 mensajes legítimos sin señales.
- **Detección automática:** si pegas algo largo, con un link o con varias señales, se analiza sin tener que pedirlo.
- **Sugerencias según la pantalla** (mapa, credenciales, verificador, entrar, estadísticas).
- **Tolera errores de dedo** ("fraze semiya" encuentra frase semilla) y responde saludos.
- **Aviso único** la primera visita ("¿Dudas o un mensaje raro? Pregúntame"), guardado en localStorage con try/catch.
