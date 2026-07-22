use soroban_sdk::{contracterror};

#[contracterror]
#[derive(Clone, Debug, PartialEq)]
pub enum StreamError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    StreamNotFound = 4,
    StreamNotActive = 5,
    StreamExpired = 6,
    StreamNotSuccessful = 7,
    StreamNotExpired = 8,
    InvalidGoal = 9,
    InvalidDeadline = 10,
    InvalidAmount = 11,
    NothingToWithdraw = 12,
    NoVaultFound = 13,
    TransferFailed = 14,
}
