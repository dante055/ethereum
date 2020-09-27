// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract Deed {
    address public owner;
    address public lawyer;
    address payable public beneficiary;
    uint256 public earliestTransferDate;

    constructor(
        address _lawyer,
        address payable _beneficiary,
        uint256 _earliestTransferDate
    ) public payable {
        owner = msg.sender;
        lawyer = _lawyer;
        beneficiary = _beneficiary;
        earliestTransferDate = _earliestTransferDate;
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function transfer() external payable {
        require(msg.sender == lawyer, "caller is not lawyer");
        require(now >= earliestTransferDate, "too early to transfer");
        beneficiary.transfer(address(this).balance);
    }
}
