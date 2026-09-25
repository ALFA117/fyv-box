# FYV Box — Onboarding Seguro para Stellar

> **FYV** = *Fíate y Verifica* — aprende a no caer en estafas crypto enfrentando simulacros con transacciones reales en testnet.

Live demo: https://fyv-box.vercel.app  
API pública: `GET https://fyv-box.vercel.app/api/verify`

---

## Diagrama de Arquitectura

```mermaid
flowchart TD
    A[Usuario Web2] -->|login email| B(Identidad\nsrc/identity)
    B -->|test-wallet / Pollar| C[Wallet Testnet]
    C --> D{Motor de Misiones\nsrc/missions}
    D -->|catálogo JSON validado con Zod| E[Simulacro\nPhishing / Fake Assets / Social Eng]
    E -->|acción real en testnet\nHorizon API| F[Stellar Testnet]
    E -->|resultado| G[API /missions/complete\nPOST]
    G -->|REGISTRY_BACKEND=supabase| H[(Supabase\nRegistro de Confianza)]
    G -->|REGISTRY_BACKEND=soroban| I[ReadinessRegistry\nContrato Soroban]
    H --> J[API /api/verify\nGET — CORS abierto]
    I --> J
    J --> K[Tercero\nwallet o dApp]
    H --> L[/stats\nTasa de trampa por track]
    H --> M[/graduation\nCredencial + Stellar Expert link]
```

---

## Demo en 2 Minutos

```bash
# 1. Clonar
git clone https://github.com/ALFA117/fyv-box.git && cd fyv-box

# 2. Instalar
npm install

# 3. Configurar (copia .env.local.example y completa los valores)
cp .env.local .env.local.bak  # ya viene configurado para demo testnet

# 4. Correr
npm run dev
# → http://localhost:3000
```

### Flujo de demo:
1. Abre `http://localhost:3000` — ingresa cualquier email y continúa
2. Verás el **mapa de misiones** con 3 tracks activos
3. Abre cualquier misión — lee la narrativa, elige tu respuesta
4. Si completas el track, aparece tu **credencial** en `/graduation`
5. Ve a `/verify?address=<tu-dirección>` para ver cómo un tercero verifica
6. Ve a `/stats` para ver la tasa de trampa por track

---

## API de Verificación Pública

### Verificar una dirección

```bash
# ¿Está certificado en algún módulo?
curl "https://fyv-box.vercel.app/api/verify?address=GABCDE..."

# ¿Está certificado específicamente en phishing?
curl "https://fyv-box.vercel.app/api/verify?address=GABCDE...&module=phishing"
```

### Respuesta

```json
{
  "address": "GABCDE...",
  "certified": true,
  "modules": [
    { "module": "phishing", "completedAt": "2026-09-25T03:00:00Z" },
    { "module": "fake-assets", "completedAt": "2026-09-25T03:15:00Z" }
  ],
  "backend": "supabase"
}
```

### Módulos disponibles

| `module`             | Descripción                          |
|---------------------|--------------------------------------|
| `phishing`          | Phishing e Impersonación             |
| `fake-assets`       | Activos y Airdrops Falsos            |
| `social-engineering`| Ingeniería Social                    |

### CORS

Abierto para todos los orígenes (`Access-Control-Allow-Origin: *`).  
Cada consulta se registra en `fyv_verify_log` — future punto de cobro por volumen.

---

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | — | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Clave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Clave service role (solo servidor) — obtenla en Supabase → Settings → API |
| `REGISTRY_BACKEND` | `supabase` | `supabase` o `soroban` |
| `NEXT_PUBLIC_IDENTITY_PROVIDER` | `test-wallet` | `test-wallet` o `pollar` |
| `FYV_ISSUER_SECRET` | — | Llave privada del emisor FYV Box (solo servidor) |
| `FYV_ISSUER_PUBLIC` | — | Llave pública del emisor |
| `SOROBAN_CONTRACT_ID` | — | ID del contrato ReadinessRegistry (si `REGISTRY_BACKEND=soroban`) |
| `NEXT_PUBLIC_ENABLE_RAMP` | `false` | Activa rampa Etherfuse (fase futura) |

---

## Deploy del Contrato Soroban

```bash
# Requisitos: Rust + soroban CLI
cargo install stellar-cli --locked

# Compilar
cd contracts/readiness
stellar contract build

# Deploy a testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/readiness_registry.wasm \
  --source <FYV_ISSUER_SECRET> \
  --network testnet

# Inicializar con la dirección del emisor
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <FYV_ISSUER_SECRET> \
  --network testnet \
  -- initialize \
  --issuer <FYV_ISSUER_PUBLIC>

# Actualizar .env.local:
# REGISTRY_BACKEND=soroban
# SOROBAN_CONTRACT_ID=<CONTRACT_ID>
```

---

## Decisiones de Diseño

| Decisión | Elección | Razón |
|----------|----------|-------|
| `REGISTRY_BACKEND` activo | `supabase` | Entorno Windows sin Soroban CLI; el contrato Rust está completo y probado |
| Identity provider | `test-wallet` | Pollar SDK no publicado en npm; caída transparente |
| Rampa fiat | Deshabilitada (`NEXT_PUBLIC_ENABLE_RAMP=false`) | Fee de partner y KYC se configuran en Fase 2 |
| Multi-tenant | `fyv_organizations` desde el inicio | Permite white-label a otros chapters (CriptoIPN, CriptoTEC) sin migrar datos |
| Supabase usado | Proyecto "squash" restaurado | Free tier limita a 2 proyectos activos; squash-pay (ETHOnline) ya terminó |

---

## Código y Herramientas Reutilizadas

- **Stellar SDK** (`@stellar/stellar-sdk`) — interacción con Horizon y Soroban
- **Soroban** — framework de contratos inteligentes en Stellar
- **Pollar** — identity provider con wallet embebida (integración pendiente)
- **Etherfuse** — rampa fiat→crypto (esqueleto, fase futura)
- **Supabase** — base de datos, RLS, registro de confianza como fallback
- **Next.js 16 App Router** — framework principal
- **framer-motion** — animaciones spring
- **Zod 4** — validación del catálogo de misiones
- **Claude Sonnet 4.6 (Claude Code)** — asistente de IA usado para generar el código de esta sesión

---

## Roadmap 2027

### Q1 2027 — Fundación de contenido
- Alimentar el catálogo con reportes reales de estafas de la comunidad CriptoUNAM
- Sumar tracks: **Aprobaciones Peligrosas** e **Higiene de Llaves**
- Desplegar contrato Soroban a testnet y activar `REGISTRY_BACKEND=soroban`
- Integrar Pollar para wallet embebida sin frase de recuperación

### Q2 2027 — Escalamiento
- Sumar track **Preventa y Rendimiento Falso**
- Activar rampa Etherfuse con fee de partner y flujo KYC
- White-label para otros chapters (CriptoIPN, CriptoTEC, CriptoUAM)
- Dashboard admin por organización

### Q3 2027 — Certificación por niveles
- Nivel Bronze / Silver / Gold basado en XP acumulado
- NFT de credencial en Stellar (SEP-39 / Stellar Quest estilo)
- Integración con wallets Stellar populares (Lobstr, Freighter) para mostrar badge

### Q4 2027 — Fondo de reembolso
- Fondo comunitario: usuarios certificados FYV Box elegibles para reembolso parcial si son víctimas de estafa documentada
- Monetización: cobro por volumen de consultas a `/api/verify` (el log ya está en producción)
- Migrar a mainnet Stellar

---

## Estructura del Proyecto

```
fyv-box/
├── src/
│   ├── app/                    # Next.js App Router pages + API routes
│   │   ├── api/verify/         # GET — verificación pública con CORS
│   │   ├── api/missions/       # GET list, POST complete
│   │   ├── api/stats/          # GET aggregate stats
│   │   ├── dashboard/          # Mapa de misiones
│   │   ├── mission/[id]/       # Vista de misión activa
│   │   ├── graduation/         # Credenciales obtenidas
│   │   ├── verify/             # Demo de verificación por tercero
│   │   └── stats/              # Vista de estadísticas
│   ├── missions/               # Motor de misiones + catálogo JSON
│   │   ├── schema.ts           # Zod schema
│   │   ├── engine.ts           # Loader + evaluador
│   │   └── catalog/            # JSONs versionados por misión
│   ├── registry/               # Capa de registro (Soroban | Supabase)
│   │   ├── interface.ts        # Contrato de la interfaz
│   │   ├── supabase-registry.ts
│   │   └── soroban-registry.ts
│   ├── identity/               # Proveedor de wallet
│   ├── ramp/                   # Etherfuse (esqueleto, deshabilitado)
│   ├── components/             # UI components
│   └── lib/                    # Supabase client
└── contracts/
    └── readiness/              # Contrato Soroban en Rust
        ├── Cargo.toml
        └── src/lib.rs          # ReadinessRegistry con tests
```
