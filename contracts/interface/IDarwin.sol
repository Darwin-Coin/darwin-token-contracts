pragma solidity 0.8.14;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";

interface IDarwin is IERC20Upgradeable {
    /// TransferFrom amount is greater than allowance
    error InsufficientAllowance();
    /// Only the DarwinCommunity can call this function
    error OnlyDarwinCommunity();
    /// rAmount is greater than the total reflections
    error RAmountGreaterThanReflections();
    /// Input cannot be the zero address
    error ZeroAddress();
    /// Amount cannot be 0
    error ZeroAmount();
    /// Arrays must be the same length
    error InvalidArrayLengths();
    /// Pair is already registered
    error PairAlreadyRegistered();
    /// Pair is not registered
    error PairNotRegistered();
    /// Holding limit exceeded
    error HoldingLimitExceeded();
    /// Sell limit exceeded
    error SellLimitExceeded();
    /// Paused
    error Paused();

    event ExchangeAdded(address account);
    event ExchangedRemoved(address account);

    event TokenReflection(uint256 amount);

    event ExcludedFromReflection(address account, bool isExcluded);
    event ExcludedFromSellLimit(address account, bool isExcluded);

    function syncTokenInOutOfSyncExchangesSafe() external;

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external;

    function getOutOfSyncedAmount(address pair) external view returns (uint256);

    function getOutOfSyncedPairs() external view returns (address[] memory);

    function isExchangeAddress(address account) external view returns (bool);

    function isExcludedFromReward(address account) external view returns (bool);

    function isExcludedFromTxLimit(address account) external view returns (bool);

    function isExcludedFromHoldingLimit(address account) external view returns (bool);
}
