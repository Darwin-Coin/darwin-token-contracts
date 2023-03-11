pragma solidity 0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interface/IDarwin.sol";
import "./interface/IDarwinCommunity.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "./Openzeppelin/ERC20Upgradeable.sol";

contract Darwin is IDarwin, ERC20Upgradeable, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    // roles
    bytes32 public constant COMMUNITY_ROLE = keccak256("COMMUNITY_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MAINTENANCE_ROLE = keccak256("MAINTENANCE_ROLE");
    bytes32 public constant SECURITY_ROLE = keccak256("SECURITY_ROLE");
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");

    // constants
    uint256 private constant _MULTIPLIER = 2**160;
    uint256 private constant _PERCENTAGE_MULTIPLIER = 100;
    uint256 private constant _PERCENTAGE_100 = 100 * _PERCENTAGE_MULTIPLIER;

    uint256 public constant DEPLOYER_PERCENTAGE = 6000; // 60%
    uint256 public constant KIERAN_PERCENTAGE = 20; // 0.20%
    uint256 public constant WALLET1_PECENTAGE = 1000; // 10%
    uint256 public constant WALLET2_PECENTAGE = 2980; // 29.80%

    uint256 public constant INITIAL_SUPPLY = 1e8 ether; // initial supply: 100m
    uint256 public constant MAX_SUPPLY = 1e9 ether; // max supply: 1b
    uint256 public constant MAX_TOKEN_SALE_LIMIT_DURATION = 5 hours;

    // limit exclusions
    mapping(address => bool) public isExcludedFromSellLimit;
    mapping(address => bool) public isExcludedFromHoldingLimit;

    // Logs
    /// @notice track sold tokens over maxTokenSaleLimitDuration
    mapping(address => TokenSellLog) private _tokenSellLog;

    // reward values
    uint256 public culmulativeRewardPerToken;
    mapping(address => uint256) private _lastCulmulativeRewards;
    mapping(address => bool) private _isExcludedFromRewards;
    address[] public excludedFromRewards;

    // The rewards wallet
    address public rewardsWallet;

    // How much DARWIN has been burnt
    uint256 public totalBurnt;

    // pausing
    bool public isPaused;
    bool public isLive;
    mapping(address => bool) private pauseWhitelist;

    // The DarwinSwap factory address
    IUniswapV2Factory public darwinSwapFactory;

    modifier notPaused() {
        if(isPaused && !hasRole(COMMUNITY_ROLE, msg.sender)) {
            if(isLive || pauseWhitelist[msg.sender] == false) revert Paused();
        }
        _;
    }

    //////////////////////// Initializers /////////////////////////////////

    function initialize(
        address _darwinCommunity,
        address _vester5,
        address _vester7,
        address _wallet1,
        address _wallet2,
        address _kieran,
        address _charity,
        address _giveaway,
        address _bounties,
        address _darwinDrop,
        uint _darwinSoldInPresale
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __darwin_init_unchained(
            _darwinCommunity,
            _vester5,
            _vester7,
            _wallet1,
            _wallet2,
            _kieran,
            _charity,
            _giveaway,
            _bounties,
            _darwinDrop,
            _darwinSoldInPresale
        );
        __UUPSUpgradeable_init();
        __ERC20_init_unchained("Darwin Protocol", "DARWIN");
    }

    function __darwin_init_unchained(
        address _darwinCommunity,
        address _vester5,
        address _vester7,
        address _wallet1,
        address _wallet2,
        address _kieran,
        address _charity,
        address _giveaway,
        address _bounties,
        address _darwinDrop,
        uint _darwinSoldInPresale
    ) private onlyInitializing {
        rewardsWallet = 0x3Cc90773ebB2714180b424815f390D937974109B;

        // allow addresses to trade during the pre-launch pause
        pauseWhitelist[_msgSender()] = true;
        pauseWhitelist[_wallet1] = true;
        pauseWhitelist[_kieran] = true;
        pauseWhitelist[_darwinDrop] = true;
        pauseWhitelist[_darwinCommunity] = true;
        pauseWhitelist[_vester5] = true;
        pauseWhitelist[_vester7] = true;

        // exclude addresses from holding limit
        isExcludedFromHoldingLimit[_msgSender()] = true;
        isExcludedFromHoldingLimit[_wallet1] = true;
        isExcludedFromHoldingLimit[_wallet2] = true;
        isExcludedFromHoldingLimit[_charity] = true;
        isExcludedFromHoldingLimit[_giveaway] = true;
        isExcludedFromHoldingLimit[_bounties] = true;
        isExcludedFromHoldingLimit[_darwinCommunity] = true;
        isExcludedFromHoldingLimit[_darwinDrop] = true;
        isExcludedFromHoldingLimit[rewardsWallet] = true;
        isExcludedFromHoldingLimit[_vester5] = true;
        isExcludedFromHoldingLimit[_vester7] = true;

        // exclude addresses from sell limit
        isExcludedFromSellLimit[_msgSender()] = true;
        isExcludedFromSellLimit[_wallet1] = true;
        isExcludedFromSellLimit[_wallet2] = true;
        isExcludedFromSellLimit[_charity] = true;
        isExcludedFromSellLimit[_giveaway] = true;
        isExcludedFromSellLimit[_bounties] = true;
        isExcludedFromSellLimit[_darwinCommunity] = true;
        isExcludedFromSellLimit[_darwinDrop] = true;
        isExcludedFromSellLimit[rewardsWallet] = true;
        isExcludedFromSellLimit[_vester5] = true;
        isExcludedFromSellLimit[_vester7] = true;

        // exclude addresses from receiving rewards
        _setExcludedFromRewards(_msgSender());
        _setExcludedFromRewards(_charity);
        _setExcludedFromRewards(_giveaway);
        _setExcludedFromRewards(_bounties);
        _setExcludedFromRewards(_darwinCommunity);
        _setExcludedFromRewards(_wallet1);
        _setExcludedFromRewards(_wallet2);
        _setExcludedFromRewards(_darwinDrop);
        _setExcludedFromRewards(rewardsWallet);
        _setExcludedFromRewards(_vester5);
        _setExcludedFromRewards(_vester7);

        { // scope to avoid stack too deep errors
        // calculate mint allocations
        uint kieranMint = ((INITIAL_SUPPLY * KIERAN_PERCENTAGE) / 10000) + ((_darwinSoldInPresale * 25) / 100);
        uint wallet1Mint = (INITIAL_SUPPLY * WALLET1_PECENTAGE) / 10000;
        uint deployerMint = (INITIAL_SUPPLY * DEPLOYER_PERCENTAGE) / 10000;
        uint vester7Mint = (_darwinSoldInPresale * 75) / 100;
        uint vester5Mint = INITIAL_SUPPLY - (kieranMint + wallet1Mint + deployerMint + vester7Mint);

        // mint
        _mint(_kieran, kieranMint);
        _mint(_wallet1, wallet1Mint);
        _mint(msg.sender, deployerMint);
        _mint(_vester7, vester7Mint);
        _mint(_vester5, vester5Mint);
        }

        // grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MAINTENANCE_ROLE, msg.sender);
        _grantRole(SECURITY_ROLE, msg.sender);
        _grantRole(COMMUNITY_ROLE, _darwinCommunity);
        _grantRole(UPGRADER_ROLE, _darwinCommunity);
        _grantRole(MINTER_ROLE, _vester5);
        _grantRole(MINTER_ROLE, _vester7);

        isPaused = true;
    }

    ////////////////////// SWAP FUNCTIONS ///////////////////////////////////

    function setDarwinSwapFactory(address _darwinSwapFactory) external onlyRole(MAINTENANCE_ROLE) {
        require(address(darwinSwapFactory) == address(0), "DARWIN: DarwinSwap Factory address already set");
        darwinSwapFactory = IUniswapV2Factory(_darwinSwapFactory);
        _grantRole(FACTORY_ROLE, _darwinSwapFactory);
    }

    function registerDarwinSwapPair(address _pair) external onlyRole(FACTORY_ROLE) {
        _registerPair(_pair);
    }

    ////////////////////// MAINTENANCE FUNCTIONS ///////////////////////////////////

    function setLive() external onlyRole(MAINTENANCE_ROLE) {
        isPaused = false;
        isLive = true;
    }

    function setPauseWhitelist(address _addr, bool value) external onlyRole(MAINTENANCE_ROLE) {
        pauseWhitelist[_addr] = value;
    }

    function setPresaleAddress(address _addr) external onlyRole(MAINTENANCE_ROLE) {
        require(!isLive, "DARWIN: Darwin Protocol is already live");
        _setExcludedFromRewards(_addr);
        isExcludedFromHoldingLimit[_addr] = true;
        isExcludedFromSellLimit[_addr] = true;
        pauseWhitelist[_addr] = true;
    }

    ////////////////////// SECURITY FUNCTIONS ///////////////////////////////////

    function emergencyPause() external onlyRole(SECURITY_ROLE) {
        if(!isPaused && !isLive) {
            isPaused = true;
        }
    }

    function emergencyUnPause() external onlyRole(SECURITY_ROLE) {
        if(isPaused && !isLive) {
            isPaused = false;
        }
    }

    ////////////////////// REWARDS FUNCTIONS /////////////////////////////////////

    function _getRewardsOwed(uint _cumulativeRewardsPerToken, uint _lastCumulativeRewards, uint _balance) internal pure returns(uint) {
        return ((_cumulativeRewardsPerToken - _lastCumulativeRewards) * _balance) /_MULTIPLIER;
    }

    function _distributeRewardToUser(uint _culmulativeRewardsPerToken, uint _accountsLastCulmulativeRewards, uint _balance, address _account) internal returns(uint newBalance) {
        uint _rewardsOwed = _getRewardsOwed(_culmulativeRewardsPerToken, _accountsLastCulmulativeRewards, _balance);
        if (_rewardsOwed > ERC20Upgradeable.balanceOf(rewardsWallet)) {
            _rewardsOwed = ERC20Upgradeable.balanceOf(rewardsWallet);
        }
        _lastCulmulativeRewards[_account] = _culmulativeRewardsPerToken;
        if (_rewardsOwed > 0) {
            _setBalances(rewardsWallet, _account, _rewardsOwed);
        }
        newBalance = _balance + _rewardsOwed;
    }

    function distributeRewards(uint256 amount) external {
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
        if(_isExcludedFromRewards[account]) return;

        uint _culmulativeRewardPerToken = culmulativeRewardPerToken;
        uint last = _lastCulmulativeRewards[account];
        if(last < _culmulativeRewardPerToken) {
            _distributeRewardToUser(_culmulativeRewardPerToken, last, ERC20Upgradeable.balanceOf(account), account);
        }
        _isExcludedFromRewards[account] = true;
        excludedFromRewards.push(account);
    }

    function _removeExcludedFromRewards(address account) internal {
        if(!_isExcludedFromRewards[account]) return;
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

    function _registerPair(address pairAddress) internal {
        isExcludedFromSellLimit[pairAddress] = true;
        isExcludedFromHoldingLimit[pairAddress] = true;
        _setExcludedFromRewards(pairAddress);
    }

    function _updateBalance(address account) internal {
        if(_isExcludedFromRewards[account]) return;
        uint _culmulativeRewardPerToken = culmulativeRewardPerToken;
        uint _lastCulmulativeReward = _lastCulmulativeRewards[account];
        if(_culmulativeRewardPerToken > _lastCulmulativeReward) {
            _distributeRewardToUser(_culmulativeRewardPerToken, _lastCulmulativeReward, ERC20Upgradeable.balanceOf(account), account);
        }
    }

    ////////////////////// LIMITS FUNCTIONS /////////////////////////////////////

    function maxTokenHoldingSize() public view returns(uint256) {
        return totalSupply() / 50; // 2% of the supply
    }

    function _enforceHoldingLimit(address account) private view {
        if(isExcludedFromHoldingLimit[account]) return;
        if (ERC20Upgradeable.balanceOf(account) > maxTokenHoldingSize()) {
            revert HoldingLimitExceeded();
        }
    }

    function maxTokenSellSize() public view returns(uint256) {
        return totalSupply() / 1000; // .1% of the supply
    }

    /// @notice inforce token sale limit over sale limit duration
    function _enforceSellLimit(address account, uint256 amount) private {
        if(isExcludedFromSellLimit[account] || account == address(0)) return;
        TokenSellLog storage log = _tokenSellLog[account];
        uint216 newAmount = uint216(amount);
        uint40 currentTime = uint40(block.timestamp);
        uint40 timeSinceLastSell = currentTime - log.lastSale;
        if(timeSinceLastSell < MAX_TOKEN_SALE_LIMIT_DURATION) {
            newAmount += uint216(((MAX_TOKEN_SALE_LIMIT_DURATION - timeSinceLastSell) * log.amount) / MAX_TOKEN_SALE_LIMIT_DURATION);
        }
        if(newAmount > maxTokenSellSize()) revert SellLimitExceeded();
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
        _updateBalance(to);
        _enforceSellLimit(from, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._afterTokenTransfer(from, to, amount);
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

    function mint(address account, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyReached();
        _mint(account, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        totalBurnt += amount;
    }

    ////////////////////// COMMUNITY FUNCTIONS /////////////////////////////////////

    function setMinter(address user_, bool canMint_) external onlyRole(COMMUNITY_ROLE) {
        if (canMint_) {
            _grantRole(MINTER_ROLE, user_);
        } else {
            _revokeRole(MINTER_ROLE, user_);
        }
    }

    function setMaintenance(address _account, bool _hasRole) external onlyRole(COMMUNITY_ROLE) {
        if (_hasRole) {
            _grantRole(MAINTENANCE_ROLE, _account);
        } else {
            _revokeRole(MAINTENANCE_ROLE, _account);
        }
    }

    function setSecurity(address _account, bool _hasRole) external onlyRole(COMMUNITY_ROLE) {
        if (_hasRole) {
            _grantRole(SECURITY_ROLE, _account);
        } else {
            _revokeRole(SECURITY_ROLE, _account);
        }
    }

    function setUpgrader(address _account, bool _hasRole) external onlyRole(COMMUNITY_ROLE) {
        if (_hasRole) {
            _grantRole(UPGRADER_ROLE, _account);
        } else {
            _revokeRole(UPGRADER_ROLE, _account);
        }
    }

    function setReceiveRewards(address account, bool shouldReceive) external onlyRole(COMMUNITY_ROLE) {
        if (shouldReceive) {
            _removeExcludedFromRewards(account);
        } else {
            _setExcludedFromRewards(account);
        }
    }

    function setHoldingLimitWhitelist(address account, bool whitelisted) external onlyRole(COMMUNITY_ROLE) {
        isExcludedFromHoldingLimit[account] = whitelisted;
    }

    function setSellLimitWhitelist(address account, bool whitelisted) external onlyRole(COMMUNITY_ROLE) {
        isExcludedFromSellLimit[account] = whitelisted;
    }

    function communityPause() external onlyRole(COMMUNITY_ROLE) {
        if(!isPaused) {
            isPaused = true;
        }
    }

    function communityUnPause() external onlyRole(COMMUNITY_ROLE) {
        if(isPaused) {
            isPaused = false;
        }
    }

    function registerPair(address pairAddress) external onlyRole(COMMUNITY_ROLE) {
        _registerPair(pairAddress);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE){}

}