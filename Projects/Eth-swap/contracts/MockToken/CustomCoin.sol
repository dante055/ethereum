// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomCoin is ERC20 {
    // ERC20 :   constructor (string memory name, string memory symbol)
    // decimal of ERC20 is 18
    address public admin;

    constructor() ERC20("CustomCoin Coin", "CC") {
        admin = msg.sender;
    }

    // mine tokens and transfer to this address
    function faucet(address to, uint256 amount) external {
        require(msg.sender == admin, "Only admin can mine the token!");
        _mint(to, amount);
    }
}
