// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract DeedFactory {
    address public owner;
    address[] private deployedDeeds;

    constructor() public {
        owner = msg.sender;
    }

    function createDeed(
        address _lawyer,
        address payable _beneficiary,
        uint256 _earliestTransferDate
    ) external payable {
        Deed newDeed = new Deed(
            _lawyer,
            _beneficiary,
            _earliestTransferDate,
            msg.sender
        );
        deployedDeeds.push(address(newDeed));
        payable(address(newDeed)).transfer(address(this).balance);
    }

    function getDeployedDeeds() external view returns (address[] memory) {
        return deployedDeeds;
    }
}

contract Deed {
    address public deedOwner;
    address public lawyer;
    address payable public beneficiary;
    uint256 public earliestTransferDate;

    receive() external payable {}

    constructor(
        address _lawyer,
        address payable _beneficiary,
        uint256 _earliestTransferDate,
        address _deedOwner
    ) public {
        deedOwner = _deedOwner;
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
