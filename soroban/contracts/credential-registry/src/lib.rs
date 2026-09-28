#![no_std]
//! FYV Box — registro de credenciales en Soroban (Stellar testnet).
//!
//! La cuenta emisora de FYV Box (admin) registra que una dirección aprobó un módulo del
//! simulador de estafas. Cualquiera puede consultar si una dirección tiene la credencial,
//! cuándo la obtuvo y qué módulos aprobó; cada emisión deja un evento `issued`.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, Address, Env, Symbol, Vec,
};

/// Los 6 módulos del simulador. Solo se aceptan estos identificadores.
const MODULES: [&str; 6] = [
    "phishing",
    "fake_assets",
    "social_eng",
    "approvals",
    "presale",
    "key_hygiene",
];

/// Las credenciales duran lo que dure el contrato: se extiende el TTL al escribir y leer.
const TTL_THRESHOLD: u32 = 100_000;
const TTL_EXTEND_TO: u32 = 3_000_000;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    /// (dirección, módulo) → ledger timestamp de emisión.
    Cert(Address, Symbol),
    /// dirección → módulos aprobados, en orden de emisión.
    Modules(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    UnknownModule = 3,
}

/// Evento publicado en cada credencial nueva.
#[contractevent(topics = ["issued"])]
pub struct Issued {
    #[topic]
    pub holder: Address,
    #[topic]
    pub module: Symbol,
    pub issued_at: u64,
}

#[contract]
pub struct CredentialRegistry;

#[contractimpl]
impl CredentialRegistry {
    /// Configura la cuenta emisora. Solo se puede llamar una vez.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
    }

    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized))
    }

    /// Emite la credencial de `module` para `holder`. Requiere la firma del admin.
    /// Es idempotente: si ya existe, devuelve la fecha original sin duplicar.
    pub fn issue(env: Env, holder: Address, module: Symbol) -> u64 {
        Self::admin(env.clone()).require_auth();
        if !Self::is_known(&env, &module) {
            panic_with_error!(&env, Error::UnknownModule);
        }

        let key = DataKey::Cert(holder.clone(), module.clone());
        let storage = env.storage().persistent();
        if let Some(at) = storage.get::<_, u64>(&key) {
            storage.extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
            return at;
        }

        let at = env.ledger().timestamp();
        storage.set(&key, &at);
        storage.extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);

        let list_key = DataKey::Modules(holder.clone());
        let mut list: Vec<Symbol> = storage.get(&list_key).unwrap_or(Vec::new(&env));
        list.push_back(module.clone());
        storage.set(&list_key, &list);
        storage.extend_ttl(&list_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        env.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
        Issued { holder, module, issued_at: at }.publish(&env);
        at
    }

    /// ¿`holder` aprobó `module`?
    pub fn is_certified(env: Env, holder: Address, module: Symbol) -> bool {
        env.storage().persistent().has(&DataKey::Cert(holder, module))
    }

    /// Fecha (ledger timestamp) de la credencial, si existe.
    pub fn issued_at(env: Env, holder: Address, module: Symbol) -> Option<u64> {
        env.storage().persistent().get(&DataKey::Cert(holder, module))
    }

    /// Módulos aprobados por `holder`, en orden de emisión.
    pub fn modules(env: Env, holder: Address) -> Vec<Symbol> {
        env.storage().persistent().get(&DataKey::Modules(holder)).unwrap_or(Vec::new(&env))
    }

    fn is_known(env: &Env, module: &Symbol) -> bool {
        MODULES.iter().any(|m| Symbol::new(env, m) == *module)
    }
}

mod test;
