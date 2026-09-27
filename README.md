# FYV Box

Simulador gratuito de estafas crypto en español. Las personas enfrentan escenarios realistas (phishing, airdrops falsos, ingeniería social, firmas peligrosas, preventas falsas, manejo de llaves) y, al completar un track, obtienen una credencial verificable ligada a su dirección de Stellar testnet.

**Live:** [fyv-box.vercel.app](https://fyv-box.vercel.app) · **Pitch:** `/pitch`

---

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind v4
- Supabase (Postgres) para progreso y credenciales
- Stellar testnet para identidad: keypair generado en el navegador y fondeado con Friendbot (`@stellar/stellar-sdk`)
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
| Pollar / Soroban / rampa Etherfuse | Tras flags apagados (`NEXT_PUBLIC_IDENTITY_PROVIDER`, `REGISTRY_BACKEND`, `NEXT_PUBLIC_ENABLE_RAMP`) | Sin cambios: siguen apagados y documentados; no se muestran en la UI |
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

- **Cerrar las escrituras anónimas en Supabase (crítico).** Las políticas de `001_fyv_tables.sql` permiten que la anon key pública (que viaja al navegador) inserte directamente en `fyv_module_completions`: cualquiera puede fabricar una credencial saltándose la API. El proyecto de Supabase vive en otra cuenta y no tuve acceso para aplicarlo. Pasos, **en este orden**:
  1. Vercel → Settings → Environment Variables → agregar `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → `service_role`) y redesplegar.
  2. Supabase → SQL Editor → correr `supabase/migrations/002_lockdown_writes.sql`.
  Si inviertes el orden, guardar respuestas deja de funcionar hasta que agregues la llave. Mientras tanto la app funciona igual que antes (el servidor avisa en logs que usa la anon key).
- **Soroban `getReadiness`** sigue siendo un stub; el backend por defecto (`supabase`) es el que está en uso.
- **Pollar SDK** no está publicado; el flag sigue apagado.
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
