pragma solidity ^0.8.14;

//SPDX-License-Identifier: MIT

import {IBlueDarwin} from "./interface/IBlueDarwin.sol";

contract BlueDarwin is IBlueDarwin {
    string public name;
    string public symbol;
    uint8 public decimals;

    address public immutable dev;
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    mapping(address => bool) private _notTaxed;

    constructor(address[] memory taxWhitelist) {
        name = "Blue Darwin";
        symbol = "BLUE";
        decimals = 18;
        dev = msg.sender;
        _mint(msg.sender, 100_000_000 ether);
        for (uint8 i = 0; i < taxWhitelist.length; i++) {
            _notTaxed[taxWhitelist[i]] = true;
        }
    }

    function approve(address spender, uint amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint).max) {
            allowance[from][msg.sender] = allowance[from][msg.sender] - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function burn(uint amount) external {
        _burn(msg.sender, amount);
    }

    function whitelist(address toWhitelist, bool value) external {
        require(msg.sender == dev, "BlueDarwin: caller not owner");
        _notTaxed[toWhitelist] = value;
    }

    function _mint(address to, uint amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint amount) internal {
        require(amount <= balanceOf[from], "BlueDarwin: burn exceeds balance");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function _transfer(
        address from,
        address to,
        uint amount
    ) internal {
        require(from != address(0), "BlueDarwin: transfer from the zero address");
        require(to != address(0), "BlueDarwin: transfer to the zero address");

        uint tax;
        if (!_notTaxed[from] && !_notTaxed[to]) {
            tax = amount / 50; // 2% tax-on-transfer if not being handled by DarwinSwap
        }

        require(balanceOf[from] >= amount, "BlueDarwin: transfer amount exceeds balance");
        unchecked {
            balanceOf[from] -= amount;
            balanceOf[to] += (amount - tax);
            totalSupply -= tax;
        }

        emit Transfer(from, to, amount - tax);
        if (tax > 0) {
            emit Transfer(from, address(0), tax);
        }
    }

    function _approve(
        address owner,
        address spender,
        uint amount
    ) internal {
        require(owner != address(0), "BlueDarwin: approve from the zero address");
        require(spender != address(0), "BlueDarwin: approve to the zero address");

        allowance[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}