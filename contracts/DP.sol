pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "./interface/IDP.sol";
import "./interface/IUniswapV2Factory.sol";
import "./interface/UniSwapRouter.sol";
import "./interface/IUniswapV2Pair.sol";

contract DP is IDP, OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;

    uint256 private constant MAX = ~uint256(0);
    uint256 private constant DEV_WALLET_PECENTAGE = 10;

    struct Values {
        uint256 tTransferAmount;
        uint256 tBurnAmount;
        uint256 tReflection;
        uint256 rAmount;
        uint256 rTransferAmount;
        uint256 rBurnAmount;
        uint256 rReflection;
    }

    string private _name;
    string private _symbol;
    uint256 private _decimals;
    uint256 private _tTotal;
    uint256 private _rTotal;

    mapping(address => uint256) private _tOwned;
    mapping(address => uint256) private _rOwned;

    mapping(address => bool) private _isExcludedFromReflection;
    address[] private _excludedFromReflection;

    mapping(address => bool) private _isExcludedFromHoldingLimit;
    mapping(address => bool) private _isExcludedFromSellLimit;
    mapping(address => bool) private _isExchangeAddress;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) private _nextSellIsLP;
    mapping(address => mapping(uint256 => uint256)) private _tokenReceivedInLastLimitPeriod;

    uint256 public reflectionPercentage;
    uint256 public burnPercentage;

    uint256 public sellLimitDuration;

    uint256 public tReflectionTotal;
    uint256 public tBurnTotal;

    address public burnAddress;

    IUniswapV2Router02 public uniswapV2Router;
    IUniswapV2Pair public uniswapV2Pair;

    function initialize(address uniswapV2RouterAddress, address _devWallet) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __dp_init_unchained(uniswapV2RouterAddress, _devWallet);
    }

    function __dp_init_unchained(address uniswapV2RouterAddress, address _devWallet) private initializer {
        _name = "Dimond Paper";
        _symbol = "DiP";
        _decimals = 9;

        _tTotal = 100 * 10**9 * 10**_decimals; // 100B
        _rTotal = (MAX - (MAX % _tTotal));

        reflectionPercentage = 5;
        burnPercentage = 90;

        sellLimitDuration = 24 hours;

        // transfer tokens to owner
        _rOwned[_devWallet] = (_rTotal / 100) * DEV_WALLET_PECENTAGE;
        _rOwned[_msgSender()] = _rTotal - _rOwned[_devWallet];

        uniswapV2Router = IUniswapV2Router02(uniswapV2RouterAddress);

        burnAddress = 0x000000000000000000000000000000000000dEaD;

        // Create a uniswap pair for this new token
        uniswapV2Pair = IUniswapV2Pair(IUniswapV2Factory(uniswapV2Router.factory()).createPair(address(this), uniswapV2Router.WETH()));

        // exclude wallets from holding limit
        _isExcludedFromHoldingLimit[_msgSender()] = true;

        // exclude wallets from sell limit
        _isExcludedFromSellLimit[_msgSender()] = true;

        // add exchange wallets
        addExchangeAddress(address(uniswapV2Pair));

        //exclude burn wallet from reflection
        excludeFromReflectionSafe(burnAddress);

        emit Transfer(address(0), _msgSender(), (_tTotal * DEV_WALLET_PECENTAGE) / 100);
        emit Transfer(address(0), _devWallet, _tTotal - (_tTotal * DEV_WALLET_PECENTAGE) / 100);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint256) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: allowance below zero"));
        return true;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balanceOf(account, _getRate());
    }

    function _balanceOf(address account, uint256 rate) private view returns (uint256) {
        if (_isExcludedFromReflection[account]) return _tOwned[account];
        return tokenFromReflection(_rOwned[account], rate);
    }

    function tokenFromReflection(uint256 rAmount, uint256 rate) public view returns (uint256) {
        require(rAmount <= _rTotal, "DP: Amount must be less than total reflections");
        return rAmount.div(rate);
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
        for (uint256 i = 0; i < _excludedFromReflection.length; i++) {
            if (_rOwned[_excludedFromReflection[i]] > rSupply || _tOwned[_excludedFromReflection[i]] > tSupply) return (_rTotal, _tTotal);
            rSupply = rSupply.sub(_rOwned[_excludedFromReflection[i]]);
            tSupply = tSupply.sub(_tOwned[_excludedFromReflection[i]]);
        }
        if (rSupply < _rTotal.div(_tTotal)) return (_rTotal, _tTotal);
        return (rSupply, tSupply);
    }

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply.div(tSupply);
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
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: exceeds allowance"));
        return true;
    }

    function isExchangeAddress(address account) public view returns (bool) {
        return _isExchangeAddress[account];
    }

    function excludeFromReflectionSafe(address account) public {
        if (!_isExcludedFromReflection[account]) {
            if (_rOwned[account] > 0) {
                _tOwned[account] = tokenFromReflection(_rOwned[account], _getRate());
            }
            _isExcludedFromReflection[account] = true;
            _excludedFromReflection.push(account);
        }
    }

    function includeInReflectionSafe(address account) public {
        if (_isExcludedFromReflection[account]) {
            for (uint256 i = 0; i < _excludedFromReflection.length; i++) {
                if (_excludedFromReflection[i] == account) {
                    _excludedFromReflection[i] = _excludedFromReflection[_excludedFromReflection.length - 1];
                    _tOwned[account] = 0;
                    _isExcludedFromReflection[account] = false;
                    _excludedFromReflection.pop();
                    break;
                }
            }
        }
    }

    function excludeFromSellLimit(address account) public {
        require(!_isExcludedFromSellLimit[account], "DiP::excludeFromSellLimit: already excluded");
        _isExcludedFromSellLimit[account] = true;
    }

    function includeInSellLimit(address account) private {
        require(_isExcludedFromSellLimit[account], "DiP::includeInSellLimit: already included");
        _isExcludedFromSellLimit[account] = false;
    }

    function addExchangeAddress(address account) public {
        require(!_isExchangeAddress[account], "DiP::addExchangeAddress: already an exchange");

        _isExchangeAddress[account] = true;
        _isExcludedFromHoldingLimit[account] = true;
        _isExcludedFromSellLimit[account] = true;

        excludeFromReflectionSafe(account);

        emit ExchangeAdded(account);
    }

    function removeExchangeAddress(address account) public {
        require(_isExchangeAddress[account], "DiP::removeExchangeAddress: not an exchange");

        _isExchangeAddress[account] = false;
        _isExcludedFromHoldingLimit[account] = false;
        _isExcludedFromSellLimit[account] = false;

        includeInReflectionSafe(account);

        emit ExchangedRemoved(account);
    }

    function isTnxSell(address from, address to) private returns (bool) {
        if (_isExchangeAddress[to]) {
            if (_nextSellIsLP[from]) {
                _nextSellIsLP[from] = false;
                return false;
            }
            return true;
        }
        return _isExchangeAddress[to];
    }

    function enforceSellLimit(address from, uint256 rate) private view {
        uint256 limitFrame = calculateSellLimitFrame();
        uint256 tokenReceivedInLastLimitPeriod = _tokenReceivedInLastLimitPeriod[from][limitFrame];
        uint256 balance = _balanceOf(from, rate);
        require(balance >= tokenReceivedInLastLimitPeriod, "DiP::enforceSellLimit: sell not allowed");
    }

    function calculateSellLimitFrame() private view returns (uint256){
        return block.timestamp / sellLimitDuration;
    }

    function logReceivedTokens(address to, uint256 amount) private {
        uint256 limitFrame = calculateSellLimitFrame();
        _tokenReceivedInLastLimitPeriod[to][limitFrame] += amount;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) private returns (bool) {
        require(from != address(0), "ERC20: from zero address");
        require(to != address(0), "ERC20: to zero address");
        require(amount > 0, "ERC20: Zero transfer amount");

        bool isSell = isTnxSell(from, to);

        uint256 currentRate = _getRate();

        _tokenTransfer(from, to, amount, currentRate, isSell);

        if (isSell && !_isExcludedFromSellLimit[from]) {
            enforceSellLimit(from, currentRate);
        }

        if (!_isExcludedFromSellLimit[to]) {
            logReceivedTokens(to, currentRate);
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
        if (_isExcludedFromReflection[sender] && !_isExcludedFromReflection[recipient]) {
            _transferFromExcluded(sender, recipient, amount, currentRate, isSell);
        } else if (!_isExcludedFromReflection[sender] && _isExcludedFromReflection[recipient]) {
            _transferToExcluded(sender, recipient, amount, currentRate, isSell);
        } else if (!_isExcludedFromReflection[sender] && !_isExcludedFromReflection[recipient]) {
            _transferStandard(sender, recipient, amount, currentRate, isSell);
        } else if (_isExcludedFromReflection[sender] && _isExcludedFromReflection[recipient]) {
            _transferBothExcluded(sender, recipient, amount, currentRate, isSell);
        } else {
            _transferStandard(sender, recipient, amount, currentRate, isSell);
        }
    }

    function reflectTokens(uint256 tReflection, uint256 rReflection) private {
        _rTotal = _rTotal.sub(rReflection);
        tReflectionTotal = tReflectionTotal.add(tReflection);

        emit TokenReflection(tReflection);
    }

    function burnTokens(uint256 tBurn, uint256 rBurn) private {
        _rOwned[burnAddress] = _rOwned[burnAddress].add(rBurn);

        if (_isExcludedFromReflection[burnAddress]) _tOwned[burnAddress] = _tOwned[burnAddress].add(tBurn);

        tBurnTotal = tBurnTotal.add(tBurn);

        emit TokenBurned(tBurn);
    }

    function _transferFromExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(tAmount, currentRate, isSell);

        _tOwned[sender] = _tOwned[sender].sub(tAmount);
        _rOwned[sender] = _rOwned[sender].sub(values.rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(values.rTransferAmount);

        if (isSell) {
            reflectTokens(values.tReflection, values.rReflection);
            burnTokens(values.tBurnAmount, values.rBurnAmount);
        }

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(tAmount, currentRate, isSell);

        _rOwned[sender] = _rOwned[sender].sub(values.rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(values.tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(values.rTransferAmount);

        if (isSell) {
            reflectTokens(values.tReflection, values.rReflection);
            burnTokens(values.tBurnAmount, values.rBurnAmount);
        }

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(tAmount, currentRate, isSell);

        _rOwned[sender] = _rOwned[sender].sub(values.rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(values.rTransferAmount);

        if (isSell) {
            reflectTokens(values.tReflection, values.rReflection);
            burnTokens(values.tBurnAmount, values.rBurnAmount);
        }

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _transferBothExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private {
        Values memory values = _getValues(tAmount, currentRate, isSell);

        _tOwned[sender] = _tOwned[sender].sub(tAmount);
        _rOwned[sender] = _rOwned[sender].sub(values.rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(values.tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(values.rTransferAmount);

        if (isSell) {
            reflectTokens(values.tReflection, values.rReflection);
            burnTokens(values.tBurnAmount, values.rBurnAmount);
        }

        emit Transfer(sender, recipient, values.tTransferAmount);
    }

    function _getValues(
        uint256 tAmount,
        uint256 currentRate,
        bool isSell
    ) private view returns (Values memory) {
        (uint256 tTransferAmount, uint256 tBurnAmount, uint256 tReflection) = _getTValues(tAmount, isSell);

        (uint256 rAmount, uint256 rTransferAmount, uint256 rBurnAmount, uint256 rReflection) = _getRValues(
            tAmount,
            tTransferAmount,
            tBurnAmount,
            tReflection,
            currentRate
        );

        return
            Values({
                tTransferAmount: tTransferAmount,
                tBurnAmount: tBurnAmount,
                tReflection: tReflection,
                rAmount: rAmount,
                rTransferAmount: rTransferAmount,
                rBurnAmount: rBurnAmount,
                rReflection: rReflection
            });
    }

    function _getTValues(uint256 tAmount, bool isSell)
        private
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 tReflection = isSell ? calculateReflectionAmount(tAmount) : 0;
        (uint256 tTransferAmount, uint256 tBurnAmount) = isSell ? calculateTransferAndBurnAmount(tAmount) : (tAmount, 0);
        return (tTransferAmount, tBurnAmount, tReflection);
    }

    function _getRValues(
        uint256 tAmount,
        uint256 tTransferAmount,
        uint256 tBurnAmount,
        uint256 tReflection,
        uint256 currentRate
    )
        private
        pure
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        uint256 rAmount = tAmount.mul(currentRate);
        uint256 rTransferAmount = tTransferAmount.mul(currentRate);
        uint256 rBurnAmount = tBurnAmount.mul(currentRate);
        uint256 rReflection = tReflection.mul(currentRate);

        return (rAmount, rTransferAmount, rBurnAmount, rReflection);
    }

    function markNextSellAsLP() public {
        require(!_nextSellIsLP[msg.sender], "NC::markNextSellAsLP: already marked");
        _nextSellIsLP[msg.sender] = true;
    }

    function unmarkNextSellAsLP() public {
        require(_nextSellIsLP[msg.sender], "NC::unmarkNextSellAsLP: not already marked");
        _nextSellIsLP[msg.sender] = false;
    }

    function isNextSellLP() public view returns (bool) {
        return _nextSellIsLP[msg.sender];
    }

    function calculateTransferAndBurnAmount(uint256 tAmount) private view returns (uint256, uint256) {
        uint256 tBurnAmount = (tAmount * burnPercentage) / 100;
        uint256 tTransferAmount = tAmount - tBurnAmount;

        return (tTransferAmount, tBurnAmount);
    }

    function calculateReflectionAmount(uint256 _amount) private view returns (uint256) {
        return _amount * reflectionPercentage / 100;
    }
}
