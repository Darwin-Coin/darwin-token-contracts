// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

/// @title Interface for the Darwin Presale
interface IDarwinPresale {

    /// Presale contract is already initialized
    error AlreadyInitialized();
    /// Presale contract is not initialized
    error NotInitialized();
    /// Presale has not started yet
    error PresaleNotActive();
    /// Presale has not ended yet
    error PresaleNotEnded();
    /// Pair has not been created on the AMM
    // error PairNotFound();
    /// Parameter cannot be the zero address
    error ZeroAddress();
    /// New rate cannot be less than the current rate
    error InvalidRate();
    /// Start date cannot be less than the current timestamp
    error InvalidStartDate();
    /// End date cannot be less than the start date or the current timestamp
    error InvalidEndDate();
    /// Deposit amount must be between 0.1 and 4,000 BNB
    error InvalidDepositAmount();
    /// Deposit amount exceeds the hardcap
    error AmountExceedsHardcap();
    /// Attempted transfer failed
    error TransferFailed();
    /// ERC20 token approval failed
    error ApproveFailed();

    /// @notice Emitted when bnb is deposited
    /// @param user Address of the user who deposited
    /// @param amountIn Amount of BNB deposited
    /// @param darwinAmount Amount of Darwin received
    /// @param finchAmount Amount of Finch received
    event UserDeposit(address indexed user, uint256 indexed amountIn, uint256 indexed darwinAmount, uint256 finchAmount);
    event MarketingWithdrawal(uint256 indexed amount);
    event LockDelaySet(uint256 indexed delay);
    event DarwinEcosystemSet(address indexed darwinEcosystem);
    event TokenRatesSet(uint256[9] indexed tokenRates);
    event PresaleEndDateSet(uint256 indexed endDate);
    event MarketingWalletSet(address indexed marketingWallet);
    event TeamWalletSet(address indexed teamWallet);
    event RouterSet(address indexed router);
    event LpProvided(uint256 indexed lpAmount, uint256 indexed remainingAmount);
    
}