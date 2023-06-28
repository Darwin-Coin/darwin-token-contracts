pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

interface IBoosterNFT {

    struct Kind {
        uint8 unminted;
        uint8 no;
    }

    struct BoosterInfo {
        uint8 multiplier;
        uint8 no;
    }

    function mint(uint8 _amount, address _to) external payable returns(uint16[] memory tokenIds);
    function boosterInfo(uint16 _tokenId) external view returns(BoosterInfo memory);
}