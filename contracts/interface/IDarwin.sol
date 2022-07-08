pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";

interface IDarwin is IERC20Upgradeable {
    event ExchangeAdded(address account);
    event ExchangedRemoved(address account);

    event TokenBurned(uint256 amount);
    event TokenReflection(uint256 amount);

    event ExcludedFromReflection(address account, bool isExcluded);
    event ExcludedFromSellLimit(address account, bool isExcluded);

    function getLastTokenReceivedTimestamp(address account) external view returns (uint256);
}
