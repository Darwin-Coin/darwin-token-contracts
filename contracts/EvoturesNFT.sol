pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {LootboxTicket} from "./LootboxTicket.sol";

import {IEvoturesNFT} from "./interface/IEvoturesNFT.sol";
import {ILootboxTicket} from "./interface/ILootboxTicket.sol";

contract EvoturesNFT is ERC721("Evotures NFTs","EVOTURES"), IEvoturesNFT {
    using Address for address;
    using Strings for uint256;

    uint public totalMinted;
    uint public EVOTURES_PRICE = 0.04 ether;
    uint public BOOSTER_PRICE = 0.006 ether;

    uint16[] private _unminted;
    mapping(address => uint16[]) private _userMinted;

    constructor() {
        for (uint16 i = 1; i < 361; i++) {
            if (i < 121) {
                _unminted.push(i);
            } else if (i < 241) {
                _unminted.push(i+880);
            } else if (i != 301 && i != 360) {
                _unminted.push(i+1760);
            }
        }
        _safeMint(msg.sender, 2061);
        _safeMint(msg.sender, 2120);
        totalMinted = 2;
    }

    function mint(uint8 _evotures, uint8 _boosters) public payable {
        require(_evotures <= (3 - _userMinted[msg.sender].length) && _boosters <= 5, "EvoturesNFT::mint: FORBIDDEN");
        require(msg.value >= (_evotures*EVOTURES_PRICE + _evotures*_boosters*BOOSTER_PRICE), "EvoturesNFT::mint: INSUFFICIENT_ETH");

        for (uint8 i = 0; i < _evotures; i++) {
            // Fetch random id and mint
            uint id = _pseudoRand();
            _safeMint(msg.sender, _unminted[id]);
            totalMinted++;
            _userMinted[msg.sender].push(_unminted[id]);

            // Pop out minted id from unminted array
            _unminted[id] = _unminted[_unminted.length - 1];
            _unminted.pop();
        }
    }

    function multipliers(uint16 id) external pure returns(uint16 mult) {
        if (id == 2061 || id == 2120) {
            return 1000;
        }
        if (id > 2000) {
            id-=2000;
        } else if (id > 1000) {
            id-=1000;
        }
        if (id < 3) {
            mult = 500;
        } else if (id < 8) {
            mult = 400;
        } else if (id < 20) {
            mult = 300;
        } else if (id < 40) {
            mult = 250;
        } else {
            mult = 200;
        }
    }

    function _pseudoRand() private view returns(uint256) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                    block.difficulty +
                    gasleft() +
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

        return (seed % _unminted.length);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://bafybeiegbgy7a2g22pnoxgxkxjztgzz5xnw3naobpfbnb4vl6tsguppcpi/";
    }

    function contractURI() public pure returns (string memory) {
        return "https://darwinprotocol.io/evotures.json";
    }

    function unminted() external view returns (uint16[] memory) {
        return _unminted;
    }

    function userMinted(address _user) external view returns (uint16[] memory) {
        return _userMinted[_user];
    }
}