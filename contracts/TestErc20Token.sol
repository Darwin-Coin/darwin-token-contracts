pragma solidity 0.8.14;

// SPDX-License-Identifier: Unlicensed

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestErc20Token is ERC20 {
    constructor() ERC20("Darwin Drop Test Token", "DDTT") {
        //_mint(msg.sender, 1e10 * (10 ** decimals()));
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function mint(uint amount) external {
        _mint(msg.sender, amount);
    }
}
