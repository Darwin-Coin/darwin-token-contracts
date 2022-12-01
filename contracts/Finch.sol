pragma solidity ^0.8.4;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

error OnlyDarwinPresale();

/// @title The Finch token
contract Finch is ERC20PausableUpgradeable, UUPSUpgradeable, OwnableUpgradeable {
    address private darwinPresaleAddress;

    modifier onlyDarwinPresale() {
        if (msg.sender != darwinPresaleAddress) {
            revert OnlyDarwinPresale();
        }
        _;
    }

    function initialize(address _darwinPresaleAddress) public initializer {
        __Pausable_init_unchained();
        __ERC20_init_unchained("Finch", "FINCH");
        __Finch_init_unchained(_darwinPresaleAddress);
        __UUPSUpgradeable_init();
        __Ownable_init();
    }

    function __Finch_init_unchained(address _darwinPresaleAddress) internal onlyInitializing {
        _mint(msg.sender, 300 * (10**6) * (10**decimals()));
        darwinPresaleAddress = _darwinPresaleAddress;
    }

    /// @notice Pause the token
    /// @dev Only the Darwin presale contract can call this function
    function pause() external onlyDarwinPresale {
        _pause();
    }

    /// @notice Unpause the token
        /// @dev Only the Darwin presale contract can call this function
    function unpause() external onlyDarwinPresale {
        _unpause();
    }

    /// @notice Returns whether the contract is paused or not
    /// @return True if the contract is paused, false otherwise
    function paused() public view override returns (bool) {
        if (msg.sender == darwinPresaleAddress) return false;
        else return PausableUpgradeable.paused();
    }

    /// @notice Returns the token decimals (18)
    /// @return The token decimals (18)
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}