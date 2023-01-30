pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

interface IDarwin {

    /// @notice Accumulatively log sold tokens
    struct TokenSellLog {
        uint40 lastSale;
        uint216 amount;
    }

    event ExcludedFromReflection(address account, bool isExcluded);
    event ExcludedFromSellLimit(address account, bool isExcluded);

    function syncTokenInOutOfSyncExchangesSafe() external;

    function pause() external;

    function unpause() external;

    function setRouter(address _newRouter, bool _isDarwinSwap) external;

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external;

    function getOutOfSyncedAmount(address pair) external view returns (uint256);

    function getOutOfSyncedPairs() external view returns (address[] memory);

    function isExchangeAddress(address account) external view returns (bool);

    function isExcludedFromReward(address account) external view returns (bool);

    function isExcludedFromTxLimit(address account) external view returns (bool);

    function isExcludedFromHoldingLimit(address account) external view returns (bool);

    function paused() external view returns (bool);

    /// TransferFrom amount is greater than allowance
    error InsufficientAllowance();
    /// Only the DarwinCommunity can call this function
    error OnlyDarwinCommunity();
   
    /// Input cannot be the zero address
    error ZeroAddress();
    /// Amount cannot be 0
    error ZeroAmount();
    /// Arrays must be the same length
    error InvalidArrayLengths();
   
    /// Holding limit exceeded
    error HoldingLimitExceeded();
    /// Sell limit exceeded
    error SellLimitExceeded();
    /// Paused
    error Paused();
    error AccountAlreadyExcluded();
    error AccountNotExcluded();

    /// Max supply reached, cannot mint more Darwin
    error MaxSupplyReached();
}
