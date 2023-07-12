pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import {VRFv2Consumer} from "./VRFv2Consumer.sol";

import {IEvoturesNFT} from "./interface/IEvoturesNFT.sol";
import {IBoosterNFT} from "./interface/IBoosterNFT.sol";
import {ILootboxTicket} from "./interface/ILootboxTicket.sol";

interface IVRFv2Consumer {
    function requestRandomWords(uint8 evotures, uint8 boosters) external returns (uint256 requestId);
}

contract EvoturesNFT is ERC721("Evotures NFTs","EVOTURES"), IEvoturesNFT, IERC721Receiver {
    using Address for address;
    using Strings for uint256;

    address public immutable dev;
    IBoosterNFT public boosterContract;
    IVRFv2Consumer public vrfConsumer;

    uint16 public totalMinted;
    uint56 public EVOTURES_PRICE = 0.04 ether;
    uint56 public BOOSTER_PRICE = 0.006 ether;

    uint16[] private _unminted;
    mapping(address => uint16[]) private _userMinted;
    mapping(uint16 => uint16[]) private _boosters;

    constructor(uint16[] memory unminted_, IBoosterNFT _boosterContract) {
        // Deploy consumer contract
        bytes memory bytecode = type(VRFv2Consumer).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(address(this)));
        address _vrfConsumer;
        assembly {
            _vrfConsumer := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        vrfConsumer = IVRFv2Consumer(_vrfConsumer);

        // Set Dev, unminted and booster contract
        dev = msg.sender;
        _unminted = unminted_;
        boosterContract = _boosterContract;

        // Mint mythical evotures
        _safeMint(msg.sender, 2061);
        _safeMint(msg.sender, 2120);
        totalMinted = 2;
    }

    function mint(uint8 _evotures, uint8 boosters_) public payable {
        require(_unminted.length >= _evotures, "EvoturesNFT::mint: MINT_EXCEEDED");
        require(_evotures <= (3 - _userMinted[msg.sender].length) && boosters_ <= 5, "EvoturesNFT::mint: FORBIDDEN");
        require(msg.value >= (_evotures*EVOTURES_PRICE + _evotures*boosters_*BOOSTER_PRICE), "EvoturesNFT::mint: INSUFFICIENT_ETH");

        vrfConsumer.requestRandomWords(_evotures, boosters_);
    }

    function chainlinkMint(uint256[] memory _randomWords, uint8 _evotures, uint8 boosters_) public {
        require(msg.sender == address(vrfConsumer), "EvoturesNFT::chainlinkMint: CALLER_NOT_CONSUMER");

        for (uint8 i = 0; i < _evotures; i++) {
            // Mint
            uint16 id = uint16(_randomWords[i * boosters_ + i] % _unminted.length);
            _safeMint(msg.sender, _unminted[id]);
            totalMinted++;
            _userMinted[msg.sender].push(_unminted[id]);

            // Mint boosters and map them to the minted evoture tokenId
            _boosters[_unminted[id]] = boosterContract.mint(boosters_, i, _randomWords, address(this));

            // Pop out minted id from unminted array
            _unminted[id] = _unminted[_unminted.length - 1];
            _unminted.pop();
        }
    }

    function addBooster(uint16 _tokenId, uint16 _boosterTokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "EvoturesNFT::addBooster: CALLER_NOT_EVOTURE_OWNER");
        require(_boosters[_tokenId].length < 5, "EvoturesNFT::addBooster: MAX_BOOSTERS_ADDED");
        IERC721(address(boosterContract)).safeTransferFrom(msg.sender, address(this), _boosterTokenId);
        _boosters[_tokenId].push(_boosterTokenId);
    }

    function removeBooster(uint16 _tokenId, uint16 _boosterTokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "EvoturesNFT::removeBooster: CALLER_NOT_EVOTURE_OWNER");
        require(_boosters[_tokenId].length > 0, "EvoturesNFT::removeBooster: NO_BOOSTER_ADDED");
        IERC721(address(boosterContract)).safeTransferFrom(address(this), msg.sender, _boosterTokenId);
        for (uint8 i = 0; i < _boosters[_tokenId].length; i++) {
            if (_boosters[_tokenId][i] == _boosterTokenId) {
                _boosters[_tokenId][i] = _boosters[_tokenId][_boosters[_tokenId].length - 1];
                _boosters[_tokenId].pop();
                break;
            }
        }
    }

    function withdrawETH() external {
        // Withdraw raised eth
        require (msg.sender == dev, "EvoturesNFT::withdrawETH: CALLER_NOT_DEV");
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "EvoturesNFT::withdrawETH: TRANSFER_FAILED");
    }

    function multipliers(uint16 id) external view returns(uint16 mult) {
        uint16[] memory boostersIds = _boosters[id];
        for (uint8 i = 0; i < boostersIds.length; i++) {
            mult += boosterContract.boosterInfo(boostersIds[i]).multiplier;
        }
        if (id == 2061 || id == 2120) {
            mult += 1000;
        } else {
            if (id > 2000) {
                id-=2000;
            } else if (id > 1000) {
                id-=1000;
            }
            if (id < 3) {
                mult += 500;
            } else if (id < 8) {
                mult += 400;
            } else if (id < 20) {
                mult += 300;
            } else if (id < 40) {
                mult += 250;
            } else {
                mult += 200;
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    function _baseURI() internal pure override returns (string memory) {
        //TODO: SET EVOTURES URI
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

    function boosters(uint16 _tokenId) external view returns (uint16[] memory) {
        return _boosters[_tokenId];
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}