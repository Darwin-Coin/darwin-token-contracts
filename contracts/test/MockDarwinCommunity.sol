pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import "../interface/IDarwin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockDarwinCommunity is Ownable {
    IDarwin public darwin;

    function setDarwinAddress(address account) public {
        darwin = IDarwin(account);
    }

    function isExchangeAddress(address account) external view returns (bool) {
        return darwin.isExchangeAddress(account);
    }

    function isExcludedFromReward(address account) external view returns (bool) {
        return darwin.isExcludedFromReward(account);
    }

    function isExcludedFromTxLimit(address account) external view returns (bool) {
        return darwin.isExcludedFromTxLimit(account);
    }

    function isExcludedFromHoldingLimit(address account) external view returns (bool) {
        return darwin.isExcludedFromHoldingLimit(account);
    }
}
