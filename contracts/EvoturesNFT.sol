pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {LootboxTicket} from "./LootboxTicket.sol";

import {IMultiplierNFT} from "./interface/IMultiplierNFT.sol";
import {ILootboxTicket} from "./interface/ILootboxTicket.sol";

contract EvoturesNFT is ERC721("Evotures NFTs","EVOTURES"), IMultiplierNFT {
    using Address for address;
    using Strings for uint256;

    address public dev;
    uint public lastTokenId;
    mapping(uint => uint) public multipliers;

    constructor() {
        lastTokenId = 1;
        dev = msg.sender;
    }

    function mintAll() external {
        for (uint i = 0; i < 300; i++) {
            uint id = lastTokenId;
            uint mult;
            if (id > 2000) {
                id-=2000;
            } else if (id > 1000) {
                id-=1000;
            }
            // TODO: READ MULTIPLIERS FROM THE EVOTURES XLSL
            mint(msg.sender, mult);
        }
    }

    function mint(address _to, uint _multiplier) public {
        require(msg.sender == dev && lastTokenId < 2101, "EvoturesNFT: CALLER_IS_NOT_DEV");
        _safeMint(_to, lastTokenId);
        multipliers[lastTokenId] = _multiplier;
        lastTokenId++;
        if (lastTokenId == 101 || lastTokenId == 1101) {
            lastTokenId+=1000;
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    // TODO: SET BASE URI
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmXNRXbSeJVJTGFRa69u9A1wz1H17pkB8S4EXvVQtuRfTE/";
    }

    // TODO: SET CONTARCT URI
    function contractURI() public pure returns (string memory) {
        return "https://darwinprotocol.io/evotures.json";
    }
}