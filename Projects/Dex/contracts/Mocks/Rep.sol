// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Rep is ERC20 {
    constructor() public ERC20("Augar token", "REP") {}

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
