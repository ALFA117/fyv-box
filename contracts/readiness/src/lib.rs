#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String, Vec, symbol_short,
};

/// Almacena los módulos completados por dirección.
/// Estructura: Map<Address, Vec<ModuleRecord>>
#[contracttype]
#[derive(Clone)]
pub struct ModuleRecord {
    pub module: String,
    pub completed_at: u64, // Unix timestamp en segundos
}

#[contract]
pub struct ReadinessRegistry;

#[contractimpl]
impl ReadinessRegistry {
    /// Inicializa el contrato con la dirección autorizada del emisor FYV Box.
    pub fn initialize(env: Env, issuer: Address) {
        if env.storage().instance().has(&symbol_short!("issuer")) {
            panic!("already initialized");
        }
        env.storage().instance()
            .set(&symbol_short!("issuer"), &issuer);
        env.storage().instance()
            .extend_ttl(100_000, 100_000);
    }

    /// Registra un módulo completado para una dirección.
    /// Solo puede llamarlo el emisor autorizado de FYV Box.
    pub fn record_completion(env: Env, address: Address, module: String) {
        let issuer: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("issuer"))
            .expect("not initialized");

        issuer.require_auth();

        let key = address.clone();
        let mut records: Vec<ModuleRecord> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));

        // Verificar que no esté duplicado
        for r in records.iter() {
            if r.module == module {
                return; // ya registrado, idempotente
            }
        }

        records.push_back(ModuleRecord {
            module,
            completed_at: env.ledger().timestamp(),
        });

        env.storage().persistent().set(&key, &records);
        env.storage().persistent()
            .extend_ttl(&key, 100_000, 100_000);
    }

    /// Devuelve todos los módulos completados por una dirección.
    pub fn get_readiness(env: Env, address: Address) -> Vec<ModuleRecord> {
        env.storage()
            .persistent()
            .get(&address)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Verifica si una dirección tiene un módulo específico certificado.
    pub fn is_certified(env: Env, address: Address, module: String) -> bool {
        let records: Vec<ModuleRecord> = env
            .storage()
            .persistent()
            .get(&address)
            .unwrap_or_else(|| Vec::new(&env));

        for r in records.iter() {
            if r.module == module {
                return true;
            }
        }
        false
    }

    /// Devuelve la dirección del emisor autorizado.
    pub fn get_issuer(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&symbol_short!("issuer"))
            .expect("not initialized")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    #[test]
    fn test_initialize_and_record() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, ReadinessRegistry);
        let client = ReadinessRegistryClient::new(&env, &contract_id);

        let issuer = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&issuer);

        let module = String::from_str(&env, "phishing");
        client.record_completion(&user, &module);

        let records = client.get_readiness(&user);
        assert_eq!(records.len(), 1);
        assert!(client.is_certified(&user, &module));
    }

    #[test]
    fn test_idempotent_record() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, ReadinessRegistry);
        let client = ReadinessRegistryClient::new(&env, &contract_id);

        let issuer = Address::generate(&env);
        client.initialize(&issuer);

        let user = Address::generate(&env);
        let module = String::from_str(&env, "fake-assets");

        client.record_completion(&user, &module);
        client.record_completion(&user, &module); // segunda vez — no duplica

        let records = client.get_readiness(&user);
        assert_eq!(records.len(), 1);
    }

    #[test]
    fn test_not_certified_unknown_module() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, ReadinessRegistry);
        let client = ReadinessRegistryClient::new(&env, &contract_id);

        let issuer = Address::generate(&env);
        client.initialize(&issuer);

        let user = Address::generate(&env);
        let module = String::from_str(&env, "social-engineering");

        assert!(!client.is_certified(&user, &module));
    }

    #[test]
    fn test_multiple_modules() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, ReadinessRegistry);
        let client = ReadinessRegistryClient::new(&env, &contract_id);

        let issuer = Address::generate(&env);
        client.initialize(&issuer);

        let user = Address::generate(&env);
        let m1 = String::from_str(&env, "phishing");
        let m2 = String::from_str(&env, "fake-assets");

        client.record_completion(&user, &m1);
        client.record_completion(&user, &m2);

        assert_eq!(client.get_readiness(&user).len(), 2);
        assert!(client.is_certified(&user, &m1));
        assert!(client.is_certified(&user, &m2));
    }
}
