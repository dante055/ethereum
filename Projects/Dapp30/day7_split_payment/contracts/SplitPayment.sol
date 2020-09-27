// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract SplitPayment {
    address public owner;
    event Deposite(address indexed _from, uint256 _amount);
    event Transfer(address indexed _to, uint256 _amount);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    receive() external payable {
        emit Deposite(msg.sender, msg.value);
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function transfer(
        address payable[] calldata _to,
        uint256[] calldata _amount
    ) external onlyOwner() {
        require(
            _to.length == _amount.length,
            "To and amount array must have same length"
        );

        uint256 _totalAmount;
        for (uint256 i = 0; i < _amount.length; i++) {
            _totalAmount += _amount[i];
        }
        require(
            _totalAmount <= address(this).balance,
            "Not enough funds to process each transaction"
        );

        for (uint256 i = 0; i < _to.length; i++) {
            _to[i].transfer(_amount[i]);
            emit Transfer(_to[i], _amount[i]);
        }
    }
}
