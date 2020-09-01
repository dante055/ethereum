/* 
    for create multiple erc20 contract use one contract
    -> remember to keep track of the address of the deployed tokens
    
    -> its better to deploy seprate contract for each token
 */

/*
    --> erc-20 token:
        - name, symbol, decimal
        - events: Transfer, Approve
        - function: transfer, approve and transferFrom
        - mapping: balaceOf,allowance
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    // ERC20 :   constructor (string memory name, string memory symbol)
    // decimal of ERC20 is 18

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _amount
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _amount);
    }
}
