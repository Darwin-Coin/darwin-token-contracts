pragma solidity ^0.8.14;

// SPDX-License-Identifier: MIT

contract TestRouter {
    uint private helper;

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity) {
        helper++;
    }

    receive() external payable {}
}