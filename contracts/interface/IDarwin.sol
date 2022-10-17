pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";

interface IDarwin is IERC20Upgradeable {
    event ExchangeAdded(address account);
    event ExchangedRemoved(address account);

    event TokenReflection(uint256 amount);

    event ExcludedFromReflection(address account, bool isExcluded);
    event ExcludedFromSellLimit(address account, bool isExcluded);

    function syncTokenInOutOfSyncExchnagesSafe() external;

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external;

    function getOutOfSyncedAmount(address pair) external view returns (uint256);

    function getOutOfSyncedPairs() external view returns (address[] memory);

    function takeAccessFee(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function isExchangeAddress(address account) external view returns (bool);

    function isExcludedFromReward(address account) external view returns (bool);

    function isExcludedFromTxLimit(address account) external view returns (bool);

    function isExcludedFromHoldingLimit(address account) external view returns (bool);
}
