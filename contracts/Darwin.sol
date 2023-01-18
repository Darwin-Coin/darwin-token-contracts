pragma solidity 0.8.14;

//TODO: add proper license
// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interface/IDarwin.sol";
import "./interface/IDarwinCommunity.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./Tokenomics2.sol";

contract Darwin is IDarwin, Tokenomics2, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    // roles
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PRESALE_ROLE = keccak256("PRESALE_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // constants
    uint256 private constant _MULTIPLIER = 2**160;
    uint256 private constant _PERCENTAGE_MULTIPLIER = 100;
    uint256 private constant _PERCENTAGE_100 = 100 * _PERCENTAGE_MULTIPLIER;

    uint256 public constant DEV_WALLET_PECENTAGE = 10;
    uint256 public constant MAX_SUPPLY = 1e8 ether; // max supply: 100m
    uint256 public constant MAX_TOKEN_HOLDING_SIZE = (MAX_SUPPLY * 2) / 100; // 2% of the supply
    uint256 public constant MAX_TOKEN_SELL_SIZE = MAX_SUPPLY / 1000; // .1% of the supply;
    uint256 public constant MAX_TOKEN_SALE_LIMIT_DURATION = 5 hours;

    // limit exclusions
    //TODO: consider changing to private, but test expect this to be accessable
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


    address public rewardsWallet;
    IDarwinCommunity darwinCommunity;

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
        address _presaleContractAddress,
        address _darwinCommunity
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        //TODO: set these values in the constructor
        __tokenomics2_init_unchained(0xB403e23F1d68682771af32278F5Dde4361539Ee4, 0x0000000000000000000000000000000000000000, _presaleContractAddress, uniswapV2RouterAddress, 5, 5); // tokenomics1: Tokenomics 1.0 Wallet (0xB403e23F1d68682771af32278F5Dde4361539Ee4); tokenomics2: Tokenomics 2.0 Wallet (NOT_SET_YET)
        __darwin_init_unchained(uniswapV2RouterAddress, 0x0bF1C4139A6168988Fe0d1384296e6df44B27aFd, _darwinCommunity, _presaleContractAddress); // wallet1: Wallet 1 (0x0bF1C4139A6168988Fe0d1384296e6df44B27aFd)
        __UUPSUpgradeable_init();
        __ERC20_init_unchained("Darwin Coin", "DARWIN");
    }

    function __darwin_init_unchained(
        address uniswapV2RouterAddress,
        address _wallet1,
        address _darwinCommunity,
        address _presaleContractAddress
    ) private onlyInitializing { 

        // exclude wallets from sell limit
        isExcludedFromSellLimit[_msgSender()] = true;
        isExcludedFromSellLimit[_wallet1] = true;
        isExcludedFromSellLimit[_darwinCommunity] = true;

        // exclude wallets from holding limit
        isExcludedFromHoldingLimit[_msgSender()] = true;
        isExcludedFromHoldingLimit[_wallet1] = true;
        isExcludedFromHoldingLimit[_darwinCommunity] = true;

        _setExcludedFromRewards(_msgSender());

        _setExcludedFromRewards(_darwinCommunity);

        _setExcludedFromRewards(_wallet1);

        uint devMint = (MAX_SUPPLY * DEV_WALLET_PECENTAGE / 100);

        uint deployerMint = MAX_SUPPLY - devMint;

        _mint(_wallet1, devMint);

        _mint(msg.sender, deployerMint);

        IUniswapV2Router02 uniswapV2Router = IUniswapV2Router02(uniswapV2RouterAddress);

        /////TODO: should we really be setting the rewards wallet to be this?
        //rewardsWallet = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, block.number)))));
        rewardsWallet = 0x3Cc90773ebB2714180b424815f390D937974109B;

        // Create a uniswap pair for this new token
        IUniswapV2Pair uniswapV2Pair = IUniswapV2Pair(
            IUniswapV2Factory(uniswapV2Router.factory()).createPair(address(this), uniswapV2Router.WETH())
        );

        // add exchange wallets
        _registerPair(uniswapV2RouterAddress, address(uniswapV2Pair));

        darwinCommunity = IDarwinCommunity(_darwinCommunity);

        // grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(PRESALE_ROLE, _presaleContractAddress);

    }

    /// @notice Whitelists/unwhitelists an array of addresses.
    /// @dev Address at addresses[n] gets kinds[n]-whitelisted if values[n] is true, otherwise it gets kinds[n]-unwhitelisted.
    /// @param addresses Array of addresses to be whitelisted/unwhitelisted.
    /// @param kinds Array of uints representing the whitelist types.
    /// @param values Array of bools. `value[n]` is true if address[n] has to be whitelisted.
    function setWhitelist(address[] memory addresses, uint[] memory kinds, bool[] memory values) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(addresses.length == kinds.length && kinds.length == values.length, "setWhitelist: Length must be the same for the 3 arrays");

        // k = 1 ---> trade + holding + sell + rewards
        // k = 2 ---> trade + holding + sell
        // k = 3 ---> holding + sell + rewards
        // k = 4 ---> holding + sell
        // k = 5 ---> trade + rewards
        // k = 6 ---> trade
        for (uint i = 0; i < addresses.length; i++) {
            address a = addresses[i];
            uint k = kinds[i];
            bool v = values[i];

            if (k <= 6 && k > 4) {
                setPauseWhitelist(a, v); // trade
                if (k == 5) {
                    setReceiveRewards(a, v); // include/exclude in rewards (reflection)
                }
            }
            
            else if (k <= 4) {
                isExcludedFromSellLimit[a] = v; // sell
                isExcludedFromHoldingLimit[a] = v; // holding
                if (k == 3) {
                    setReceiveRewards(a, v); // include/exclude in rewards (reflection)
                } else if (k <= 2) {
                    setPauseWhitelist(a, v); // trade
                    if (k == 1) {
                        setReceiveRewards(a, v); // include/exclude in rewards (reflection)
                    }
                }
            }
        }
    }

    function setReceiveRewards(address a, bool v) private {
        if (v) {
            _removeExcludedFromRewards(a); // include in rewards (reflection)
        } else {
            _setExcludedFromRewards(a); // exclude from rewards (reflection)
        }
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function setRouter(address _newRouter) external onlyRole(PRESALE_ROLE) {
        IUniswapV2Router02 uniswapV2Router = IUniswapV2Router02(_newRouter);

        (address token0, address token1) = address(this) < uniswapV2Router.WETH() ? (address(this), uniswapV2Router.WETH()) : (uniswapV2Router.WETH(), address(this));
        if (IUniswapV2Factory(uniswapV2Router.factory()).getPair(token0, token1) == address(0)) {
            IUniswapV2Pair uniswapV2Pair = IUniswapV2Pair(
                IUniswapV2Factory(uniswapV2Router.factory()).createPair(address(this), uniswapV2Router.WETH())
            );

            _registerPair(_newRouter, address(uniswapV2Pair));
        }

        _setBuyWhitelist(_newRouter, true);
    }

    ////////////////////// PAUSE FUNCTIONS ///////////////////////////////////

    function setLive() external onlyRole(DEFAULT_ADMIN_ROLE) {
        isLive = true;
    }

    function pause() external onlyRole(PRESALE_ROLE) {
        if(isPaused == false) {
            isPaused = true;
        }
    }

    function unPause() external onlyRole(PRESALE_ROLE) {
        if(isPaused) {
            isPaused = false;
        }
    }

    function setPauseWhitelist(address _addr, bool value) public onlyRole(DEFAULT_ADMIN_ROLE) {
        pauseWhitelist[_addr] = value;
    }

    ////////////////////// NEW FUNCTIONS /////////////////////////////////////

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

    function _registerPair(address routerAddress, address pairAddress) internal override {
        super._registerPair(routerAddress, pairAddress);
        isExcludedFromSellLimit[pairAddress] = true;
        isExcludedFromHoldingLimit[pairAddress] = true;
        _setExcludedFromRewards(pairAddress);
    }

    function _unRegisterPair(address routerAddress, address pairAddress) internal override {
        super._unRegisterPair(routerAddress, pairAddress);
        delete isExcludedFromSellLimit[pairAddress];
        delete isExcludedFromHoldingLimit[pairAddress];
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
        if(isExcludedFromHoldingLimit[account]) return;
        if (ERC20Upgradeable.balanceOf(account) > MAX_TOKEN_HOLDING_SIZE) {
            revert HoldingLimitExceeded();
        }
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
        if(newAmount > MAX_TOKEN_SELL_SIZE) revert SellLimitExceeded();
        (log.amount, log.lastSale) = (newAmount, currentTime);
    }

    function setMinter(address user_, bool canMint_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (canMint_) {
            _grantRole(MINTER_ROLE, user_);
        } else {
            _revokeRole(MINTER_ROLE, user_);
        }
    }

    function setBuyWhitelist(address user_, bool whitelist_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setBuyWhitelist(user_, whitelist_);
    }

    function setSellWhitelist(address user_, bool whitelist_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setSellWhitelist(user_, whitelist_);
    }

    function setTokenomics1Wallet(address tokenomics1_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenomics1Wallet(tokenomics1_);
    }

    function setTokenomics2Wallet(address tokenomics2_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenomics2Wallet(tokenomics2_);
    }

    function setPoolTaxBuy(uint256 tax_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setPoolTaxBuy(tax_);
    }

    function setUserTaxSell(uint256 tax_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setUserTaxSell(tax_);
    }

    /////////////////////// TRANSFER FUNCTIONS //////////////////////////////////////

    function balanceOf(address account) public view override returns (uint256 balance) {
        balance = super.balanceOf(account);
        if (!_isExcludedFromRewards[account]) {
            balance += _getRewardsOwed(culmulativeRewardPerToken, _lastCulmulativeRewards[account], balance);
        }
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override notPaused returns(uint) {
        _updateBalance(from);
        _updateBalance(to);
        _enforceSellLimit(from, amount);
        return super._beforeTokenTransfer(from, to, amount);
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
        _mint(address account, uint256 amount);
    }

    ////////////////////// COMMUNITY FUNCTIONS /////////////////////////////////////

    function excludeFromRewards(address account) external onlyDarwinCommunity {
        _setExcludedFromRewards(account);
    }

    function registerPair(address routerAddress, address pairAddress) public onlyDarwinCommunity {
        _registerPair(routerAddress, pairAddress);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE){}

}