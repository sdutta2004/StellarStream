#![no_std]

mod types;
mod events;
mod storage;
mod error;

use soroban_sdk::{
    contract, contractimpl, contractclient, token,
    Address, Env, String, Vec,
};

use types::{Grant, Application, GrantStatus, DataKey};
use error::StreamError;

pub use error::StreamError as Error;

// ──────────────────────────────────────────────────────────────────────────────
// Inter-Contract Interface: STRM Protocol Token
// ──────────────────────────────────────────────────────────────────────────────

/// Client interface for the STRM Protocol Token contract.
/// This enables cross-contract calls from StellarStreamContract → StreamTokenContract.
/// Every 1 XLM streamed mints 1 STRM token (1:1 ratio) to the stream participant.
#[contractclient(name = "RewardTokenClient")]
pub trait RewardToken {
    fn mint(env: Env, to: Address, amount: i128);
}

// ──────────────────────────────────────────────────────────────────────────────
// Contract Entry Point
// ──────────────────────────────────────────────────────────────────────────────

#[contract]
pub struct StellarStreamContract;

#[contractimpl]
impl StellarStreamContract {
    // ── Admin ─────────────────────────────────────────────────────────────────

    /// Initialize the StellarStream contract with an admin address.
    pub fn initialize(env: Env, admin: Address) -> Result<(), StreamError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(StreamError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::GrantCount, &0u32);

        // Extend instance TTL
        env.storage()
            .instance()
            .extend_ttl(100_000, 100_000);

        Ok(())
    }

    // ── Inter-Contract: STRM Protocol Token Configuration ─────────────────────

    /// Set the STRM protocol token contract address (admin-only).
    ///
    /// After this is set, every successful stream vault contribution will automatically
    /// trigger a cross-contract `mint` call on the STRM token contract, crediting
    /// the stream participant with 1 STRM token per 1 stroop streamed (1:1 ratio).
    pub fn set_reward_token(
        env: Env,
        admin: Address,
        token_address: Address,
    ) -> Result<(), StreamError> {
        admin.require_auth();

        // Verify caller is the stored admin
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StreamError::NotInitialized)?;

        if stored_admin != admin {
            return Err(StreamError::Unauthorized);
        }

        env.storage()
            .instance()
            .set(&DataKey::RewardToken, &token_address);
        env.storage()
            .instance()
            .extend_ttl(100_000, 100_000);

        Ok(())
    }

    /// Get the current STRM protocol token contract address (if configured).
    pub fn get_reward_token(env: Env) -> Option<Address> {
        env.storage()
            .instance()
            .get(&DataKey::RewardToken)
    }

    // ── Stream / Vault Management ─────────────────────────────────────────────

    /// Create a new payment stream / vesting vault.
    ///
    /// # Arguments
    /// * `creator`     - Stream sender / employer account (must sign)
    /// * `title`       - Stream title (max 100 chars)
    /// * `description` - Stream description / purpose (max 500 chars)
    /// * `goal`        - Total stream vault size in stroops (1 XLM = 10_000_000 stroops)
    /// * `deadline`    - Unix timestamp (seconds) for stream end time
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        goal: i128,
        deadline: u64,
    ) -> Result<u32, StreamError> {
        creator.require_auth();

        if goal <= 0 {
            return Err(StreamError::InvalidGoal);
        }

        let now = env.ledger().timestamp();
        if deadline <= now {
            return Err(StreamError::InvalidDeadline);
        }

        // Increment counter
        let grant_id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::GrantCount)
            .unwrap_or(0u32)
            + 1;

        env.storage()
            .instance()
            .set(&DataKey::GrantCount, &grant_id);

        let grant = Grant {
            id: grant_id,
            creator: creator.clone(),
            title: title.clone(),
            description,
            goal,
            deadline,
            raised: 0i128,
            status: GrantStatus::Active,
        };

        // Persist stream vault
        env.storage()
            .persistent()
            .set(&DataKey::Grant(grant_id), &grant);

        // Initialize vault contribution list
        let applications: Vec<Application> = Vec::new(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Applications(grant_id), &applications);

        // Extend TTL for persistent entries
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Grant(grant_id), 100_000, 100_000);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Applications(grant_id), 100_000, 100_000);

        // Emit event
        events::grant_created(&env, grant_id, &creator, title, goal, deadline);

        Ok(grant_id)
    }

    /// Deposit XLM into a payment stream vault.
    ///
    /// The recipient must have pre-approved the transfer via the token contract.
    /// Uses the native XLM token (Stellar Asset Contract).
    ///
    /// If a STRM protocol token is configured via `set_reward_token`, the depositor
    /// will automatically receive STRM tokens equal to the stroops deposited
    /// via a cross-contract mint call (1 STRM per 1 XLM streamed).
    pub fn donate(
        env: Env,
        campaign_id: u32,
        donor: Address,
        amount: i128,
    ) -> Result<(), StreamError> {
        donor.require_auth();

        if amount <= 0 {
            return Err(StreamError::InvalidAmount);
        }

        let mut grant: Grant = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(campaign_id))
            .ok_or(StreamError::StreamNotFound)?;

        let now = env.ledger().timestamp();

        if grant.status != GrantStatus::Active {
            return Err(StreamError::StreamNotActive);
        }

        if now > grant.deadline {
            // Auto-expire stream
            grant.status = GrantStatus::Expired;
            env.storage()
                .persistent()
                .set(&DataKey::Grant(campaign_id), &grant);
            return Err(StreamError::StreamExpired);
        }

        // Transfer XLM from depositor to contract (stream vault)
        let native_token = token::Client::new(&env, &get_native_asset(&env));
        native_token.transfer(&donor, &env.current_contract_address(), &amount);

        // Update vested/streamed amount
        grant.raised += amount;

        // Check if stream vault goal reached
        if grant.raised >= grant.goal {
            grant.status = GrantStatus::Successful;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Grant(campaign_id), &grant);

        // Record vault deposit detail
        let mut applications: Vec<Application> = env
            .storage()
            .persistent()
            .get(&DataKey::Applications(campaign_id))
            .unwrap_or_else(|| Vec::new(&env));

        let app = Application {
            donor: donor.clone(),
            amount,
            timestamp: now,
        };
        applications.push_back(app);

        env.storage()
            .persistent()
            .set(&DataKey::Applications(campaign_id), &applications);

        // Extend TTLs
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Grant(campaign_id), 100_000, 100_000);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Applications(campaign_id), 100_000, 100_000);

        // ── Inter-Contract Call: Mint STRM Protocol Tokens ────────────────────
        // Mint STRM tokens to the stream participant as on-chain streaming proof.
        // 1 STRM is minted per 1 XLM streamed (1:1 ratio).
        if let Some(reward_token_id) = env
            .storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::RewardToken)
        {
            let reward_client = RewardTokenClient::new(&env, &reward_token_id);
            // Best-effort
            let _ = reward_client.try_mint(&donor, &amount);
        }

        // Emit event
        events::grant_funded(&env, campaign_id, &donor, amount, grant.raised);

        Ok(())
    }

    /// Withdraw vested XLM from a fully-funded payment stream vault.
    ///
    /// Only the stream sender (vault creator) can withdraw after the stream vault goal is reached.
    pub fn withdraw(
        env: Env,
        campaign_id: u32,
        creator: Address,
    ) -> Result<i128, StreamError> {
        creator.require_auth();

        let mut grant: Grant = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(campaign_id))
            .ok_or(StreamError::StreamNotFound)?;

        if grant.creator != creator {
            return Err(StreamError::Unauthorized);
        }

        if grant.status != GrantStatus::Successful {
            // Check if deadline passed and goal not reached
            let now = env.ledger().timestamp();
            if now > grant.deadline && grant.status == GrantStatus::Active {
                grant.status = GrantStatus::Expired;
                env.storage()
                    .persistent()
                    .set(&DataKey::Grant(campaign_id), &grant);
            }
            return Err(StreamError::StreamNotSuccessful);
        }

        let amount = grant.raised;

        if amount == 0 {
            return Err(StreamError::NothingToWithdraw);
        }

        // Transfer vested XLM to stream sender
        let native_token = token::Client::new(&env, &get_native_asset(&env));
        native_token.transfer(&env.current_contract_address(), &creator, &amount);

        // Mark stream as completed/withdrawn
        grant.raised = 0;
        grant.status = GrantStatus::Withdrawn;
        env.storage()
            .persistent()
            .set(&DataKey::Grant(campaign_id), &grant);

        // Emit event
        events::funds_claimed(&env, campaign_id, &creator, amount);

        Ok(amount)
    }

    /// Cancel stream and refund unvested XLM if the stream expired without meeting its vault goal.
    pub fn refund(
        env: Env,
        campaign_id: u32,
        donor: Address,
    ) -> Result<i128, StreamError> {
        donor.require_auth();

        let mut grant: Grant = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(campaign_id))
            .ok_or(StreamError::StreamNotFound)?;

        let now = env.ledger().timestamp();

        // Stream must be expired
        if grant.status == GrantStatus::Active && now > grant.deadline {
            grant.status = GrantStatus::Expired;
            env.storage()
                .persistent()
                .set(&DataKey::Grant(campaign_id), &grant);
        }

        if grant.status != GrantStatus::Expired {
            return Err(StreamError::StreamNotExpired);
        }

        // Find the recipient's total vault contributions
        let applications: Vec<Application> = env
            .storage()
            .persistent()
            .get(&DataKey::Applications(campaign_id))
            .unwrap_or_else(|| Vec::new(&env));

        let mut refund_amount: i128 = 0;
        let mut new_apps: Vec<Application> = Vec::new(&env);

        for app in applications.iter() {
            if app.donor == donor {
                refund_amount += app.amount;
            } else {
                new_apps.push_back(app);
            }
        }

        if refund_amount == 0 {
            return Err(StreamError::NoVaultFound);
        }

        // Transfer unvested XLM refund to stream recipient
        let native_token = token::Client::new(&env, &get_native_asset(&env));
        native_token.transfer(
            &env.current_contract_address(),
            &donor,
            &refund_amount,
        );

        // Update stream and vault contribution records
        grant.raised -= refund_amount;
        env.storage()
            .persistent()
            .set(&DataKey::Grant(campaign_id), &grant);
        env.storage()
            .persistent()
            .set(&DataKey::Applications(campaign_id), &new_apps);

        // Emit event
        events::refund_issued(&env, campaign_id, &donor, refund_amount);

        Ok(refund_amount)
    }

    // ── Read-Only Queries ─────────────────────────────────────────────────────

    /// Get a single payment stream by ID.
    pub fn get_campaign(env: Env, campaign_id: u32) -> Result<Grant, StreamError> {
        env.storage()
            .persistent()
            .get(&DataKey::Grant(campaign_id))
            .ok_or(StreamError::StreamNotFound)
    }

    /// Get total number of payment streams created.
    pub fn get_campaign_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::GrantCount)
            .unwrap_or(0u32)
    }

    /// Get all payment streams (paginated).
    pub fn get_campaigns(env: Env, start_id: u32, limit: u32) -> Vec<Grant> {
        let total: u32 = env
            .storage()
            .instance()
            .get(&DataKey::GrantCount)
            .unwrap_or(0u32);

        let mut result: Vec<Grant> = Vec::new(&env);
        let end = (start_id + limit).min(total + 1);

        for id in start_id..end {
            if let Some(grant) = env
                .storage()
                .persistent()
                .get::<DataKey, Grant>(&DataKey::Grant(id))
            {
                result.push_back(grant);
            }
        }

        result
    }

    /// Get all vault deposits for a payment stream.
    pub fn get_donations(env: Env, campaign_id: u32) -> Vec<Application> {
        env.storage()
            .persistent()
            .get(&DataKey::Applications(campaign_id))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Result<Address, StreamError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StreamError::NotInitialized)
    }

    /// Extend a payment stream's end time.
    pub fn extend_deadline(
        env: Env,
        campaign_id: u32,
        creator: Address,
        new_deadline: u64,
    ) -> Result<(), StreamError> {
        creator.require_auth();

        let mut grant: Grant = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(campaign_id))
            .ok_or(StreamError::StreamNotFound)?;

        if grant.creator != creator {
            return Err(StreamError::Unauthorized);
        }

        if grant.status != GrantStatus::Active {
            return Err(StreamError::StreamNotActive);
        }

        let now = env.ledger().timestamp();
        if new_deadline <= now || new_deadline <= grant.deadline {
            return Err(StreamError::InvalidDeadline);
        }

        grant.deadline = new_deadline;
        env.storage()
            .persistent()
            .set(&DataKey::Grant(campaign_id), &grant);

        Ok(())
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/// Returns the Stellar native asset (XLM) contract address.
fn get_native_asset(env: &Env) -> Address {
    Address::from_str(
        env,
        "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        Address, Env, String,
    };

    fn create_env() -> Env {
        let env = Env::default();
        env.mock_all_auths();
        env
    }

    fn setup_contract(env: &Env) -> (StellarStreamContractClient<'_>, Address) {
        let contract_id = env.register(StellarStreamContract, ());
        let client = StellarStreamContractClient::new(env, &contract_id);
        let admin = Address::generate(env);
        client.initialize(&admin);
        (client, admin)
    }

    #[test]
    fn test_initialize() {
        let env = create_env();
        let contract_id = env.register(StellarStreamContract, ());
        let client = StellarStreamContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.initialize(&admin);
        assert_eq!(client.get_admin(), admin);
        assert_eq!(client.get_campaign_count(), 0u32);
    }

    #[test]
    fn test_double_initialize_fails() {
        let env = create_env();
        let (client, admin) = setup_contract(&env);
        let result = client.try_initialize(&admin);
        assert!(result.is_err());
    }

    #[test]
    fn test_create_stream() {
        let env = create_env();
        let (client, _admin) = setup_contract(&env);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Monthly Salary Stream");
        let description = String::from_str(&env, "Real-time XLM salary vesting stream for employee");
        let goal: i128 = 1_000_000_000;
        let deadline: u64 = env.ledger().timestamp() + 86_400;

        let id = client.create_campaign(&creator, &title, &description, &goal, &deadline);
        assert_eq!(id, 1u32);
        assert_eq!(client.get_campaign_count(), 1u32);

        let grant = client.get_campaign(&1u32);
        assert_eq!(grant.creator, creator);
        assert_eq!(grant.goal, goal);
        assert_eq!(grant.raised, 0);
        assert_eq!(grant.status, GrantStatus::Active);
    }

    #[test]
    fn test_create_stream_invalid_goal_fails() {
        let env = create_env();
        let (client, _admin) = setup_contract(&env);
        let creator = Address::generate(&env);
        let deadline = env.ledger().timestamp() + 86_400;
        let result = client.try_create_campaign(
            &creator,
            &String::from_str(&env, "Bad Stream"),
            &String::from_str(&env, "Bad stream desc"),
            &0_i128,
            &deadline,
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_set_reward_token() {
        let env = create_env();
        let (client, admin) = setup_contract(&env);
        let fake_token = Address::generate(&env);
        client.set_reward_token(&admin, &fake_token);
        assert_eq!(client.get_reward_token(), Some(fake_token));
    }

    #[test]
    fn test_set_reward_token_unauthorized_fails() {
        let env = create_env();
        let (client, _admin) = setup_contract(&env);
        let attacker = Address::generate(&env);
        let fake_token = Address::generate(&env);
        let result = client.try_set_reward_token(&attacker, &fake_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_streams_paginated() {
        let env = create_env();
        let (client, _admin) = setup_contract(&env);
        let creator = Address::generate(&env);
        let deadline = env.ledger().timestamp() + 86_400;

        for i in 1u32..=3 {
            let title = String::from_str(&env, "Payment Stream");
            let desc = String::from_str(&env, "Salary vesting stream");
            client.create_campaign(&creator, &title, &desc, &1_000_000_i128, &deadline);
            assert_eq!(client.get_campaign_count(), i);
        }

        let page = client.get_campaigns(&1u32, &2u32);
        assert_eq!(page.len(), 2);
        let page2 = client.get_campaigns(&3u32, &2u32);
        assert_eq!(page2.len(), 1);
    }

    #[test]
    fn test_extend_stream_deadline() {
        let env = create_env();
        let (client, _admin) = setup_contract(&env);
        let creator = Address::generate(&env);
        let original_deadline = env.ledger().timestamp() + 86_400;
        client.create_campaign(
            &creator,
            &String::from_str(&env, "Salary Stream"),
            &String::from_str(&env, "Monthly employee salary"),
            &1_000_000_i128,
            &original_deadline,
        );
        let new_deadline = original_deadline + 86_400;
        client.extend_deadline(&1u32, &creator, &new_deadline);
        let grant = client.get_campaign(&1u32);
        assert_eq!(grant.deadline, new_deadline);
    }
}
