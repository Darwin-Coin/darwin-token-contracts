pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {IMultiplierNFT} from "./interface/IMultiplierNFT.sol";
import {ILootboxTicket} from "./interface/ILootboxTicket.sol";
import {IERC20} from "./interface/IERC20.sol";

contract LootboxTicket is ERC721("Lootbox Tickets","TICKETS"), ILootboxTicket {
    address public immutable multiplierNFT;
    address public darwin;
    address public dev;
    uint public lastTicketId;

    constructor() {
        multiplierNFT = msg.sender;
    }

    function initialize(address _dev, address _darwin) external {
        require(msg.sender == multiplierNFT, "LootboxTicket: CALLER_NOT_MULTIPLIER");
        require(dev == address(0) && darwin == address(0), "LootboxTicket: ALREADY_INITIALIZED");
        require(_dev != address(0) && _darwin != address(0), "LootboxTicket: ZERO_ADDRESS");
        dev = _dev;
        darwin = _darwin;
    }

    function mint(address _to) external {
        require(msg.sender == dev, "LootboxTicket: CALLER_IS_NOT_DEV");
        _safeMint(_to, lastTicketId);
        lastTicketId++;
    }

    function openLootBox(uint _ticketId) external {
        uint darwinAmount;
        uint multiplier;
        (multiplier, darwinAmount) = _getRandomMultiplierOrDarwin();
        if (multiplier > 0) {
            IMultiplierNFT(multiplierNFT).mint(msg.sender, multiplier);
        }
        if (darwinAmount > 0) {
            IERC20(darwin).transfer(msg.sender, darwinAmount);
        }
        _safeBurn(_ticketId);
    }

    function _safeBurn(uint _ticketId) internal {
        require(_isApprovedOrOwner(_msgSender(), _ticketId), "LootboxTicket: CALLER_NOT_TICKET_OWNER");

        _burn(_ticketId);
    }

    function _pseudoRand() private view returns(uint256) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                    block.difficulty +
                    ((
                        uint256(keccak256(abi.encodePacked(block.coinbase)))
                    ) / (block.timestamp)) +
                    block.gaslimit +
                    ((uint256(keccak256(abi.encodePacked(tx.origin)))) /
                        (block.timestamp)) +
                    block.number +
                    ((uint256(keccak256(abi.encodePacked(address(this))))) /
                        (block.timestamp)) +
                    ((uint256(keccak256(abi.encodePacked(msg.sender)))) /
                        (block.timestamp))
                )
            )
        );

        return (seed % 10_000_000);
    }

    function _getRandomMultiplierOrDarwin() private view returns(uint m, uint d) {
        uint rand = _pseudoRand();
        if (rand < 25) {
            d = 100_000;
        } else if (rand < 75) {
            d = 90_000;
        } else if (rand < 150) {
            d = 80_000;
        } else if (rand < 400) {
            d = 70_000;
        } else if (rand < 900) {
            d = 60_000;
        } else if (rand < 1_650) {
            d = 50_000;
        } else if (rand < 4_150) {
            d = 40_000;
        } else if (rand < 9_150) {
            d = 30_000;
        } else if (rand < 16_650) {
            d = 20_000;
        } else if (rand < 106_650) {
            uint r = rand % 9;
            d = 2_000 + r * 1_000;
        } else if (rand < 2_356_650) {
            uint r = rand % 90;
            d = 110 + r * 10;
        } else if (rand < 3_606_650) {
            uint r = rand % 25;
            d = 76 + r;
        } else if (rand < 4_981_650) {
            uint r = rand % 25;
            d = 51 + r;
        } else if (rand < 6_481_650) {
            uint r = rand % 25;
            d = 26 + r;
        } else if (rand < 8_356_650) {
            uint r = rand % 25;
            d = 1 + r;
        } else if (rand < 8_356_660) {
            m = 500;
        } else if (rand < 8_356_760) {
            m = 100;
        } else if (rand < 8_357_760) {
            m = 50;
        } else if (rand < 8_491_000) {
            m = 25;
        } else {
            m = 10;
        }
    }
}