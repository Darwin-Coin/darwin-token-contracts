pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

interface IEvoturesNFT {

    function mint(uint8 _evotures, uint8 _boosters) external payable;
    function multipliers(uint16 id) external view returns(uint16 mult);
}