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

    function pause() external;

    function unPause() external;

    function setLive() external;

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external;

    function isExcludedFromHoldingLimit(address account) external view returns (bool);

    function isExcludedFromSellLimit(address account) external view returns (bool);

    function isPaused() external view returns (bool);

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
