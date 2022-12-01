pragma solidity 0.8.14;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./interface/IDarwinEcosystem.sol";

/// @title Darwin Ecosystem
contract DarwinEcosystem is OwnableUpgradeable, IDarwinEcosystem, UUPSUpgradeable {
    using AddressUpgradeable for address;

    /// @notice The contract name
    string public constant name = "Darwin Ecosystem";

    modifier onlyDarwinPresale() {
        if (msg.sender != darwinPresaleAddress) {
            revert AccessControl();
        }
        _;
    }

    mapping(address => PresaleTier) private _tokenPresaleTier;

    /// @notice The Darwin presale address
    address public darwinPresaleAddress;

    /// @notice Initialize the Darwin Ecosystem
    /// @param _darwinPresaleAddress The Darwin Presale address
    function initialize(address _darwinPresaleAddress) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __darwin_ecosystem_init_unchained(_darwinPresaleAddress);
    }

    /// @notice Set the presale tier for an account
    /// @param account The account address
    /// @param tier The presale tier
    function setAddressPresaleTier(address account, PresaleTier tier) external override onlyDarwinPresale {
        _tokenPresaleTier[account] = tier;
    }

    /// @notice Returns the presale tier of the account
    /// @param account The address of the account
    function getPresaleTier(address account) external view returns (PresaleTier) {
        return _tokenPresaleTier[account];
    }

    function __darwin_ecosystem_init_unchained(address _darwinPresaleAddress) private onlyInitializing {
        darwinPresaleAddress = _darwinPresaleAddress;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
