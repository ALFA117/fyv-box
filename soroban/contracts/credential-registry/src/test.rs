#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Env, Symbol};

fn contract_err(e: Error) -> soroban_sdk::Error {
    soroban_sdk::Error::from_contract_error(e as u32)
}

fn setup() -> (Env, CredentialRegistryClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(CredentialRegistry, ());
    let client = CredentialRegistryClient::new(&env, &id);
    let admin = Address::generate(&env);
    client.init(&admin);
    (env, client, admin)
}

#[test]
fn issues_and_reads_a_credential() {
    let (env, client, _) = setup();
    env.ledger().with_mut(|l| l.timestamp = 1_790_000_000);
    let user = Address::generate(&env);
    let phishing = Symbol::new(&env, "phishing");

    assert!(!client.is_certified(&user, &phishing));
    let at = client.issue(&user, &phishing);

    assert_eq!(at, 1_790_000_000);
    assert!(client.is_certified(&user, &phishing));
    assert_eq!(client.issued_at(&user, &phishing), Some(1_790_000_000));
    assert_eq!(client.modules(&user).len(), 1);
}

#[test]
fn issuing_twice_keeps_the_original_date_and_does_not_duplicate() {
    let (env, client, _) = setup();
    let user = Address::generate(&env);
    let m = Symbol::new(&env, "key_hygiene");

    env.ledger().with_mut(|l| l.timestamp = 100);
    client.issue(&user, &m);
    env.ledger().with_mut(|l| l.timestamp = 200);
    assert_eq!(client.issue(&user, &m), 100);
    assert_eq!(client.modules(&user).len(), 1);
}

#[test]
fn keeps_modules_per_holder() {
    let (env, client, _) = setup();
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    client.issue(&a, &Symbol::new(&env, "phishing"));
    client.issue(&a, &Symbol::new(&env, "presale"));
    client.issue(&b, &Symbol::new(&env, "approvals"));

    assert_eq!(client.modules(&a).len(), 2);
    assert_eq!(client.modules(&b).len(), 1);
    assert!(!client.is_certified(&b, &Symbol::new(&env, "phishing")));
}

#[test]
fn rejects_unknown_modules() {
    let (env, client, _) = setup();
    let user = Address::generate(&env);
    let res = client.try_issue(&user, &Symbol::new(&env, "made_up"));
    assert_eq!(res, Err(Ok(contract_err(Error::UnknownModule))));
}

#[test]
fn cannot_initialize_twice() {
    let (env, client, _) = setup();
    let res = client.try_init(&Address::generate(&env));
    assert_eq!(res, Err(Ok(contract_err(Error::AlreadyInitialized))));
}

#[test]
#[should_panic]
fn only_admin_can_issue() {
    let env = Env::default();
    let id = env.register(CredentialRegistry, ());
    let client = CredentialRegistryClient::new(&env, &id);
    let admin = Address::generate(&env);
    client.init(&admin);
    // Sin mock_all_auths: la firma del admin no está, así que issue debe fallar.
    client.issue(&Address::generate(&env), &Symbol::new(&env, "phishing"));
}
