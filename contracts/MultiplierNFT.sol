pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {LootboxTicket} from "./LootboxTicket.sol";

import {IMultiplierNFT} from "./interface/IMultiplierNFT.sol";
import {ILootboxTicket} from "./interface/ILootboxTicket.sol";

contract MultiplierNFT is ERC721("Multiplier NFTs","MULTI"), IMultiplierNFT {
    using Address for address;
    using Strings for uint256;

    address public immutable ticketsContract;
    address public dev;
    uint public lastTokenId;
    mapping(uint => uint) public multipliers;

    constructor() {
        // Create LootboxTicket contract
        bytes memory bytecode = type(LootboxTicket).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(address(this)));
        address _ticketsContract;
        assembly {
            _ticketsContract := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        ticketsContract = _ticketsContract;

        dev = msg.sender;
    }

    function init(address _darwin) external {
        require (msg.sender == dev, "init: CALLER_IS_NOT_DEV");
        ILootboxTicket(ticketsContract).initialize(msg.sender, _darwin);
    }

    function mint(address _to, uint _multiplier) external {
        require(msg.sender == ticketsContract, "MultiplierNFT: CALLER_IS_NOT_TICKET");
        _safeMint(_to, lastTokenId);
        multipliers[lastTokenId] = _multiplier;
        lastTokenId++;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, multipliers[tokenId].toString(), ".json")) : "";
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmQw69vVunkuEGPbs5h6Pm4qFrGPvJQWW5kYsiBE2seGom/";
    }

    function contractURI() public pure returns (string memory) {
        return "https://darwinprotocol.io/multiplier.json";
    }
}