pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {LootboxTicket} from "./LootboxTicket.sol";

import {IBoosterNFT} from "./interface/IBoosterNFT.sol";
import {IEvoturesNFT} from "./interface/IEvoturesNFT.sol";
import {ILootboxTicket} from "./interface/ILootboxTicket.sol";

contract BoosterNFT is ERC721("Evotures NFTs","EVOTURES"), IBoosterNFT {
    using Address for address;
    using Strings for uint8;

    address public immutable dev;
    address public evotures;

    uint16 public constant MAX_SUPPLY = 1800;
    uint56 public constant BOOSTER_PRICE = 0.006 ether;

    uint16 public lastTokenId;

    mapping(uint16 => BoosterInfo) private _boosterInfo;
    Kind[] private _unminted;

    constructor(Kind[] memory unminted_) {
        dev = msg.sender;

        _safeMint(msg.sender, 1);
        _safeMint(msg.sender, 2);
        lastTokenId = 2;

        for (uint8 i = 0; i < unminted_.length; i++) {
            _unminted.push(unminted_[i]);
        }
    }

    function setEvotures(address _evotures) external {
        require(msg.sender == dev, "BoosterNFT::setEvotures: CALLER_NOT_DEV");
        require(evotures == address(0), "BoosterNFT::setEvotures: EVOTURES_SET");

        evotures = _evotures;
    }

    function mint(uint8 _amount, address _to) external returns(uint16[] memory) {
        require(msg.sender == evotures, "BoosterNFT::mint: CALLER_NOT_EVOTURES");
        require((MAX_SUPPLY - lastTokenId) >= _amount, "BoosterNFT::mint: MINT_EXCEEDED");

        uint16[] memory tokenIds = new uint16[](_amount);

        for (uint8 i = 0; i < _amount; i++) {
            // Fetch random id and mint
            uint8 no = _unminted[_pseudoRand()].no;
            lastTokenId++;

            _safeMint(_to, lastTokenId);
            tokenIds[i] = lastTokenId;
            _boosterInfo[lastTokenId].multiplier = _multiplier(no);
            _boosterInfo[lastTokenId].no = no;

            // Reduce no.exist of minted id, if 0 pop it out from unminted array
            _unminted[no].unminted--;
            if (_unminted[no].unminted == 0) {
                _unminted[no] = _unminted[_unminted.length - 1];
                _unminted.pop();
            }
        }

        return tokenIds;
    }

    function _multiplier(uint8 _no) internal pure returns(uint8 mult) {
        if (_no < 3) {
            mult = 50;
        } else if (_no < 6) {
            mult = 25;
        } else if (_no < 10) {
            mult = 20;
        } else if (_no < 15) {
            mult = 15;
        } else if (_no < 21) {
            mult = 10;
        } else {
            mult = 5;
        }
    }

    function _pseudoRand() private view returns(uint16) {
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

        return uint16(seed % _unminted.length);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, _boosterInfo[uint16(tokenId)].no.toString(), ".json")) : "";
    }

    function _baseURI() internal pure override returns (string memory) {
        // TODO: SET BOOSTERS URI
        return "ipfs://bafybeiegbgy7a2g22pnoxgxkxjztgzz5xnw3naobpfbnb4vl6tsguppcpi/";
    }

    function contractURI() public pure returns (string memory) {
        return "https://darwinprotocol.io/boosters.json";
    }

    function boosterInfo(uint16 _tokenId) external view returns (BoosterInfo memory) {
        return _boosterInfo[_tokenId];
    }

    function unminted() external view returns (Kind[] memory) {
        return _unminted;
    }
}