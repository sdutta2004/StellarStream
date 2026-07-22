#![no_std]

/// ────────────────────────────────────────────────────────────────────────────
/// StellarStream Protocol Token (STRM)
///
/// A fungible token contract used to reward stream participants on the
/// StellarStream platform. Only the designated `admin` (set during
/// initialization — the StellarStream contract itself) may mint new tokens.
/// Token holders can transfer tokens or check their balance.
///
/// Tokenomics: 1 STRM is minted per 1 XLM streamed (1:1 ratio), creating
/// verifiable on-chain proof of streaming activity for senders and recipients.
///
/// Storage layout:
///   Instance  → Admin    (Address)
///   Instance  → Name     (String)
///   Instance  → Symbol   (String)
///   Persistent → Balance(owner: Address) → i128
/// ────────────────────────────────────────────────────────────────────────────
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, Env, String,
};

// ── Storage Keys ─────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Balance(Address),
}

// ── Errors ───────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Clone, Debug, PartialEq)]
pub enum StreamTokenError {
    AlreadyInitialized  = 1,
    NotInitialized      = 2,
    Unauthorized        = 3,
    InvalidAmount       = 4,
    InsufficientBalance = 5,
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct StreamTokenContract;

#[contractimpl]
impl StreamTokenContract {
    // ── Admin ─────────────────────────────────────────────────────────────────

    /// Initialize the STRM token with an admin (typically the StellarStream contract).
    ///
    /// May only be called once. The admin is the only account that can mint
    /// new STRM tokens.
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
    ) -> Result<(), StreamTokenError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(StreamTokenError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin,  &admin);
        env.storage().instance().set(&DataKey::Name,   &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().extend_ttl(100_000, 100_000);

        Ok(())
    }

    // ── Minting (admin-only) ──────────────────────────────────────────────────

    /// Mint `amount` STRM tokens to `to`.
    ///
    /// Only the admin (StellarStream contract) may call this.
    /// Called automatically when XLM is streamed: 1 STRM per 1 XLM.
    pub fn mint(
        env: Env,
        to: Address,
        amount: i128,
    ) -> Result<(), StreamTokenError> {
        // Verify caller is admin
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StreamTokenError::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(StreamTokenError::InvalidAmount);
        }

        let current = Self::balance_internal(&env, &to);
        let new_balance = current + amount;
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &new_balance);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(to), 100_000, 100_000);

        Ok(())
    }

    // ── Transfers ─────────────────────────────────────────────────────────────

    /// Transfer `amount` STRM tokens from `from` to `to`.
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), StreamTokenError> {
        from.require_auth();

        if amount <= 0 {
            return Err(StreamTokenError::InvalidAmount);
        }

        let from_balance = Self::balance_internal(&env, &from);
        if from_balance < amount {
            return Err(StreamTokenError::InsufficientBalance);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(from), 100_000, 100_000);

        let to_balance = Self::balance_internal(&env, &to);
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(to), 100_000, 100_000);

        Ok(())
    }

    // ── Read-Only Queries ─────────────────────────────────────────────────────

    /// Returns the STRM balance of `owner`.
    pub fn balance_of(env: Env, owner: Address) -> i128 {
        Self::balance_internal(&env, &owner)
    }

    /// Returns the token name ("StellarStream Reward").
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or_else(|| String::from_str(&env, "StellarStream Reward"))
    }

    /// Returns the token symbol ("STRM").
    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or_else(|| String::from_str(&env, "STRM"))
    }

    /// Returns the admin address.
    pub fn admin(env: Env) -> Result<Address, StreamTokenError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StreamTokenError::NotInitialized)
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    fn balance_internal(env: &Env, owner: &Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(owner.clone()))
            .unwrap_or(0i128)
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn setup() -> (Env, StreamTokenContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(StreamTokenContract, ());
        let client = StreamTokenContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.initialize(
            &admin,
            &String::from_str(&env, "StellarStream Reward"),
            &String::from_str(&env, "STRM"),
        );
        (env, client, admin)
    }

    #[test]
    fn test_initialize_and_metadata() {
        let (env, client, admin) = setup();
        assert_eq!(client.name(), String::from_str(&env, "StellarStream Reward"));
        assert_eq!(client.symbol(), String::from_str(&env, "STRM"));
        assert_eq!(client.admin(), admin);
    }

    #[test]
    fn test_mint_increases_balance() {
        let (env, client, _admin) = setup();
        let recipient = Address::generate(&env);
        assert_eq!(client.balance_of(&recipient), 0);
        client.mint(&recipient, &500_000_000_i128); // 50 STRM (in stroops)
        assert_eq!(client.balance_of(&recipient), 500_000_000);
    }

    #[test]
    fn test_transfer_tokens() {
        let (env, client, _admin) = setup();
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);
        client.mint(&sender, &1_000_000_000_i128);
        client.transfer(&sender, &receiver, &400_000_000_i128);
        assert_eq!(client.balance_of(&sender), 600_000_000);
        assert_eq!(client.balance_of(&receiver), 400_000_000);
    }

    #[test]
    fn test_double_initialize_fails() {
        let (env, client, admin) = setup();
        let result = client.try_initialize(
            &admin,
            &String::from_str(&env, "Dup"),
            &String::from_str(&env, "DUP"),
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_transfer_insufficient_balance_fails() {
        let (env, client, _admin) = setup();
        let sender = Address::generate(&env);
        let receiver = Address::generate(&env);
        let result = client.try_transfer(&sender, &receiver, &100_i128);
        assert!(result.is_err());
    }
}
