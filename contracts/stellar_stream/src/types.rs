use soroban_sdk::{contracttype, Address, String};

// ──────────────────────────────────────────────────────────────────────────────
// Storage Keys
// ──────────────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum DataKey {
    Admin,
    GrantCount,
    Grant(u32),
    Applications(u32),
    RewardToken,
}

// ──────────────────────────────────────────────────────────────────────────────
// Stream / Vault Status
// ──────────────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum GrantStatus {
    Active,
    Successful,
    Expired,
    Withdrawn,
}

// ──────────────────────────────────────────────────────────────────────────────
// Payment Stream / Vesting Vault
// ──────────────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug)]
pub struct Grant {
    /// Unique stream ID (auto-incremented).
    pub id: u32,
    /// Address of the stream sender / employer who created the stream.
    pub creator: Address,
    /// Stream title.
    pub title: String,
    /// Stream description / purpose.
    pub description: String,
    /// Total stream vault in stroops (1 XLM = 10_000_000 stroops).
    pub goal: i128,
    /// Unix timestamp (seconds) after which the stream expires / closes.
    pub deadline: u64,
    /// Total amount vested/streamed so far, in stroops.
    pub raised: i128,
    /// Current status of the payment stream.
    pub status: GrantStatus,
}

// ──────────────────────────────────────────────────────────────────────────────
// Stream Contribution / Vault Deposit
// ──────────────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug)]
pub struct Application {
    /// Address of the stream recipient / employee who deposited into the vault.
    pub donor: Address,
    /// Amount deposited in stroops.
    pub amount: i128,
    /// Ledger timestamp when the vault deposit was made.
    pub timestamp: u64,
}
