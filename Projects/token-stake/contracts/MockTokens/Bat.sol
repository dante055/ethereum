// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bat is ERC20 {
    address public admin;

    constructor() public ERC20("Brave Browser token", "BAT") {
    	admin = msg.sender;
    }

    // mine tokens and transfer to this address
    function faucet(address to, uint256 amount) external {
        require(msg.sender == admin, "Only admin can mine the token!");
        _mint(to, amount);
    }
}
