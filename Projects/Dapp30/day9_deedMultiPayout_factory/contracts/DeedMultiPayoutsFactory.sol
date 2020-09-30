// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract DeedMultiPayoutsFactory {
    address public deedFactoryOwner;
    address[] private deployedDeeds;

    constructor() public {
        deedFactoryOwner = msg.sender;
    }

    function createNewDeed(
        address _lawyer,
        address payable _beneficiary,
        uint256 _earliestTransferTime,
        uint256 _totalPayouts,
        uint256 _interval
    ) external payable {
        require(_interval > 0, "interval cant be 0");
        require(_totalPayouts > 0, "should have atleast 1 payout");
        require(
            msg.value % _totalPayouts == 0,
            "cant divide amount in equal payout amount"
        );
        uint256 _payoutAmount = msg.value / _totalPayouts;
        DeedMultiPayouts newDeed = new DeedMultiPayouts(
            _lawyer,
            _beneficiary,
            _earliestTransferTime,
            _totalPayouts,
            _interval,
            _payoutAmount,
            msg.sender
        );
        deployedDeeds.push(address(newDeed));
        payable(newDeed).transfer(address(this).balance);
    }

    function getAllDeployedDeeds() external view returns (address[] memory) {
        return deployedDeeds;
    }
}

contract DeedMultiPayouts {
    address public deedOwner;
    address public lawyer;
    address payable public beneficiary;
    uint256 public earliestTransferTime;
    uint256 public totalPayouts;
    uint256 public paidPayouts;
    uint256 public interval;
    uint256 public payoutAmount;

    receive() external payable {}

    constructor(
        address _lawyer,
        address payable _beneficiary,
        uint256 _earliesTransferTime,
        uint256 _totalPayouts,
        uint256 _interval,
        uint256 _payoutAmount,
        address _deedOwner
    ) public {
        deedOwner = _deedOwner;
        lawyer = _lawyer;
        beneficiary = _beneficiary;
        earliestTransferTime = _earliesTransferTime;
        totalPayouts = _totalPayouts;
        interval = _interval;
        payoutAmount = _payoutAmount;
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function transfer() external payable {
        require(msg.sender == lawyer, "caller is not lawyer");
        require(now >= earliestTransferTime, "too early to transfer");
        require(paidPayouts < totalPayouts, "no payout left");
        uint256 eligiblePayouts = now - earliestTransferTime == 0
            ? 1
            : (now - earliestTransferTime) / interval;
        uint256 duePayouts = eligiblePayouts - paidPayouts;

        duePayouts = duePayouts + paidPayouts > totalPayouts
            ? totalPayouts - paidPayouts
            : duePayouts;
        paidPayouts += duePayouts;

        if (duePayouts > 0) beneficiary.transfer(duePayouts * payoutAmount);
    }
}
