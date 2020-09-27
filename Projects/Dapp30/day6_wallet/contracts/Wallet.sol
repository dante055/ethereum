// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Wallet {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    event Deposite(address indexed from, uint256 amount);

    receive() external payable {
        emit Deposite(msg.sender, msg.value);
    }

    function transfer(address payable _to, uint256 _amount) external {
        require(msg.sender == owner, "Caller is not owner");
        require(
            address(this).balance >= _amount,
            "Not enough funds to transfer"
        );
        _to.transfer(_amount);
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }
}
