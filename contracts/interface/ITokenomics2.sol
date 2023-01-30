pragma solidity ^0.8.14;

// SPDX-License-Identifier: BUSL-1.1

interface ITokenomics {

    event ExchangeAdded(address account);
    event ExchangedRemoved(address account);

    function syncTokenInOutOfSyncExchangesSafe() external;

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external;

    function getOutOfSyncedAmount(address pair) external view returns (uint256);

    function getOutOfSyncedPairs() external view returns (address[] memory);

    function isExchangeAddress(address account) external view returns (bool);

    function isExcludedFromReward(address account) external view returns (bool);

    function isExcludedFromTxLimit(address account) external view returns (bool);

    function isExcludedFromHoldingLimit(address account) external view returns (bool);

    // Pair is already registered
    error PairAlreadyRegistered();
    // Pair is not registered
    error PairNotRegistered();
  
}
