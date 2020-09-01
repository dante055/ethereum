// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ERC20Detailed :
// has Optional functions from the ERC20 standard.
// ERC20Detailed is now been depricated and the optional functions are now added in ERC20 contract

contract Dai is ERC20 {
    // ERC20 :   constructor (string memory name, string memory symbol)
    // decimal of ERC20 is 18

    constructor() public ERC20("Dai Stablecoin", "DAI") {}

    // mine tokens and transfer to this address
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
