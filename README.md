# FYV Box

Plataforma de entrenamiento anti-estafas para el ecosistema Web3/Stellar. Los usuarios enfrentan simulacros reales (phishing, activos falsos, ingeniería social, etc.) y obtienen una credencial verificable al completar un track.

**Live:** [fyv-box.vercel.app](https://fyv-box.vercel.app)

---

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind v4
- Supabase (Postgres) para progreso y certificaciones
- Stellar testnet para identidad (keypair ephemero vía `@stellar/stellar-sdk`)
- Framer Motion para animaciones
- Vercel (deploy automático en cada push a `master`)

## Variables de entorno necesarias

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FYV_ISSUER_SECRET=          # solo si REGISTRY_BACKEND=soroban
SOROBAN_CONTRACT_ID=        # solo si REGISTRY_BACKEND=soroban
REGISTRY_BACKEND=supabase   # "supabase" (default) | "soroban"
```

## Tablas Supabase necesarias

- `fyv_mission_progress` — registro de cada intento por misión
- `fyv_completed_missions` — misiones completadas correctamente
- `fyv_module_completions` — tracks certificados (un registro por track)
- `fyv_verify_log` — log de queries al endpoint `/api/verify`

---

## AUDIT_NOTES

_Generado 2026-09-26 — auditoría completa de punta a punta._

### Inventario de funciones y estado real

| Función / Endpoint | Estado | Notas |
|---|---|---|
| `/api/missions/list` | ✅ Funciona | Lee 22 JSONs desde `src/missions/catalog/` vía `require()` |
| `/api/missions/complete` | ✅ Funciona | Evalúa respuesta, escribe `fyv_mission_progress` + `fyv_completed_missions`, llama al registry si el track se completa |
| `/api/verify` | ✅ Funciona | CORS abierto, valida formato Stellar (`/^G[A-Z2-7]{55}$/`), loguea queries en `fyv_verify_log` |
| `/api/stats` | ✅ Funciona | Agrega datos reales de `fyv_mission_progress`; primer intento por usuario·misión |
| Track completion (`isTrackComplete`) | ✅ Funciona | Compara misiones no-comingSoon del track contra completedIds |
| Certifications (`getCertifiableModules`) | ✅ Funciona | Retorna tracks donde todas las misiones están completas |
| Supabase registry | ✅ Funciona | Escribe/lee `fyv_module_completions` con service-role key |
| Soroban registry `recordCompletion` | ⚠️ Parcial | Implementado, activo solo con `REGISTRY_BACKEND=soroban`; en default no se usa |
| Soroban registry `getReadiness` | ⚠️ Stub | Devuelve array vacío con `console.warn`; documentado como TODO |
| Pollar identity provider | ⚠️ Mock transparente | Delega a `test-wallet` sin UI visible; documentado como TODO Phase 2 |
| Test wallet (`test-wallet.ts`) | ✅ Funciona | Genera keypair real en localStorage, funde vía Friendbot en testnet real |
| FOUC dark mode | ✅ Resuelto | `data-theme="dark"` en HTML + script inline de localStorage |
| OG / meta tags | ✅ Completo | `opengraph-image.tsx` genera imagen dinámica 1200×630; layout.tsx tiene title/description |
| Favicon | ✅ Existe | `/public/favicon.svg` referenciado en layout.tsx |
| 404 page | ✅ Existe | `src/app/not-found.tsx` con marca FYV Box |

### Bugs encontrados y corregidos

1. **`verify/page.tsx` — moduleLabels incompleto** (commit `audit-fixes`)
   - Solo tenía labels para `phishing`, `fake-assets`, `social-engineering`.
   - Usuarios que certifiquen `dangerous-approvals`, `presale-scam`, `key-hygiene` veían el ID crudo.
   - **Fix:** Añadidos los 3 tracks faltantes.

2. **`graduation/page.tsx` — texto "on-chain" incorrecto** (commit `audit-fixes`)
   - Decía "Credenciales on-chain emitidas en Stellar testnet" pero el backend default es Supabase.
   - Stellar testnet solo se usa para la identidad (keypair del usuario); las certificaciones van a Supabase.
   - **Fix:** Cambiado a "Credenciales verificables asociadas a tu dirección Stellar testnet".

3. **Sin OG image** (commit `audit-fixes`)
   - `layout.tsx` tenía metadatos OG pero sin `images`, resultando en preview vacío al compartir.
   - **Fix:** Creado `src/app/opengraph-image.tsx` con Next.js ImageResponse (1200×630, Edge Runtime).

### Mocks que quedan (justificados)

- **Pollar SDK** — no existe aún en npm. El fallback a test-wallet es intencional y documentado.
- **Soroban `getReadiness`** — stub con advertencia; la implementación completa requiere simulación de contrato. El flujo de certifications usa Supabase (que sí funciona).
- **Entorno de práctica** — los ScenarioFrames (EmailFrame, DiscordFrame, etc.) son simulaciones UI, no conexiones reales. Correcto por diseño (es un sandbox de entrenamiento).

### Pendientes reales (no solucionables en esta corrida)

- **Tests automatizados** — el proyecto no tiene test suite. Para añadir: `npm install -D vitest @testing-library/react` y cubrir `engine.ts` (evaluateMission, isTrackComplete) con unitarias, y el complete route con mocks de Supabase.
- **Soroban getReadiness** — requiere Contract simulation en Soroban RPC, fuera del alcance de esta corrida.
- **RLS de Supabase** — la graduation page usa el cliente público (anon key) para leer `fyv_module_completions`. Si hay RLS restrictiva puede devolver vacío. Verificar policy: `SELECT WHERE stellar_address = stellarAddress` debe estar habilitada para anon.

### Checklist de verificación en 2 minutos

```
1. Abre fyv-box.vercel.app — debe cargar sin flash de pantalla blanca
2. Haz clic en "Entrenar" → lleva al dashboard (o pide nombre si primer acceso)
3. Elige una misión → pantalla de 2 columnas con escenario a la izquierda
4. Selecciona opción A → botón "Confirmar respuesta" se activa
5. Confirma → aparece resultado (correcto o incorrecto) con XP
6. Ve al dashboard → la misión aparece con ✓ verde
7. Ve a /verify → pega tu dirección Stellar → responde con certified/modules
8. Ve a /stats → muestra datos agregados (o "Sin datos" si BD vacía)
9. Comparte el link en WhatsApp → debe mostrar preview con la imagen OG
```

---

## DESIGN_NOTES

_Sistema de diseño aplicado en FYV Box._

### Tokens de diseño

Definidos en `src/app/globals.css`:

| Token | Valor (dark) | Uso |
|---|---|---|
| `--navy` | `#0A1A33` | Fondo base |
| `--surface` | `#11284D` | Cards primer nivel |
| `--surface-2` | `#162F58` | Cards segundo nivel |
| `--gold` | `#C9A227` | Acento marca, CTAs primarios |
| `--cream` | `#F5F1E6` | Texto primario |
| `--cream-muted` | `#B8C2D6` | Texto secundario |
| `--danger` | `#E05252` | Trampas, phishing, alertas |
| `--success` | `#3DB882` | Correcto, certificado |
| `--amber` | `#F59E0B` | Advertencia, dificultad intermedia |

### Tipografía

- **Display/Títulos:** Syne 700/800 (variable `--font-playfair` por compatibilidad con componentes)
- **Cuerpo:** Inter 400 (variable `--font-inter`)
- **Mono:** IBM Plex Mono 400/500 (variable `--font-mono`) — direcciones Stellar y hashes

### Decisiones de diseño

- **Escenarios inmersivos en misiones:** cada track tiene su propio frame (email, Discord, wallet, etc.) para que el usuario vea la trampa en su contexto real, no como texto plano.
- **Layout 2 columnas en misiones (lg+):** escenario a la izquierda (3/5), panel de respuestas sticky a la derecha (2/5). En móvil es columna única.
- **Glow radial por track:** cada misión tiene un glow sutil en el fondo que corresponde al color del track activo.
- **Strip de breadcrumb sticky:** siempre visible debajo de la navbar, muestra la ruta y el XP de la misión.
- **Skeleton loading:** todos los estados de carga usan esqueletos, nunca spinner solitario en pantalla vacía.
- **Soporte dark/light:** tokens redefinidos en `[data-theme="light"]`, default siempre oscuro.

### Pendientes visuales (no tocados por afectar lógica)

- **Social share image personalizada por misión** — requeriría parámetros dinámicos en OG route, fuera del scope.
- **Animación de confetti al certificar track** — requiere lógica de estado nuevo; no tocado.
- **Modo de "replay" en misiones completadas** — re-renderizar con la respuesta correcta; no tocado.
