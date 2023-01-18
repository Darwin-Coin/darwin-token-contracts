pragma solidity 0.8.14;

//TODO: add proper license
// SPDX-License-Identifier: UNLICENSED

import "./Openzeppelin/ERC20Upgradeable.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "./interface/ITokenomics2.sol";

contract Tokenomics2 is ITokenomics, ERC20Upgradeable {

    uint256 public userTaxPercentageOnSell;
    uint256 public poolTaxPercentageOnBuy;

    // darwin pair values
    mapping(address => bool) internal _isPairAddress;
    mapping(address => uint) private _pairUnsyncAmount;
    mapping(address => address) private _pairToRouter;
    //TODO: is this necessary
    mapping(address => bool) private _isExchangeRouterAddress;
    address[] private _outOfSyncPairs;

    mapping(address => bool) private _isWhitelistedSellTax;
    mapping(address => bool) private _isWhitelistedBuyTax;

    address public tokenomics1Wallet;
    address public tokenomics2Wallet;

    bool public smartSync;

    function syncTokens() public {
        address[] memory outOfSync = _outOfSyncPairs;

        for (uint256 i = 0; i < outOfSync.length; ) {
            address unSyncedPair = outOfSync[i];

            uint256 amount = _pairUnsyncAmount[unSyncedPair];

            _pairUnsyncAmount[unSyncedPair] = 0;

            _setBalances(unSyncedPair, tokenomics2Wallet, amount);

            (bool success, ) = unSyncedPair.call(abi.encodeWithSignature("sync()"));
            if (!success) {
                // undo changes
                _pairUnsyncAmount[unSyncedPair] = amount;

                //TODO: i don't like this, emits an event to set and undo
                _setBalances(tokenomics2Wallet, unSyncedPair, amount);
            } else {
                _outOfSyncPairs[i] = outOfSync[outOfSync.length - 1];
                _outOfSyncPairs.pop();
                outOfSync = _outOfSyncPairs;
                continue;
            }
            unchecked {
                ++i;
            }
        }
    }

    function syncTokensSinglePair(address pair) public {
        uint256 amount = _pairUnsyncAmount[pair];
        if (amount == 0) return;

        _pairUnsyncAmount[pair] = 0;

        _setBalances(pair, tokenomics2Wallet, amount);

        (bool success, ) = pair.call(abi.encodeWithSignature("sync()"));
        if (!success) {
            // undo changes
            _pairUnsyncAmount[pair] = amount;

            //TODO: i don't like this, emits an event to set and undo
            _setBalances(tokenomics2Wallet, pair, amount);
        } else {
            for (uint i = 0; i < _outOfSyncPairs.length; i++) {
                if (_outOfSyncPairs[i] == pair) {
                    _outOfSyncPairs[i] = _outOfSyncPairs[_outOfSyncPairs.length - 1];
                    _outOfSyncPairs.pop();
                    break;
                }
            }
        }
    }

    function __tokenomics2_init_unchained(address _tokenomics1Wallet, address _tokenomics2Wallet, address _presaleContractAddress, address uniswapV2RouterAddress, uint _userTaxPercentageOnSell, uint _poolTaxPercentageOnBuy) internal onlyInitializing {
        tokenomics1Wallet = _tokenomics1Wallet;
        tokenomics2Wallet = _tokenomics2Wallet;
        userTaxPercentageOnSell = _userTaxPercentageOnSell;
        poolTaxPercentageOnBuy =  _poolTaxPercentageOnBuy;

        _isWhitelistedBuyTax[uniswapV2RouterAddress] = true;
        _isWhitelistedSellTax[_presaleContractAddress] = true;
    }

    function _registerPair(address routerAddress, address pairAddress) internal virtual {
        if (_isPairAddress[pairAddress] && _isExchangeRouterAddress[routerAddress]) {
            revert PairAlreadyRegistered();
        }
        _isPairAddress[pairAddress] = true;
        //TODO: check to see if this router mapping is required
        _isExchangeRouterAddress[routerAddress] = true;
        _pairToRouter[pairAddress] = routerAddress;
        emit ExchangeAdded(pairAddress);
    }

    function _unRegisterPair(address routerAddress, address pairAddress) internal virtual {
        if (!_isPairAddress[pairAddress] && !_isExchangeRouterAddress[routerAddress]) {
            revert PairNotRegistered();
        }
        delete _isPairAddress[pairAddress];
        //TODO: check to see if this router mapping is required
        delete  _isExchangeRouterAddress[routerAddress];
        delete _pairToRouter[pairAddress];
        emit ExchangedRemoved(pairAddress);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override returns(uint) {
        bool isBuy = _isPairAddress[from];
        if(!smartSync && !isBuy) {
            // smartSync is disabled and this is not a buy, so sync tokens on all pairs
            syncTokens();
        } else if (smartSync && _isPairAddress[to]) {
            // smartSync is enabled and this is a sell, so sync tokens only on the interested pair
            syncTokensSinglePair(to);
        }
        if(_isPairAddress[to] && !_isWhitelistedSellTax[from]) {
            // this is a sell, so we tax the user based on sell percent
            amount = _taxFromUser(from, amount);
        } else if(isBuy && !_isWhitelistedBuyTax[to]) {
            // this is a buy, so we tax the pool based on buy percent
            _taxFromPool(from, amount, false);
        }
        super._beforeTokenTransfer(from, to, amount);
        return amount;
    }
 
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override  {

        //TODO: figure out if we call super before or after this
        super._afterTokenTransfer(from, to, amount);
        /* if(_isPairAddress[from]) {
            // tax on buy based on pairs desync amount
            uint amountToTax = _getAmountToTaxBasedOnDesync(amount, from);
            if(amountToTax > 0) {
                _setBalances(to, tokenomics1Wallet, amountToTax);
            }
        } */
    }

    function _taxFromPool(address pair, uint amount, bool isSell) internal {

        // get the pool tax based on the direction of the swap
        uint taxPercent = isSell ? userTaxPercentageOnSell : poolTaxPercentageOnBuy;
        // no tax, return
        if(taxPercent == 0) return;

        uint amountPoolToTax = (amount * taxPercent) / 100;
        uint currentUnsyncAmount = _pairUnsyncAmount[pair];
        if(currentUnsyncAmount == 0) {
            //desynced
            _outOfSyncPairs.push(pair);
        }
        // update the amount that will be remove form the pool on the next sync
        _pairUnsyncAmount[pair] = currentUnsyncAmount + amountPoolToTax;
    }

    function _taxFromUser(address user, uint amount) internal returns(uint) {

        uint sellPercentageOfAmount = (amount / 100) * userTaxPercentageOnSell;
        _setBalances(user, tokenomics1Wallet, sellPercentageOfAmount);

        return amount - sellPercentageOfAmount;
    }

    /*
    function _getAmountToTaxBasedOnDesync(uint256 amount, address poolAddress) internal view returns (uint256 syncTax) {

        uint unsyncAmount = _pairUnsyncAmount[poolAddress];

        if(unsyncAmount == 0) return syncTax;

        IUniswapV2Pair pair = IUniswapV2Pair(poolAddress);

        (uint256 thisReserve, uint256 otherReserve, ) = pair.getReserves();

        (thisReserve, otherReserve) = pair.token0() == address(this) ? (thisReserve, otherReserve) : (otherReserve, thisReserve);

        uint256 thisReserveAfterSync = thisReserve - unsyncAmount;

        uint amountOtherTokenIn = _getAmountIn(amount, thisReserve, otherReserve);

        uint amountDarwinOutIfSynced = _getAmountOut(amountOtherTokenIn, otherReserve, thisReserveAfterSync);
       
        // uint256 syncAmountOut = _getAmountOut(amount, thisReserveAfterSync, otherReserve);

        // uint amountIn = _getAmountIn(syncAmountOut, thisReserve, otherReserve);

        if(amountDarwinOutIfSynced < amount) {
            syncTax = amount - amountDarwinOutIfSynced;
        }
        
    }
    */

    function _getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountIn) {
        uint256 numerator = reserveIn * amountOut;
        uint256 denominator = (reserveOut - amountOut) + 1;
        amountIn = (numerator / denominator);
    }

    function _getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns(uint amountOut) {
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;
    }

    function _setBuyWhitelist(address user_, bool whitelist_) internal {
        _isWhitelistedBuyTax[user_] = whitelist_;
    }

    function _setSellWhitelist(address user_, bool whitelist_) internal {
        _isWhitelistedSellTax[user_] = whitelist_;
    }

    function _setTokenomics1Wallet(address tokenomics1_) internal {
        tokenomics1Wallet = tokenomics1_;
    }

    function _setTokenomics2Wallet(address tokenomics2_) internal {
        tokenomics2Wallet = tokenomics2_;
    }

    function _setPoolTaxBuy(uint256 tax_) internal {
        poolTaxPercentageOnBuy = tax_;
    }

    function _setUserTaxSell(uint256 tax_) internal {
        userTaxPercentageOnSell = tax_;
    }

}