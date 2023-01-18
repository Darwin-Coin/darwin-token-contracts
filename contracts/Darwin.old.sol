pragma solidity 0.8.14;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "./interface/IDarwin.old.sol";
import "./interface/IDarwinCommunity.sol";

/// @title Darwin Token
contract DarwinOld is IDarwin, OwnableUpgradeable, UUPSUpgradeable {
    using AddressUpgradeable for address;

    /// @notice Accumulatively log sold tokens
    struct TokenSellLog {
        uint256 window;
        uint256 amount;
    }

    struct Values {
        uint256 tTransferAmount;
        uint256 tReflection;
        uint256 tCommunity;
        uint256 rAmount;
        uint256 rTransferAmount;
        uint256 rReflection;
        uint256 rCommunity;
        uint256 tUnsyncAmount;
    }

    struct TValues {
        uint256 tTransferAmount;
        uint256 tReflection;
        uint256 tCommunity;
        uint256 tUnsyncAmount;
    }

    struct RValues {
        uint256 rAmount;
        uint256 rTransferAmount;
        uint256 rReflection;
        uint256 rCommunity;
    }

    uint256 private constant _MAX = ~uint256(0);
    uint256 private constant _PERCENTAGE_MULTIPLIER = 100;
    uint256 private constant _PERCENTAGE_100 = 100 * _PERCENTAGE_MULTIPLIER;

    uint256 public constant DEV_WALLET_PECENTAGE = 10 * _PERCENTAGE_MULTIPLIER;

    uint256 private _tTotal;
    uint256 private _rTotal;

    mapping(address => uint256) private _tOwned;
    mapping(address => uint256) private _rOwned;

    mapping(address => bool) private _isExcludedFromReflection;
    mapping(address => bool) private _isExcludedFromSellLimit;
    mapping(address => bool) private _isExcludedFromHoldingLimit;

    address[] private _excludedFromReflection;

    mapping(address => bool) private _isPairAddress;
    mapping(address => bool) private _isExchangeRouterAddress;
    mapping(address => address) private _pairToRouter;

    mapping(address => mapping(address => uint256)) private _allowances;

    mapping(address => uint256) private _pairUnsyncAmount;
    address[] private _outOfSyncPairs;

    /// @notice track sold tokens over maxTokenSaleLimitDuration
    mapping(address => TokenSellLog) private _tokenSellLog;

    uint256 public communityTokensPercentage;

    uint256 public maxTokenSaleLimitDuration;

    uint256 public tReflectionTotal;
    uint256 public tBurnTotal;

    uint256 public maxTokenSellSize;
    uint256 public maxTokenHoldingSize;

    address public reflectionWallet;

    IUniswapV2Router02 public uniswapV2Router;
    IUniswapV2Pair public uniswapV2Pair;
    IDarwinCommunity public darwinCommunity;

    bool public isPaused;
    bool public isLive;
    mapping(address => bool) private pauseWhitelist;

    modifier onlyDarwinCommunity() {
        if (
            msg.sender != address(darwinCommunity) && (address(darwinCommunity) != address(0) || msg.sender != owner())
        ) {
            revert OnlyDarwinCommunity();
        }
        _;
    }

    modifier notPaused() {
        if (isPaused) {
            if (isLive || pauseWhitelist[msg.sender] == false) revert Paused();
        }
        _;
    }

    // to receive ETH from uniswapV2Router when swapping
    receive() external payable {}

    function initialize(
        address uniswapV2RouterAddress,
        address _devWallet,
        address _darwinCommunity
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __darwin_init_unchained(uniswapV2RouterAddress, _devWallet, _darwinCommunity);
        __UUPSUpgradeable_init();
    }

    function setLive() external onlyOwner {
        isLive = true;
    }

    function pause() external onlyOwner {
        if (isPaused == false) {
            isPaused = true;
        }
    }

    function unPause() external onlyOwner {
        if (isPaused) {
            isPaused = false;
        }
    }

    function setPauseWhitelist(address _addr, bool value) external onlyOwner {
        pauseWhitelist[_addr] = value;
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        return _transfer(_msgSender(), recipient, _getRate(), amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        if (amount > _allowances[sender][msg.sender]) revert InsufficientAllowance();
        _transfer(sender, recipient, _getRate(), amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()] - amount);
        return true;
    }

    function bulkTransfer(address[] calldata recipients, uint256[] calldata amounts) external override {
        if (recipients.length != amounts.length) revert InvalidArrayLengths();
        uint256 currentRate = _getRate();

        for (uint256 i = 0; i < recipients.length; ) {
            address recepient = recipients[i];

            _transfer(msg.sender, recepient, currentRate, amounts[i]);

            //tokens sent to reflection wallet, update the rate
            if (recepient == reflectionWallet) {
                currentRate = _getRate();
            }

            unchecked {
                ++i;
            }
        }
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        syncTokenInOutOfSyncExchangesSafe();
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    // TODO: change to external / remove
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        syncTokenInOutOfSyncExchangesSafe();
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    // TODO: change to external / remove
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        syncTokenInOutOfSyncExchangesSafe();
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] - subtractedValue);
        return true;
    }

    function syncTokenInOutOfSyncExchangesSafe() public override {
        address[] memory outOfSync = _outOfSyncPairs;

        for (uint256 i = 0; i < outOfSync.length; ) {
            address unSyncedPair = outOfSync[i];

            if (_shouldPerformSync(unSyncedPair)) {
                uint256 amount = _pairUnsyncAmount[unSyncedPair];

                _pairUnsyncAmount[unSyncedPair] = 0;

                (bool success, ) = unSyncedPair.call(abi.encodeWithSignature("sync()"));
                if (!success) {
                    _pairUnsyncAmount[unSyncedPair] = amount;
                } else {
                    _outOfSyncPairs[i] = outOfSync[outOfSync.length - 1];
                    _outOfSyncPairs.pop();

                    outOfSync = _outOfSyncPairs;
                    continue;
                }
            }

            unchecked {
                ++i;
            }
        }
    }

    // TODO: change to external
    function setDarwinCommunity(address _darwinCommunity) public onlyDarwinCommunity {
        address prev = address(darwinCommunity);
        uint256 balance = balanceOf(prev);

        _transfer(prev, _darwinCommunity, _getRate(), balance);

        _isExcludedFromSellLimit[_darwinCommunity] = true;
        _isExcludedFromHoldingLimit[_darwinCommunity] = true;

        _isExcludedFromSellLimit[prev] = false;
        _isExcludedFromHoldingLimit[prev] = false;

        darwinCommunity = IDarwinCommunity(_darwinCommunity);
    }

    function excludeFromReflectionSafe(address account) public onlyDarwinCommunity {
        if (!_isExcludedFromReflection[account]) {
            if (_rOwned[account] > 0) {
                _tOwned[account] = _tokenFromReflection(_rOwned[account], _getRate());
            }
            _isExcludedFromReflection[account] = true;
            _excludedFromReflection.push(account);

            emit ExcludedFromReflection(account, true);
        }
    }

    function includeInReflectionSafe(address account) public onlyDarwinCommunity {
        if (_isExcludedFromReflection[account]) {
            address[] memory excludedArray = _excludedFromReflection;
            for (uint256 i = 0; i < excludedArray.length; ) {
                if (excludedArray[i] == account) {
                    _excludedFromReflection[i] = excludedArray[excludedArray.length - 1];
                    _tOwned[account] = 0;
                    _isExcludedFromReflection[account] = false;
                    _excludedFromReflection.pop();
                    break;
                }

                unchecked {
                    ++i;
                }
            }

            emit ExcludedFromReflection(account, false);
        }
    }

    function registerPair(address routerAddress, address pairAddress) public onlyDarwinCommunity {
        if (_isPairAddress[pairAddress] && _isExchangeRouterAddress[routerAddress]) {
            revert PairAlreadyRegistered();
        }

        _isPairAddress[pairAddress] = true;
        _isExchangeRouterAddress[routerAddress] = true;
        _pairToRouter[pairAddress] = routerAddress;
        _isExcludedFromSellLimit[pairAddress] = true;
        _isExcludedFromHoldingLimit[pairAddress] = true;

        excludeFromReflectionSafe(pairAddress);

        emit ExchangeAdded(pairAddress);
    }

    // TODO: change to external
    function unRegisterPair(address pairAddress) public onlyDarwinCommunity {
        if (!_isPairAddress[pairAddress]) {
            revert PairNotRegistered();
        }

        _isPairAddress[pairAddress] = false;
        _pairToRouter[pairAddress] = address(0);
        _isExcludedFromSellLimit[pairAddress] = false;
        _isExcludedFromHoldingLimit[pairAddress] = false;

        includeInReflectionSafe(pairAddress);

        emit ExchangedRemoved(pairAddress);
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (_isPairAddress[account]) {
            uint256 balance = _balanceOf(account, _getRate());
            return balance + _pairUnsyncAmount[account];
        }
        return _balanceOf(account, _getRate());
    }

    // TODO: change to external / remove
    function isExcludedFromReward(address account) public view override returns (bool) {
        return _isExcludedFromReflection[account];
    }

    // TODO: change to external / remove
    function isExcludedFromTxLimit(address account) public view override returns (bool) {
        return _isExcludedFromSellLimit[account];
    }

    // TODO: change to external / remove
    function isExcludedFromHoldingLimit(address account) public view override returns (bool) {
        return _isExcludedFromHoldingLimit[account];
    }

    // TODO: change to external / remove
    function getOutOfSyncedPairs() public view override returns (address[] memory) {
        return _outOfSyncPairs;
    }

    // TODO: change to external / remove
    function getOutOfSyncedAmount(address pair) public view override returns (uint256) {
        return _pairUnsyncAmount[pair];
    }

    function isExcludedFromSellLimit(address account) public view returns (bool) {
        return _isExcludedFromSellLimit[account];
    }

    // TODO: change to external / remove
    function isExcludedFromReflection(address account) public view returns (bool) {
        return _isExcludedFromReflection[account];
    }

    // TODO: change to external / remove
    function isExchangeAddress(address account) public view override returns (bool) {
        return _isPairAddress[account];
    }

    function getMaxTokenSellLimitWindow() public view returns (uint256) {
        return block.timestamp / maxTokenSaleLimitDuration;
    }

    // TODO: change to external if not used elsewhere
    function getTokenSellInLastMaxSellLimitFrame(address account) public view returns (uint256) {
        uint256 limitFrame = getMaxTokenSellLimitWindow();
        TokenSellLog memory log = _tokenSellLog[account];
        return log.window == limitFrame ? log.amount : 0;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function name() public pure returns (string memory) {
        return "Darwin";
    }

    function symbol() public pure returns (string memory) {
        return "DARWIN";
    }

    function decimals() public pure returns (uint256) {
        return 18;
    }

    function _getAmountToBurnBasedOnDesync(
        uint256 amountDarwin,
        address pair,
        uint256 burnAmount
    ) internal view returns (uint256) {
        (uint256 reserveDarwin, uint256 reserveCurrent, ) = IUniswapV2Pair(pair).getReserves();

        IUniswapV2Router01 router = IUniswapV2Router01(_pairToRouter[pair]);

        uint256 expectedAmountOut = router.getAmountOut(amountDarwin, reserveDarwin, reserveCurrent);

        //this could be the reserve amount after tokens have been removed from the sale, and after a sync occurs
        ///@notice including the burn amount may need to be removed as this could already be applied to the _pairUnsyncAmount[pair]
        uint256 reserveAfterSync = reserveCurrent - _pairUnsyncAmount[pair] - expectedAmountOut - burnAmount;

        uint256 reserveDarwinAfterSale = reserveDarwin + amountDarwin;

        uint256 syncAmountOut = router.getAmountOut(amountDarwin, reserveDarwinAfterSale, reserveAfterSync);

        if (syncAmountOut > expectedAmountOut) {
            //burn the difference of price impact and desync amount
            return amountDarwin - (amountDarwin * (expectedAmountOut / syncAmountOut));
        }

        return 0;
    }

    function __darwin_init_unchained(
        address uniswapV2RouterAddress,
        address _devWallet,
        address _darwinCommunity
    ) private onlyInitializing {
        _tTotal = 10 * 10**9 * 10**decimals(); // 10B // TODO: check this
        _rTotal = (_MAX - (_MAX % _tTotal));

        maxTokenHoldingSize = (_tTotal / 100) * 2; // 2% of the supply
        maxTokenSellSize = _tTotal / 100 / 10; // .1% of the supply

        communityTokensPercentage = 5 * _PERCENTAGE_MULTIPLIER; // 5%

        maxTokenSaleLimitDuration = 5 hours;

        // transfer tokens to owner
        _rOwned[_devWallet] = (_rTotal / _PERCENTAGE_100) * DEV_WALLET_PECENTAGE;
        _rOwned[_msgSender()] = _rTotal - _rOwned[_devWallet];

        uniswapV2Router = IUniswapV2Router02(uniswapV2RouterAddress);

        reflectionWallet = _getPseudoRandomWallet(block.timestamp / 2);

        // Create a uniswap pair for this new token
        uniswapV2Pair = IUniswapV2Pair(
            IUniswapV2Factory(uniswapV2Router.factory()).createPair(address(this), uniswapV2Router.WETH())
        );

        // add exchange wallets
        registerPair(uniswapV2RouterAddress, address(uniswapV2Pair));

        // exclude wallets from sell limit
        _isExcludedFromSellLimit[_msgSender()] = true;
        _isExcludedFromSellLimit[_devWallet] = true;
        _isExcludedFromSellLimit[_darwinCommunity] = true;

        // exclude wallets from holding limit
        _isExcludedFromHoldingLimit[_msgSender()] = true;
        _isExcludedFromHoldingLimit[_devWallet] = true;
        _isExcludedFromHoldingLimit[_darwinCommunity] = true;

        darwinCommunity = IDarwinCommunity(_darwinCommunity);

        emit Transfer(address(0), _msgSender(), (_tTotal * DEV_WALLET_PECENTAGE) / _PERCENTAGE_100);
        emit Transfer(address(0), _devWallet, _tTotal - (_tTotal * DEV_WALLET_PECENTAGE) / _PERCENTAGE_100);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) private {
        if (owner == address(0) || spender == address(0)) {
            revert ZeroAddress();
        }

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /// @notice inforce token sale limit over sale limit duration
    function _enforceSellLimit(address from, uint256 amount) private {
        // enforce time frame wise tnx limit
        TokenSellLog memory log = _tokenSellLog[from];
        uint256 maxTokenSaleLockWindow = getMaxTokenSellLimitWindow();

        bool isLastSellWithInLimitDuration = log.window == maxTokenSaleLockWindow;

        uint256 tokens = isLastSellWithInLimitDuration ? log.amount + amount : amount;

        if (tokens > maxTokenSellSize) {
            revert SellLimitExceeded();
        }

        // update the sale amount
        log.amount = tokens;
        log.window = maxTokenSaleLockWindow;

        _tokenSellLog[from] = log;
    }

    function _transfer(
        address from,
        address to,
        uint256 currentRate,
        uint256 amount
    ) private returns (bool) {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        bool isSell = _isTxnSell(to);

        // limit the token transfers
        if (isSell && !isExcludedFromSellLimit(from)) {
            _enforceSellLimit(from, amount);
        }

        if (!_isExcludedFromHoldingLimit[to]) {
            _enforceHoldingLimit(to, amount, currentRate);
        }

        if (!isSell) {
            syncTokenInOutOfSyncExchangesSafe();
        }

        _tokenTransfer(from, to, amount, currentRate, isSell);

        if (from != address(darwinCommunity)) {
            uint256 rate = currentRate;

            if (to == reflectionWallet) {
                //Community wallet was sent to, changing up reflection, so have to recalculate rate
                rate = _getRate();
            }
        }

        return true;
    }

    // it is responsible for taking out tokens from reward wallet, distributing them and taking the liquidity
    function _tokenTransfer(
        address sender,
        address recipient,
        uint256 amount,
        uint256 currentRate,
        bool isSell
    ) private {
        bool senderExcludedFromReflection = _isExcludedFromReflection[sender];
        bool recipientExcludedFromReflection = _isExcludedFromReflection[recipient];

        if (senderExcludedFromReflection && !recipientExcludedFromReflection) {
            _transferFromExcluded(sender, recipient, amount, currentRate, isSell);
        } else if (!senderExcludedFromReflection && recipientExcludedFromReflection) {
            _transferToExcluded(sender, recipient, amount, currentRate, isSell);
        } else if (!senderExcludedFromReflection && !recipientExcludedFromReflection) {
            _transferStandard(sender, recipient, amount, currentRate, isSell);
        } else if (senderExcludedFromReflection && recipientExcludedFromReflection) {
            _transferBothExcluded(sender, recipient, amount, currentRate, isSell);
        } else {
            _transferStandard(sender, recipient, amount, currentRate, isSell);
        }
    }

    function _transferFromExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell);

        _tOwned[sender] -= tAmount;
        _rOwned[sender] -= values.rAmount;
        _rOwned[recipient] += values.rTransferAmount;

        _performTokenomics(sender, recipient, values);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell);

        _rOwned[sender] -= values.rAmount;
        _tOwned[recipient] += values.tTransferAmount;
        _rOwned[recipient] += values.rTransferAmount;

        _performTokenomics(sender, recipient, values);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell);

        _rOwned[sender] -= values.rAmount;
        _rOwned[recipient] += values.rTransferAmount;

        _performTokenomics(sender, recipient, values);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferBothExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell);

        _tOwned[sender] -= tAmount;
        _rOwned[sender] -= values.rAmount;
        _tOwned[recipient] += values.tTransferAmount;
        _rOwned[recipient] += values.rTransferAmount;

        _performTokenomics(sender, recipient, values);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _performTokenomics(
        address sender,
        address recipient,
        Values memory values
    ) private {
        if (values.tReflection > 0) {
            _reflectTokens(values.tReflection, values.rReflection);
        }
        if (values.tCommunity > 0) {
            _takeCommunityTokens(sender, values.tCommunity, values.rCommunity);
        }
        if (values.tUnsyncAmount > 0) {
            _logExchangeTokens(recipient, values.tUnsyncAmount);
        }
    }

    function _reflectTokens(uint256 tReflection, uint256 rReflection) private {
        _rTotal -= rReflection;
        tReflectionTotal += tReflection;

        emit TokenReflection(tReflection);
    }

    function _takeCommunityTokens(
        address sender,
        uint256 tCommunity,
        uint256 rCommunity
    ) private {
        address communityWallet = address(darwinCommunity);
        _rOwned[communityWallet] += rCommunity;

        if (_isExcludedFromReflection[communityWallet]) {
            _tOwned[communityWallet] += tCommunity;
        }

        emit Transfer(sender, communityWallet, tCommunity);
    }

    function _logExchangeTokens(address receiverExchange, uint256 tUnsyncAmount) private {
        bool isNewValue = _pairUnsyncAmount[receiverExchange] == 0;

        _pairUnsyncAmount[receiverExchange] += tUnsyncAmount;

        if (isNewValue && _pairUnsyncAmount[receiverExchange] > 0) {
            _outOfSyncPairs.push(receiverExchange);
        }
    }

    function _shouldPerformSync(address destinationExchnage) private view returns (bool) {
        return msg.sender != destinationExchnage && msg.sender != _pairToRouter[destinationExchnage];
    }

    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = _rTotal;
        uint256 tSupply = _tTotal;

        address[] memory excludedArray = _excludedFromReflection;
        for (uint256 i = 0; i < excludedArray.length; i++) {
            uint256 rExcluded = _rOwned[excludedArray[i]];
            uint256 tExcluded = _tOwned[excludedArray[i]];

            if (rExcluded > rSupply || tExcluded > tSupply) return (_rTotal, _tTotal);
            rSupply -= rExcluded;
            tSupply -= tExcluded;
        }
        if (rSupply < (_rTotal / _tTotal)) return (_rTotal, _tTotal);
        return (rSupply, tSupply);
    }

    function _isTxnSell(address to) private view returns (bool) {
        return _isPairAddress[to] && msg.sender != owner() && msg.sender != address(darwinCommunity);
    }

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    function _enforceHoldingLimit(
        address receiver,
        uint256 amount,
        uint256 rate
    ) private view {
        uint256 balance = _balanceOf(receiver, rate) + amount;
        if (balance > maxTokenHoldingSize) {
            revert HoldingLimitExceeded();
        }
    }

    function _getValues(
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private view returns (Values memory) {
        TValues memory tValues = _getTValues(recipient, tAmount, isSell);

        RValues memory rValues = _getRValues(tAmount, tValues, currentRate);

        return
            Values({
                tTransferAmount: tValues.tTransferAmount,
                tReflection: tValues.tReflection,
                tCommunity: tValues.tCommunity,
                tUnsyncAmount: tValues.tUnsyncAmount,
                rAmount: rValues.rAmount,
                rTransferAmount: rValues.rTransferAmount,
                rReflection: rValues.rReflection,
                rCommunity: rValues.rCommunity
            });
    }

    function _getTValues(
        address recipient,
        uint256 tAmount,
        bool isSell
    ) private view returns (TValues memory) {
        uint256 tReflection = 0;
        uint256 tCommunity = 0;
        uint256 tTransferAmount = 0;
        uint256 tBurnAmount = 0;
        uint256 tUnsyncAmount = 0;

        // tokens sent to reflection
        if (recipient == reflectionWallet) {
            tReflection = tAmount;
        } else if (isSell) {
            (tTransferAmount, tBurnAmount, tCommunity) = _calculateTaxAmount(tAmount, recipient);
        } else {
            tTransferAmount = tAmount;
        }

        return
            TValues({
                tTransferAmount: tTransferAmount,
                tReflection: tReflection,
                tCommunity: tCommunity,
                tUnsyncAmount: tUnsyncAmount
            });
    }

    function _getPseudoRandomWallet(uint256 salt) private view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, salt)))));
    }

    function _balanceOf(address account, uint256 rate) private view returns (uint256) {
        if (_isExcludedFromReflection[account]) return _tOwned[account];
        return _tokenFromReflection(_rOwned[account], rate);
    }

    function _tokenFromReflection(uint256 rAmount, uint256 rate) private view returns (uint256) {
        if (rAmount > _rTotal) {
            revert RAmountGreaterThanReflections();
        }
        return rAmount / rate;
    }

    function _calculateTaxAmount(uint256 tAmount, address recipient)
        private
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 tCommunity = _calculateNormalCommunityTokens(tAmount);
        uint256 addOnCommunityTokens = _getAmountToBurnBasedOnDesync(tAmount, recipient, tCommunity);

        uint256 tTransferAmount = tAmount - tCommunity - addOnCommunityTokens;
        uint256 tUnSyncAmount = tCommunity;

        return (tTransferAmount, tUnSyncAmount, tCommunity + addOnCommunityTokens);
    }

    // TODO: remove if not being used
    function _calculateReflectionAmount(address recepient, uint256 _amount) private view returns (uint256) {
        return recepient == reflectionWallet ? _amount : 0;
    }

    function _calculateNormalCommunityTokens(uint256 _amount) private view returns (uint256) {
        return (_amount * communityTokensPercentage) / _PERCENTAGE_100;
    }

    function _getRValues(
        uint256 tAmount,
        TValues memory tValues,
        uint256 currentRate
    ) private pure returns (RValues memory) {
        return
            RValues({
                rAmount: tAmount * currentRate,
                rTransferAmount: tValues.tTransferAmount * currentRate,
                rReflection: tValues.tReflection * currentRate,
                rCommunity: tValues.tCommunity * currentRate
            });
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}