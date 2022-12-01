pragma solidity 0.8.14;

// SPDX-License-Identifier: Unlicensed

enum PresaleTier {
    NONE,
    TIER_1,
    TIER_2,
    TIER_3,
    TIER_4,
    TIER_5,
    TIER_6
}

interface IDarwinEcosystem {

    error AccessControl();

    function setAddressPresaleTier(address account, PresaleTier tier) external;
}
