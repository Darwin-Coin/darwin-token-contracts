pragma solidity 0.8.14;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interface/IDarwinNew.sol";
import "./interface/IDarwinCommunity.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "./Tokenomics2.sol";

contract DarwinNew is IDarwinNew, Tokenomics2, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    // roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // constants
    uint256 private constant _MULTIPLIER = 2**152;
    uint256 private constant _PERCENTAGE_MULTIPLIER = 100;
    uint256 private constant _PERCENTAGE_100 = 100 * _PERCENTAGE_MULTIPLIER;

    uint256 public constant DEV_WALLET_PECENTAGE = 10;
    uint256 public constant MAX_SUPPLY = 10**10;
    uint256 public constant MAX_TOKEN_HOLDING_SIZE = (MAX_SUPPLY * 2) / 100; // 2% of the supply
    uint256 public constant MAX_TOKEN_SELL_SIZE = MAX_SUPPLY / 1000; // .1% of the supply;
    uint256 public constant MAX_TOKEN_SALE_LIMIT_DURATION = 5 hours;

    // limit exclusions
    mapping(address => bool) private _isExcludedFromSellLimit;
    mapping(address => bool) private _isExcludedFromHoldingLimit;

    // Logs
    /// @notice track sold tokens over maxTokenSaleLimitDuration
    mapping(address => TokenSellLog) private _tokenSellLog;

    // reward values
    uint256 public culmulativeRewardPerToken;
    mapping(address => uint256) private _lastCulmulativeRewards;
    mapping(address => bool) private _isExcludedFromRewards;
    address[] public excludedFromRewards;


    address public rewardsWallet;
    IDarwinCommunity darwinCommunity;
    IUniswapV2Router02 public uniswapV2Router;
    IUniswapV2Pair public uniswapV2Pair;

    //TODO: should consider moving outside or inheriting from pausable
    // pausing
    bool public isPaused;
    bool public isLive;
    mapping(address => bool) private pauseWhitelist;

    modifier onlyDarwinCommunity() {
        if (msg.sender != address(darwinCommunity) &&
            (address(darwinCommunity) != address(0) ||
            msg.sender != owner())) {
            revert OnlyDarwinCommunity();
        }
        _;
    }

    modifier notPaused() {
        if(isPaused) {
            if(isLive || pauseWhitelist[msg.sender] == false) revert Paused();
        }
        _;
    }

    //////////////////////// Initializers /////////////////////////////////

    function initialize(
        address uniswapV2RouterAddress,
        address _devWallet,
        address _darwinCommunity
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        //TODO: set these values in the constructor
        __tokenomics2_init_unchained(_darwinCommunity, 5, 0);
        __darwin_init_unchained(uniswapV2RouterAddress, _devWallet, _darwinCommunity);
        __UUPSUpgradeable_init();
        __ERC20_init_unchained("Darwin", "DARWIN");
    }

    function __darwin_init_unchained(
        address uniswapV2RouterAddress,
        address _devWallet,
        address _darwinCommunity
    ) private onlyInitializing { 

        uint devMint = (MAX_SUPPLY * DEV_WALLET_PECENTAGE / 100);

        _mint(_devWallet, devMint);

        uint deployerMint = MAX_SUPPLY - devMint;

        _mint(msg.sender, deployerMint);

        uniswapV2Router = IUniswapV2Router02(uniswapV2RouterAddress);

        //TODO: should we really be setting the rewards wallet to be this?
        rewardsWallet = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, block.number)))));

        // Create a uniswap pair for this new token
        uniswapV2Pair = IUniswapV2Pair(
            IUniswapV2Factory(uniswapV2Router.factory()).createPair(address(this), uniswapV2Router.WETH())
        );

        // add exchange wallets
        _registerPair(uniswapV2RouterAddress, address(uniswapV2Pair));

        // exclude wallets from sell limit
        _isExcludedFromSellLimit[_msgSender()] = true;
        _isExcludedFromSellLimit[_devWallet] = true;
        _isExcludedFromSellLimit[_darwinCommunity] = true;

        // exclude wallets from holding limit
        _isExcludedFromHoldingLimit[_msgSender()] = true;
        _isExcludedFromHoldingLimit[_devWallet] = true;
        _isExcludedFromHoldingLimit[_darwinCommunity] = true;

        darwinCommunity = IDarwinCommunity(_darwinCommunity);

        // grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

    }

    ////////////////////// PAUSE FUNCTIONS ///////////////////////////////////

    function setLive() external onlyRole(PAUSER_ROLE) {
        isLive = true;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        if(isPaused == false) {
            isPaused = true;
        }
    }

    function unPause() external onlyRole(PAUSER_ROLE) {
        if(isPaused) {
            isPaused = false;
        }
    }

    function setPauseWhitelist(address _addr, bool value) external onlyRole(PAUSER_ROLE) {
        pauseWhitelist[_addr] = value;
    }

    ////////////////////// NEW FUNCTIONS /////////////////////////////////////

    function _getRewardsOwed(uint _cumulativeRewardsPerToken, uint _lastCumulativeRewards, uint _balance) internal pure returns(uint) {
        return ((_cumulativeRewardsPerToken - _lastCumulativeRewards) * _balance) /_MULTIPLIER;
    }

    function _distributeRewardToUser(uint _culmulativeRewardsPerToken, uint _accountsLastCulmulativeRewards, uint _balance, address _account) internal returns(uint newBalance) {
        uint _rewardsOwed = _getRewardsOwed(_culmulativeRewardsPerToken, _accountsLastCulmulativeRewards, _balance);
        _lastCulmulativeRewards[_account] = _culmulativeRewardsPerToken;
        _setBalances(rewardsWallet, _account, _rewardsOwed);
        newBalance = _balance + _rewardsOwed;
    }

    function distributeRewards(uint256 amount) public onlyDarwinCommunity {
        _updateBalance(msg.sender);
        _setBalances(msg.sender, rewardsWallet, amount);
        _distributeRewards(amount);
    }

    function _distributeRewards(uint256 amount) internal {
        culmulativeRewardPerToken += (amount *_MULTIPLIER) / (totalSupply() - _getExcludedBalances());
    }

    function _getExcludedBalances() internal view returns(uint excludedBalances) {
        address[] memory _excludedAddresses = excludedFromRewards;
        for(uint i = 0; i < _excludedAddresses.length; i++) {
            excludedBalances += super.balanceOf(_excludedAddresses[i]);
        }
    }

    function _setExcludedFromRewards(address account) internal {
        if(_isExcludedFromRewards[account]) revert AccountAlreadyExcluded();
        _isExcludedFromRewards[account] = true;
        excludedFromRewards.push(account);
    }

    function _removeExcludedFromRewards(address account) internal {
        if(!_isExcludedFromRewards[account]) revert AccountNotExcluded();
        delete _isExcludedFromRewards[account];
        address[] memory _excludedAddresses = excludedFromRewards;
        for(uint i = 0; i < _excludedAddresses.length; i++) {
            if(_excludedAddresses[i] == account) {
                excludedFromRewards[i] = _excludedAddresses[_excludedAddresses.length - 1];
                excludedFromRewards.pop();
                break;
            }
        }
        _lastCulmulativeRewards[account] = culmulativeRewardPerToken;
    }

    function _registerPair(address routerAddress, address pairAddress) internal override {
        super._registerPair(routerAddress, pairAddress);
        _isExcludedFromSellLimit[pairAddress] = true;
        _isExcludedFromHoldingLimit[pairAddress] = true;
        _setExcludedFromRewards(pairAddress);
    }

    function _unRegisterPair(address routerAddress, address pairAddress) internal override {
        super._unRegisterPair(routerAddress, pairAddress);
        delete _isExcludedFromSellLimit[pairAddress];
        delete _isExcludedFromHoldingLimit[pairAddress];
        _removeExcludedFromRewards(pairAddress);
    }

    function _updateBalance(address account) internal {
        if(_isExcludedFromRewards[account]) return;
        uint _culmulativeRewardPerToken = culmulativeRewardPerToken;
        uint _lastCulmulativeReward = _lastCulmulativeRewards[account];
        if(_culmulativeRewardPerToken > _lastCulmulativeReward) {
            _distributeRewardToUser(_culmulativeRewardPerToken, _lastCulmulativeReward, ERC20Upgradeable.balanceOf(account), account);
        }
    }

    function _enforceHoldingLimit(address account) private view {
        if(_isExcludedFromHoldingLimit[account]) return;
        if (ERC20Upgradeable.balanceOf(account) > MAX_TOKEN_HOLDING_SIZE) {
            revert HoldingLimitExceeded();
        }
    }

    /// @notice inforce token sale limit over sale limit duration
    function _enforceSellLimit(address account, uint256 amount) private {
        if(_isExcludedFromSellLimit[account]) return;
        TokenSellLog storage log = _tokenSellLog[account];
        uint216 newAmount = uint216(amount);
        uint40 currentTime = uint40(block.timestamp);
        uint40 timeSinceLastSell = currentTime - log.lastSale;
        if(timeSinceLastSell < MAX_TOKEN_SALE_LIMIT_DURATION) {
            newAmount += uint216(((MAX_TOKEN_SALE_LIMIT_DURATION - timeSinceLastSell) * log.amount) / MAX_TOKEN_SALE_LIMIT_DURATION);
        }
        if(newAmount > MAX_TOKEN_SELL_SIZE) revert SellLimitExceeded();
        (log.amount, log.lastSale) = (newAmount, currentTime);
    }

    /////////////////////// TRANSFER FUNCTIONS //////////////////////////////////////

    function balanceOf(address account) public view override returns (uint256 balance) {
        balance = super.balanceOf(account);
        if (!_isExcludedFromRewards[account]) {
            balance += _getRewardsOwed(culmulativeRewardPerToken, _lastCulmulativeRewards[account], balance);
        }
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override notPaused {
        _updateBalance(from);
        _enforceSellLimit(from, amount);
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._afterTokenTransfer(from, to, amount);
        _updateBalance(to);
        _enforceHoldingLimit(to);
        if(to == rewardsWallet) {
            _distributeRewards(amount);
        }
    }

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        if (recipients.length != amounts.length) revert InvalidArrayLengths();
        for (uint256 i = 0; i < recipients.length; ) {
            _transfer(msg.sender, recipients[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    ////////////////////// COMMUNITY FUNCTIONS /////////////////////////////////////

    function registerPair(address routerAddress, address pairAddress) public onlyDarwinCommunity {
        _registerPair(routerAddress, pairAddress);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE){}

}

