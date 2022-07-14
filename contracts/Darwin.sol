pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "./interface/IDarwin.sol";
import "./interface/IUniswapV2Factory.sol";
import "./interface/UniSwapRouter.sol";
import "./interface/IUniswapV2Pair.sol";
import "./interface/IDarwinCommunity.sol";

import "hardhat/console.sol";

contract Darwin is IDarwin, OwnableUpgradeable {
    using AddressUpgradeable for address;

    uint256 private constant MAX = ~uint256(0);
    uint256 private constant PERCENTAGE_MULTIPLIER = 100;
    uint256 private constant PERCENTAGE_100 = 100 * PERCENTAGE_MULTIPLIER;

    uint256 public constant DEV_WALLET_PECENTAGE = 10 * PERCENTAGE_MULTIPLIER;

    modifier onlyDarwinCommunity() {
        require(
            msg.sender == address(darwinCommunity),
            "Darwin::onlyDarwinCommunity: only accessible to darwin community"
        );
        _;
    }

    /// @notice Accumulatively log sold tokens
    struct TokenSellLog {
        uint256 window;
        uint256 amount;
        bool locked;
    }

    /// @notice Accumulatively log tnx tokens
    struct TokenTnxLog {
        uint256 window;
        uint256 amount;
    }

    struct Values {
        uint256 tTransferAmount;
        uint256 tBurnAmount;
        uint256 tReflection;
        uint256 tCommunity;
        uint256 rAmount;
        uint256 rTransferAmount;
        uint256 rBurnAmount;
        uint256 rReflection;
        uint256 rCommunity;
    }

    struct TValues {
        uint256 tTransferAmount;
        uint256 tBurnAmount;
        uint256 tReflection;
        uint256 tCommunity;
    }

    struct RValues {
        uint256 rAmount;
        uint256 rTransferAmount;
        uint256 rBurnAmount;
        uint256 rReflection;
        uint256 rCommunity;
    }

    uint256 private _tTotal;
    uint256 private _rTotal;

    mapping(address => uint256) private _tOwned;
    mapping(address => uint256) private _rOwned;

    mapping(address => bool) private _isExcludedFromReflection;
    mapping(address => bool) private _isExcludedFromSellLimit;
    mapping(address => bool) private _isExcludedFromHoldingLimit;

    address[] private _excludedFromReflection;

    mapping(address => bool) private _isPairAddress;
    mapping(address => bool) private _isExchnageRouterAddress;
    mapping(address => address) private _pairToRouter;

    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) private _nextSellIsLP;

    mapping(address => uint256) private _pairUnsyncAmount;
    address[] private outOfSyncPairs;

    /// @notice track sold tokens over maxTokenSaleLimitDuration
    mapping(address => TokenSellLog) private _tokenSellLog;

    /// @notice track received tokens over receivedTokenSellLimitDuration
    mapping(address => TokenTnxLog) private _tokenReceivedLog;

    /// @notice track bought tokens boughtTokenSellLimitDuration
    mapping(address => TokenTnxLog) private _tokenBoughtLog;

    /// @notice last token received timestamp
    mapping(address => uint256) private _lastTokenReceivedTime;

    uint256 public communityTokensPercentage;
    uint256 public burnPercentage;
    uint256 public penaltyBurnPercentage;

    uint256 public boughtTokenSellLimitDuration;
    uint256 public receivedTokenSellLimitDuration;
    uint256 public maxTokenSaleLimitDuration;

    uint256 public maxTokenSaleLimitLockDuration;

    uint256 public tReflectionTotal;
    uint256 public tBurnTotal;

    uint256 public maxTokenSellSize;
    uint256 public maxTokenHoldingSize;

    address public burnAddress;
    address public reflectionWallet;

    IUniswapV2Router02 public uniswapV2Router;
    IUniswapV2Pair public uniswapV2Pair;
    IDarwinCommunity darwinCommunity;

    function initialize(
        address uniswapV2RouterAddress,
        address _devWallet,
        address _darwinCommunity
    ) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __darwin_init_unchained(uniswapV2RouterAddress, _devWallet, _darwinCommunity);
    }

    function __darwin_init_unchained(
        address uniswapV2RouterAddress,
        address _devWallet,
        address _darwinCommunity
    ) private onlyInitializing {
        _tTotal = 100 * 10**9 * 10**decimals(); // 100B
        _rTotal = (MAX - (MAX % _tTotal));

        maxTokenHoldingSize = _tTotal / 100; // 1% of the supply
        maxTokenSellSize = _tTotal / 100 / 10; // .1% of the supply

        burnPercentage = 50; // 0.5%
        communityTokensPercentage = 5 * PERCENTAGE_MULTIPLIER; // 5%

        boughtTokenSellLimitDuration = 1 hours;
        receivedTokenSellLimitDuration = 1 hours;

        maxTokenSaleLimitDuration = 5 hours;
        maxTokenSaleLimitLockDuration = 5 hours;

        // transfer tokens to owner
        _rOwned[_devWallet] = (_rTotal / PERCENTAGE_100) * DEV_WALLET_PECENTAGE;
        _rOwned[_msgSender()] = _rTotal - _rOwned[_devWallet];

        uniswapV2Router = IUniswapV2Router02(uniswapV2RouterAddress);
        darwinCommunity = IDarwinCommunity(_darwinCommunity);

        burnAddress = 0x000000000000000000000000000000000000dEaD;
        reflectionWallet = getPsudoRandomWallet(block.timestamp / 2);

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

        //exclude burn wallet from reflection
        excludeFromReflectionSafe(burnAddress);

        emit Transfer(address(0), _msgSender(), (_tTotal * DEV_WALLET_PECENTAGE) / PERCENTAGE_100);
        emit Transfer(address(0), _devWallet, _tTotal - (_tTotal * DEV_WALLET_PECENTAGE) / PERCENTAGE_100);
    }

    function getPsudoRandomWallet(uint256 salt) private view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, salt)))));
    }

    function name() public pure returns (string memory) {
        return "Darwin";
    }

    function symbol() public pure returns (string memory) {
        return "DARWIN";
    }

    function decimals() public pure returns (uint256) {
        return 9;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        syncTokenInOutOfSyncExchnagesSafe();
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        syncTokenInOutOfSyncExchnagesSafe();
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        syncTokenInOutOfSyncExchnagesSafe();
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] - subtractedValue);
        return true;
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (_isPairAddress[account]) {
            uint256 balance = _balanceOf(account, _getRate());
            return balance + _pairUnsyncAmount[account];
        }
        return _balanceOf(account, _getRate());
    }

    function _balanceOf(address account, uint256 rate) private view returns (uint256) {
        if (_isExcludedFromReflection[account]) return _tOwned[account];
        return tokenFromReflection(_rOwned[account], rate);
    }

    function tokenFromReflection(uint256 rAmount, uint256 rate) private view returns (uint256) {
        require(rAmount <= _rTotal, "Darwin::tokenFromReflection: rAmount must be less than total reflections");
        return rAmount / rate;
    }

    function getOutOfSyncedPairs() public view override returns (address[] memory) {
        return outOfSyncPairs;
    }

    function getOutOfSyncedAmount(address pair) public view override returns (uint256) {
        return _pairUnsyncAmount[pair];
    }

    function shouldPerformSync(address destinationExchnage) private view returns (bool) {
        return msg.sender != destinationExchnage && msg.sender != _pairToRouter[destinationExchnage];
    }

    function syncTokenInOutOfSyncExchnagesSafe() public override {
        address[] memory outOfSync = outOfSyncPairs;

        for (uint256 i = 0; i < outOfSync.length; ) {
            address unSyncedPair = outOfSync[i];

            if (shouldPerformSync(unSyncedPair)) {
                uint256 amount = _pairUnsyncAmount[unSyncedPair];

                _pairUnsyncAmount[unSyncedPair] = 0;

                (bool success, ) = unSyncedPair.call(abi.encodeWithSignature("sync()"));
                if (!success) {
                    _pairUnsyncAmount[unSyncedPair] = amount;
                } else {
                    outOfSyncPairs[i] = outOfSync[outOfSync.length - 1];
                    outOfSyncPairs.pop();

                    outOfSync = outOfSyncPairs;
                    continue;
                }
            }

            unchecked {
                ++i;
            }
        }
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) private {
        require(owner != address(0), "ERC20:zero address");
        require(spender != address(0), "ERC20:zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    //to receive ETH from uniswapV2Router when swapping
    receive() external payable {}

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

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        return _transfer(_msgSender(), recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()] - amount);
        return true;
    }

    function excludeFromReflectionSafe(address account) public onlyOwner {
        if (!_isExcludedFromReflection[account]) {
            if (_rOwned[account] > 0) {
                _tOwned[account] = tokenFromReflection(_rOwned[account], _getRate());
            }
            _isExcludedFromReflection[account] = true;
            _excludedFromReflection.push(account);

            emit ExcludedFromReflection(account, true);
        }
    }

    function includeInReflectionSafe(address account) public onlyOwner {
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

    function isExcludedFromSellLimit(address account) public view returns (bool) {
        return _isExcludedFromSellLimit[account];
    }

    function isExcludedFromReflection(address account) public view returns (bool) {
        return _isExcludedFromReflection[account];
    }

    function registerPair(address routerAddress, address pairAddress) public onlyOwner {
        require(
            !_isPairAddress[pairAddress] || !_isExchnageRouterAddress[routerAddress],
            "Darwin::registerPair: already registered"
        );

        _isPairAddress[pairAddress] = true;
        _isExchnageRouterAddress[routerAddress] = true;
        _pairToRouter[pairAddress] = routerAddress;
        _isExcludedFromSellLimit[pairAddress] = true;
        _isExcludedFromHoldingLimit[pairAddress] = true;

        excludeFromReflectionSafe(pairAddress);

        emit ExchangeAdded(pairAddress);
    }

    function unRegisterPair(address pairAddress) public onlyOwner {
        require(_isPairAddress[pairAddress], "Darwin::unRegisterPair: pair not found");

        _isPairAddress[pairAddress] = false;
        _pairToRouter[pairAddress] = address(0);
        _isExcludedFromSellLimit[pairAddress] = false;
        _isExcludedFromHoldingLimit[pairAddress] = false;

        includeInReflectionSafe(pairAddress);

        emit ExchangedRemoved(pairAddress);
    }

    function isExchangeAddress(address account) public view override returns (bool) {
        return _isPairAddress[account];
    }

    function isTnxSell(address from, address to) private returns (bool) {
        if (_isPairAddress[to]) {
            if (_nextSellIsLP[from]) {
                _nextSellIsLP[from] = false;
                return false;
            }
            return true;
        }
        return _isPairAddress[to];
    }

    function enforceSellLimitForReceivedTokens(address seller, uint256 rate) private view {
        uint256 limitFrame = getReceivedTokenSellLimitWindow();
        TokenTnxLog memory log = _tokenReceivedLog[seller];
        uint256 tokenReceivedInLastLimitPeriod = log.window == limitFrame ? log.amount : 0;
        uint256 balance = _balanceOf(seller, rate);
        require(
            balance >= tokenReceivedInLastLimitPeriod,
            "Darwin::enforceSellLimitForReceivedTokens: sell temporarily blocked for received tokens"
        );
    }

    function logReceivedTokensForSellLimit(address receiver, uint256 amount) private {
        uint256 limitFrame = getReceivedTokenSellLimitWindow();
        TokenTnxLog storage log = _tokenReceivedLog[receiver];
        log.amount = log.window == limitFrame ? log.amount + amount : amount;
        log.window = limitFrame;
    }

    function logBoughtTokensForSellLimit(address receiver, uint256 amount) private {
        uint256 limitFrame = getBoughtTokenSellLimitWindow();
        TokenTnxLog storage log = _tokenBoughtLog[receiver];
        log.amount = log.window == limitFrame ? log.amount + amount : amount;
        log.window = limitFrame;
    }

    function getTokenSellInLastMaxSellLimitFrame(address account) public view returns (uint256) {
        uint256 limitFrame = getMaxTokenSellLimitWindow();
        TokenSellLog memory log = _tokenSellLog[account];
        return log.window == limitFrame ? log.amount : 0;
    }

    function enforceHoldingLimit(
        address receiver,
        uint256 amount,
        uint256 rate
    ) private view {
        uint256 balance = _balanceOf(receiver, rate) + amount;
        require(balance <= maxTokenHoldingSize, "Darwin::enforceHoldingLimit: receiver holding limit exceeded");
    }

    function getMaxTokenSellLimitWindow() public view returns (uint256) {
        return block.timestamp / maxTokenSaleLimitDuration;
    }

    function getReceivedTokenSellLimitWindow() public view returns (uint256) {
        return block.timestamp / receivedTokenSellLimitDuration;
    }

    function getBoughtTokenSellLimitWindow() public view returns (uint256) {
        return block.timestamp / boughtTokenSellLimitDuration;
    }

    /// @notice inforce token transfer lock/limit
    /// @param from : transferring address (there is no check if it is excluded from tnxLimit)
    /// @param to : receiving address
    /// @param amount : amount of tokens being transferred

    /// @return : whether tokens are allowed to sell or not
    function isTokenTransferAllowed(
        address from,
        uint256 amount,
        bool isSell
    ) private returns (bool) {
        // enforce time frame wise tnx limit
        TokenSellLog memory log = _tokenSellLog[from];
        uint256 maxTokenSaleLockWindow = getMaxTokenSellLimitWindow();

        bool isTokenTransferLocked = log.locked && log.window == maxTokenSaleLockWindow;

        require(!isTokenTransferLocked, "DARWIN::isTokenTransferAllowed: token transfer tmp locked");

        bool isLastSellWithInLimitDuration = log.window == maxTokenSaleLockWindow;

        if (isSell) {
            // update the sale amount
            uint256 newTotalTokenSellAmount = isLastSellWithInLimitDuration ? log.amount + amount : amount;
            log.amount = newTotalTokenSellAmount;
            log.window = maxTokenSaleLockWindow;
            log.locked = newTotalTokenSellAmount >= maxTokenSellSize;

            _tokenSellLog[from] = log;

            if (log.locked) return false;
        } else {
            if (log.locked && isLastSellWithInLimitDuration) return false;
        }

        return true;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) private returns (bool) {
        require(from != address(0), "ERC20: from zero address");
        require(to != address(0), "ERC20: to zero address");
        require(amount > 0, "ERC20: Zero transfer amount");

        uint256 currentRate = _getRate();
        bool isSell = isTnxSell(from, to);
        bool isBuy = _isPairAddress[from];

        // limit the token transfers
        if (!isExcludedFromSellLimit(from) && !isTokenTransferAllowed(from, amount, isSell)) {
            return false;
        }

        if (!_isExcludedFromHoldingLimit[to]) {
            enforceHoldingLimit(to, amount, currentRate);
        }

        if (!isSell) {
            syncTokenInOutOfSyncExchnagesSafe();
        }

        _tokenTransfer(from, to, amount, currentRate, isSell);

        if (isSell && !_isExcludedFromSellLimit[from]) {
            enforceSellLimitForReceivedTokens(from, currentRate);
        }

        if (!_isExcludedFromSellLimit[to]) {
            if (isBuy) {
                logBoughtTokensForSellLimit(to, amount);
            } else {
                logReceivedTokensForSellLimit(to, amount);
            }
        }

        _lastTokenReceivedTime[to] = block.timestamp;

        uint256 rate = currentRate;
        if (to == reflectionWallet) {
            //Community wallet was sent to, changing up reflection, so have to recalculate rate
            rate = _getRate();
        }

        ///@notice make call to darwinCommunity contract to see if votes are currently still valid
        darwinCommunity.checkIfVotesAreElegible(from, _balanceOf(from, rate));

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
        bool penaltyBurn = isSell && isPenaltyBurn(sender, amount, currentRate);

        bool senderExcludedFromReflection = _isExcludedFromReflection[sender];
        bool recipientExcludedFromReflection = _isExcludedFromReflection[recipient];

        if (senderExcludedFromReflection && !recipientExcludedFromReflection) {
            _transferFromExcluded(sender, recipient, amount, currentRate, penaltyBurn, isSell);
        } else if (!senderExcludedFromReflection && recipientExcludedFromReflection) {
            _transferToExcluded(sender, recipient, amount, currentRate, penaltyBurn, isSell);
        } else if (!senderExcludedFromReflection && !recipientExcludedFromReflection) {
            _transferStandard(sender, recipient, amount, currentRate, penaltyBurn, isSell);
        } else if (senderExcludedFromReflection && recipientExcludedFromReflection) {
            _transferBothExcluded(sender, recipient, amount, currentRate, penaltyBurn, isSell);
        } else {
            _transferStandard(sender, recipient, amount, currentRate, penaltyBurn, isSell);
        }
    }

    function _transferFromExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool penaltyBurn,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell, penaltyBurn);

        _tOwned[sender] -= tAmount;
        _rOwned[sender] -= values.rAmount;
        _rOwned[recipient] += values.rTransferAmount;

        performTokenomics(sender, recipient, values, isSell, penaltyBurn);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool penaltyBurn,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell, penaltyBurn);

        _rOwned[sender] -= values.rAmount;
        _tOwned[recipient] += values.tTransferAmount;
        _rOwned[recipient] += values.rTransferAmount;

        performTokenomics(sender, recipient, values, isSell, penaltyBurn);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool penaltyBurn,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell, penaltyBurn);

        _rOwned[sender] -= values.rAmount;
        _rOwned[recipient] += values.rTransferAmount;

        performTokenomics(sender, recipient, values, isSell, penaltyBurn);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferBothExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool penaltyBurn,
        bool isSell
    ) private {
        Values memory values = _getValues(recipient, tAmount, currentRate, isSell, penaltyBurn);

        _tOwned[sender] -= tAmount;
        _rOwned[sender] -= values.rAmount;
        _tOwned[recipient] += values.tTransferAmount;
        _rOwned[recipient] += values.rTransferAmount;

        performTokenomics(sender, recipient, values, isSell, penaltyBurn);

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function reflectTokens(uint256 tReflection, uint256 rReflection) private {
        _rTotal -= rReflection;
        tReflectionTotal += tReflection;

        emit TokenReflection(tReflection);
    }

    function burnTokens(
        address sender,
        uint256 tBurn,
        uint256 rBurn
    ) private {
        _rOwned[burnAddress] += rBurn;

        if (_isExcludedFromReflection[burnAddress]) {
            _tOwned[burnAddress] += tBurn;
        }

        tBurnTotal += tBurn;

        emit TokenBurned(tBurn);
        emit Transfer(sender, burnAddress, tBurn);
    }

    function takeCommunityTokens(
        address sender,
        uint256 tCommunity,
        uint256 rCommunity
    ) private {
        address communityWallet = address(darwinCommunity);
        _rOwned[communityWallet] += rCommunity;

        if (_isExcludedFromReflection[burnAddress]) {
            _tOwned[communityWallet] += tCommunity;
        }

        emit Transfer(sender, communityWallet, tCommunity);
    }

    function logExchangeTokens(
        address receiverExchange,
        uint256 tBurn,
        uint256 tCommunity,
        bool penaltyBurn
    ) private {
        bool isNewValue = _pairUnsyncAmount[receiverExchange] == 0;
        if (penaltyBurn) {
            _pairUnsyncAmount[receiverExchange] += tCommunity;
        } else {
            _pairUnsyncAmount[receiverExchange] += (tCommunity + tBurn);
        }

        if (isNewValue && _pairUnsyncAmount[receiverExchange] > 0) {
            outOfSyncPairs.push(receiverExchange);
        }
    }

    function performTokenomics(
        address sender,
        address recipient,
        Values memory values,
        bool isSell,
        bool penaltyBurn
    ) private {
        if (values.tReflection > 0) {
            reflectTokens(values.tReflection, values.rReflection);
        }
        if (values.tBurnAmount > 0) {
            burnTokens(sender, values.tBurnAmount, values.rBurnAmount);
        }
        if (values.tCommunity > 0) {
            takeCommunityTokens(sender, values.tCommunity, values.rCommunity);
        }
        if (isSell && values.tBurnAmount + values.tCommunity > 0) {
            logExchangeTokens(recipient, values.tBurnAmount, values.tCommunity, penaltyBurn);
        }
    }

    function isPenaltyBurn(
        address seller,
        uint256 amount,
        uint256 rate
    ) private view returns (bool) {
        uint256 limitFrameWindow = getBoughtTokenSellLimitWindow();
        TokenTnxLog memory log = _tokenBoughtLog[seller];
        if (log.window == limitFrameWindow) {
            uint256 balanceOfSeller = _balanceOf(seller, rate);

            // seller doesn't have tokens bought in
            // last TokenSellLimitWindow left after this sell
            return balanceOfSeller - amount < log.amount;
        }
        return false;
    }

    function _getValues(
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell,
        bool penaltyBurn
    ) private view returns (Values memory) {
        TValues memory tValues = _getTValues(recipient, tAmount, isSell, penaltyBurn);

        RValues memory rValues = _getRValues(tAmount, tValues, currentRate);

        return
            Values({
                tTransferAmount: tValues.tTransferAmount,
                tBurnAmount: tValues.tBurnAmount,
                tReflection: tValues.tReflection,
                tCommunity: tValues.tCommunity,
                rAmount: rValues.rAmount,
                rTransferAmount: rValues.rTransferAmount,
                rBurnAmount: rValues.rBurnAmount,
                rReflection: rValues.rReflection,
                rCommunity: rValues.rCommunity
            });
    }

    function _getTValues(
        address recipient,
        uint256 tAmount,
        bool isSell,
        bool penaltyBurn
    ) private view returns (TValues memory) {
        bool isReflectionTransfer = recipient == reflectionWallet;

        uint256 tReflection = 0;
        uint256 tCommunity = 0;
        uint256 tTransferAmount = 0;
        uint256 tBurnAmount = 0;

        if (isReflectionTransfer) {
            tReflection = tAmount;
        } else if (isSell) {
            tCommunity = calculateCommunityTokens(tAmount);
            (tTransferAmount, tBurnAmount) = calculateTransferAndBurnAmount(tAmount, tCommunity, penaltyBurn);
        } else {
            tTransferAmount = tAmount;
        }

        return
            TValues({
                tTransferAmount: tTransferAmount,
                tBurnAmount: tBurnAmount,
                tReflection: tReflection,
                tCommunity: tCommunity
            });
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
                rBurnAmount: tValues.tBurnAmount * currentRate,
                rReflection: tValues.tReflection * currentRate,
                rCommunity: tValues.tCommunity * currentRate
            });
    }

    function calculateTransferAndBurnAmount(
        uint256 tAmount,
        uint256 tCommunity,
        bool penaltyBurn
    ) private view returns (uint256, uint256) {
        uint256 tBurnAmount = (tAmount * (penaltyBurn ? penaltyBurnPercentage : burnPercentage)) / PERCENTAGE_100;
        uint256 tTransferAmount = tAmount - tBurnAmount - tCommunity;

        return (tTransferAmount, tBurnAmount);
    }

    function calculateReflectionAmount(address recepient, uint256 _amount) private view returns (uint256) {
        return recepient == reflectionWallet ? _amount : 0;
    }

    function calculateCommunityTokens(uint256 _amount) private view returns (uint256) {
        return (_amount * communityTokensPercentage) / PERCENTAGE_100;
    }

    function markNextSellAsLP() public {
        require(!_nextSellIsLP[msg.sender], "DARWIN::markNextSellAsLP: already marked");
        _nextSellIsLP[msg.sender] = true;
    }

    function unmarkNextSellAsLP() public {
        require(_nextSellIsLP[msg.sender], "DARWIN::unmarkNextSellAsLP: not marked");
        _nextSellIsLP[msg.sender] = false;
    }

    function isNextSellLP(address account) public view returns (bool) {
        return _nextSellIsLP[account];
    }

    function getLastTokenReceivedTimestamp(address account) public view override returns (uint256) {
        return _lastTokenReceivedTime[account];
    }

    function isExcludedFromReward(address account) public view override returns (bool) {
        return _isExcludedFromReflection[account];
    }

    function isExcludedFromTxLimit(address account) public view override returns (bool) {
        return _isExcludedFromSellLimit[account];
    }

    function isExcludedFromHoldingLimit(address account) public view override returns (bool) {
        return _isExcludedFromHoldingLimit[account];
    }
}
