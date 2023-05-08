// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import {IDarwinVester} from "./interface/IDarwinVester.sol";
import {IDarwin} from "./interface/IDarwin.sol";
import "./interface/IMultiplierNFT.sol";

/// @title Darwin Vester (MIGRATED FROM BSC)
contract DarwinVester7 is IDarwinVester, ReentrancyGuard, Ownable, IERC721Receiver {
    /// @notice Percentage of monthly interest (0.625%, 7.5% in a year)
    uint256 public constant INTEREST = 625;
    /// @notice Number of months thru which interest is active
    uint256 public constant MONTHS = 12;
    /// @notice Above in seconds
    uint256 public constant VESTING_TIME = MONTHS * (30 days);

    mapping(address => bool) public supportedNFT;
    mapping(address => UserInfo) public userInfo;

    /// @notice The Darwin token
    IERC20 public darwin;
    address public deployer;

    bool private _isInitialized;

    modifier isInitialized() {
        if (!_isInitialized) {
            revert NotInitialized();
        }
        _;
    }

    // Constructor takes these args due to migration from BSC, plus evotures address
    constructor(address[] memory _users, UserInfo[] memory _userInfo, address[] memory _supportedNFTs) {
        require(_users.length == _userInfo.length, "Vester7: Invalid _userInfo");
        for (uint i = 0; i < _users.length; i++) {
            userInfo[_users[i]] = _userInfo[i];
        }
        deployer = msg.sender;
        for (uint i = 0; i < _supportedNFTs.length; i++) {
            supportedNFT[_supportedNFTs[i]] = true;
        }
    }

    function init(address _darwin) external {
        require (msg.sender == address(deployer), "Vester7: Caller not Deployer");
        require (!_isInitialized, "Vester7: Already initialized");
        darwin = IERC20(_darwin);
        _isInitialized = true;
    }

    function withdraw(uint _amount) external isInitialized nonReentrant {
        _claim();
        if (_amount > 0) {
            uint withdrawable = withdrawableDarwin(msg.sender);
            if (_amount > withdrawable) {
                revert AmountExceedsWithdrawable();
            }
            userInfo[msg.sender].vested -= _amount;
            userInfo[msg.sender].withdrawn += _amount;
            if (!darwin.transfer(msg.sender, _amount)) {
                revert TransferFailed();
            }
            emit Withdraw(msg.sender, _amount);
        }
    }

    function _claim() internal {
        uint claimAmount = claimableDarwin(msg.sender);
        if (claimAmount > 0) {
            userInfo[msg.sender].claimed += claimAmount;
            IDarwin(address(darwin)).mint(msg.sender, claimAmount);
            emit Claim(msg.sender, claimAmount);
        }
    }

    function stakeEvoture(address _nft, uint _tokenId) external nonReentrant {
        require(userInfo[msg.sender].nft == address(0), "DarwinStaking: NFT_ALREADY_STAKED");
        require(supportedNFT[_nft], "DarwinStaking: UNSUPPORTED_NFT");

        _claim();
        IERC721(_nft).safeTransferFrom(msg.sender, address(this), _tokenId);
        userInfo[msg.sender].nft = _nft;
        userInfo[msg.sender].boost = IMultiplierNFT(_nft).multipliers(_tokenId);
        userInfo[msg.sender].tokenId = _tokenId;

        emit StakeEvoture(msg.sender, _tokenId, userInfo[msg.sender].boost);
    }

    function withdrawEvoture() external nonReentrant {
        require(userInfo[msg.sender].nft != address(0), "DarwinStaking: NO_NFT_TO_WITHDRAW");

        _claim();
        IERC721(userInfo[msg.sender].nft).safeTransferFrom(address(this), msg.sender, userInfo[msg.sender].tokenId);
        userInfo[msg.sender].nft = address(0);
        userInfo[msg.sender].boost = 0;
        userInfo[msg.sender].tokenId = 0;

        emit WithdrawEvoture(msg.sender, userInfo[msg.sender].tokenId);
    }

    function addSupportedNFT(address _nft) external {
        require(msg.sender == deployer, "DarwinStaking: CALLER_IS_NOT_DEV");
        supportedNFT[_nft] = true;
    }

    function removeSupportedNFT(address _nft) external {
        require(msg.sender == deployer, "DarwinStaking: CALLER_IS_NOT_DEV");
        supportedNFT[_nft] = false;
    }

    function withdrawableDarwin(address _user) public view returns(uint256 withdrawable) {
        uint vested = userInfo[_user].vested;
        if (vested == 0) {
            return 0;
        }
        uint withdrawn = userInfo[_user].withdrawn;
        uint start = userInfo[_user].vestTimestamp;
        uint passedMonthsFromStart = (block.timestamp - start) / (30 days);
        if (passedMonthsFromStart > MONTHS) {
            passedMonthsFromStart = MONTHS;
        }
        withdrawable = (((vested + withdrawn) * passedMonthsFromStart) / MONTHS) - withdrawn;
        if (withdrawable > vested) {
            withdrawable = vested;
        }
    }

    function claimableDarwin(address _user) public view returns(uint256 claimable) {
        uint vested = userInfo[_user].vested;
        if (vested == 0) {
            return 0;
        }
        uint claimed = userInfo[_user].claimed;
        uint boost = userInfo[_user].boost;
        uint start = userInfo[_user].vestTimestamp;
        uint passedMonthsFromStart = (block.timestamp - start) / (30 days);
        if (passedMonthsFromStart > MONTHS) {
            passedMonthsFromStart = MONTHS;
        }
        claimable = (((vested * INTEREST) / 100000) * passedMonthsFromStart) - claimed;

        if (boost > 0) {
            claimable += ((claimable * boost) / 100);
        }
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
