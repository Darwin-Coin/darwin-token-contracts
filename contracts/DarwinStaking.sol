pragma solidity ^0.8.14;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./interface/IDarwinStaking.sol";
import "./interface/IERC20.sol";
import "./interface/IMultiplierNFT.sol";
import "./interface/IMultiplierNFT.sol";

contract DarwinStaking is IDarwinStaking, ReentrancyGuard, IERC721Receiver {
    IERC20 public darwin;
    IERC20 public stakedDarwin;
    IMultiplierNFT public evotures;
    IMultiplierNFT public multiplier;

    uint public constant BASE_APR = 5e18; // 5%
    uint public constant LOCK_BONUS_APR = 2e18; // 2% more if locked
    uint private constant _SECONDS_IN_YEAR = 31_536_000;

    mapping(address => UserInfo) public userInfo;

    constructor(address _darwin, address _stakedDarwin, address _evotures, address _multiplier) {
        darwin = IERC20(_darwin);
        stakedDarwin = IERC20(_stakedDarwin);
        evotures = IMultiplierNFT(_evotures);
        multiplier = IMultiplierNFT(_multiplier);
    }

    function stake(uint _amount, uint _lockPeriod) external nonReentrant {
        require(darwin.transferFrom(msg.sender, address(this), _amount), "DarwinStaking: STAKE_FAILED");

        _claim();
        if (userInfo[msg.sender].lockEnd <= block.timestamp) {
            userInfo[msg.sender].lockEnd = block.timestamp + _lockPeriod;
        } else {
            userInfo[msg.sender].lockEnd += _lockPeriod;
        }

        stakedDarwin.mint(msg.sender, _amount);

        emit Stake(msg.sender, _amount);
    }

    function withdraw(uint _amount) public nonReentrant {
        uint claimAmount = _claim();
        if (_amount > 0) {
            require(userInfo[msg.sender].lockEnd <= block.timestamp, "DarwinStaking: LOCKED");
            require(_amount <= stakedDarwin.balanceOf(msg.sender), "DarwinStaking: NOT_ENOUGH_sDARWIN");
            stakedDarwin.burn(msg.sender, _amount);
            require(darwin.transfer(msg.sender, _amount), "DarwinStaking: WITHDRAW_TRANSFER_FAILED");
        }
        emit Withdraw(msg.sender, _amount, claimAmount);
    }

    function _claim() internal returns (uint claimAmount) {
        claimAmount = claimableDarwin(msg.sender);
        userInfo[msg.sender].lastClaimTimestamp = block.timestamp;
        if (claimAmount > 0) {
            darwin.mint(msg.sender, claimAmount);
        }
    }

    function claimableDarwin(address _user) public view returns(uint256 claimable) {
        uint staked = stakedDarwin.balanceOf(_user);
        if (staked == 0) {
            return 0;
        }
        uint claim = userInfo[_user].lastClaimTimestamp;
        uint lockEnd = userInfo[_user].lockEnd;
        uint boost = userInfo[_user].boost;
        uint timePassedFromLastClaim = (block.timestamp - claim);

        // lock bonus calculations
        uint bonusClaimable;
        if (claim < lockEnd) {
            uint timePassedUntilLockEndOrNow = ((lockEnd > block.timestamp ? block.timestamp : lockEnd) - claim);
            bonusClaimable = (staked * LOCK_BONUS_APR * timePassedUntilLockEndOrNow) / (100e18 * _SECONDS_IN_YEAR);
        }

        claimable = (staked * BASE_APR * timePassedFromLastClaim) / (100e18 * _SECONDS_IN_YEAR) + bonusClaimable;
        
        if (boost > 0) {
            claimable += ((claimable * boost) / 100);
        }
    }

    function stakeEvoture(uint _tokenId, bool _lootBox) external nonReentrant {
        require(userInfo[msg.sender].boost == 0, "DarwinStaking: EVOTURE_ALREADY_STAKED");

        _claim();

        IMultiplierNFT nft = evotures;
        if (_lootBox) {
            nft = multiplier;
        }
        IERC721(address(nft)).safeTransferFrom(msg.sender, address(this), _tokenId);
        userInfo[msg.sender].boost = nft.multipliers(_tokenId);
        userInfo[msg.sender].tokenId = _tokenId;

        emit StakeEvoture(msg.sender, _tokenId, userInfo[msg.sender].boost);
    }

    function withdrawEvoture() external nonReentrant {
        require(userInfo[msg.sender].boost > 0, "DarwinStaking: NO_EVOTURE_TO_WITHDRAW");

        _claim();

        IMultiplierNFT nft = evotures;
        if (IERC721(address(nft)).ownerOf(userInfo[msg.sender].tokenId) != address(this)) {
            nft = multiplier;
        }
        IERC721(address(nft)).safeTransferFrom(address(this), msg.sender, userInfo[msg.sender].tokenId);
        userInfo[msg.sender].boost = 0;

        emit WithdrawEvoture(msg.sender, userInfo[msg.sender].tokenId);
    }

    function getUserInfo(address _user) external view returns (UserInfo memory) {
        return userInfo[_user];
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