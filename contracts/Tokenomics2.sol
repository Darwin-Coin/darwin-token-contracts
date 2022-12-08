pragma solidity 0.8.14;

//TODO: add proper license
// SPDX-License-Identifier: Unlicensed

import "./Openzeppelin/ERC20Upgradeable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "./interface/ITokenomics2.sol";

contract Tokenomics2 is ITokenomics, ERC20Upgradeable {

    uint256 public poolTaxPercentageOnSell;
    uint256 public poolTaxPercentageOnBuy;

    // darwin pair values
    mapping(address => bool) internal _isPairAddress;
    mapping(address => uint) private _pairUnsyncAmount;
    mapping(address => address) private _pairToRouter;
    //TODO: is this necessary
    mapping(address => bool) private _isExchangeRouterAddress;
    address[] private _outOfSyncPairs;

    address public redeemingWallet;

    uint private _amountToTax;

    function syncTokens() public {
        address[] memory outOfSync = _outOfSyncPairs;

        for (uint256 i = 0; i < outOfSync.length; ) {
            address unSyncedPair = outOfSync[i];

            uint256 amount = _pairUnsyncAmount[unSyncedPair];

            _pairUnsyncAmount[unSyncedPair] = 0;

            _setBalances(unSyncedPair, redeemingWallet, amount);

            (bool success, ) = unSyncedPair.call(abi.encodeWithSignature("sync()"));
            if (!success) {
                // undo changes
                _pairUnsyncAmount[unSyncedPair] = amount;

                //TODO: i don't like this, emits an event to set and undo
                _setBalances(redeemingWallet, unSyncedPair, amount);
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

    function __tokenomics2_init_unchained(address _redeemingWallet, uint _poolTaxPercentageOnSell, uint _poolTaxPercentageOnBuy) internal onlyInitializing {
        redeemingWallet = _redeemingWallet;
        poolTaxPercentageOnSell = _poolTaxPercentageOnSell;  
        poolTaxPercentageOnBuy =  _poolTaxPercentageOnBuy;
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

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        bool isBuy = _isPairAddress[from];
        if(!isBuy) {
            // this is not a buy so sync tokens
            syncTokens();
        }
        if(_isPairAddress[to]) {
            // this is a sell, so we tax the pool base on sell percent
            _taxFromPool(to, amount, true);
        } else if(isBuy) {
            // tax on buy based on pairs desync amount
            _amountToTax = _getAmountToTaxBasedOnDesync(amount, from);
            // this is a buy, so we tax the pool base on buy percent
            _taxFromPool(to, amount, false);
        }
        super._beforeTokenTransfer(from, to, amount);
    }
 
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override  {
        super._afterTokenTransfer(from, to, amount);
        if(_amountToTax > 0) {
            _setBalances(from, redeemingWallet, _amountToTax);
            delete _amountToTax;
        }
    }

    function _taxFromPool(address pair, uint amount, bool isSell) internal {

        // get the pool tax based on the direction of the swap
        uint taxPercent = isSell ? poolTaxPercentageOnSell : poolTaxPercentageOnBuy;
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

    function _getAmountToTaxBasedOnDesync(uint256 amount, address poolAddress) internal view returns (uint256 syncTax) {

        uint unsyncAmount = _pairUnsyncAmount[poolAddress];

        if(unsyncAmount == 0) return syncTax;

        IUniswapV2Pair pair = IUniswapV2Pair(poolAddress);

        (uint256 thisReserve, uint256 otherReserve, ) = pair.getReserves();

        (thisReserve, otherReserve) = pair.token0() == address(this) ? (thisReserve, otherReserve) : (otherReserve, thisReserve);

        //TODO: can this underflow?
        uint256 thisReserveAfterSync = thisReserve - unsyncAmount;

        uint amountOtherTokenIn = _getAmountIn(amount, thisReserve, otherReserve);

        
        uint amountDarwinOutIfSynced = _getAmountOut(amountOtherTokenIn, otherReserve, thisReserveAfterSync);
       
        // uint256 syncAmountOut = _getAmountOut(amount, thisReserveAfterSync, otherReserve);

        // uint amountIn = _getAmountIn(syncAmountOut, thisReserve, otherReserve);

        if(amountDarwinOutIfSynced < amount) {
            syncTax = amount - amountDarwinOutIfSynced;
        }
        
    }

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

}