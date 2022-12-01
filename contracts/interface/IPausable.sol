pragma solidity 0.8.14;

// SPDX-License-Identifier: Unlicensed

/// @title Interface for a contract that can be paused and unpaused
interface IPausable {
    function pause() external;
    function unpause() external;
    function paused() external view returns (bool);
}