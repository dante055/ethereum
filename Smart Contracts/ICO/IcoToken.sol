// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

/* 
pragma solidity ^0.6.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
 */

import "./ERC20/ERC20.sol";

contract IcoToken is ERC20 {

    constructor(uint256 amount) ERC20("ICO Token", "ICOT") {
        _mint(msg.sender, amount);
    }
}
