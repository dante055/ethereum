// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract DeedMultiPayouts {
    address public owner;
    address public lawyer;
    address payable public beneficiary;
    uint256 public earliestTransferTime;
    uint256 public payouts;
    uint256 public interval;
    uint256 public amount;
    uint256 public paidPayouts;

    constructor(
        address _lawyer,
        address payable _beneficiary,
        uint256 _earliestTransferTime,
        uint256 _payouts,
        uint256 _interval
    ) public payable {
        require(
            msg.value % _payouts == 0,
            "the amount sent cnt be transfered equally in the given intervals"
        );
        require(_interval > 0, "interval cant to 0");
        require(_payouts > 0, "payouts cant to 0");
        owner = msg.sender;
        lawyer = _lawyer;
        beneficiary = _beneficiary;
        earliestTransferTime = _earliestTransferTime;
        payouts = _payouts;
        interval = _interval;
        amount = msg.value / payouts;
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function transfer() external payable {
        require(msg.sender == lawyer, "caller is not lawyer");
        require(now >= earliestTransferTime, "too early to transfer");
        require(paidPayouts < payouts, "no payout left");
        uint256 eligiblePayouts = now - earliestTransferTime == 0
            ? 1
            : (now - earliestTransferTime) / interval;
        uint256 duePayouts = eligiblePayouts - paidPayouts;

        duePayouts = duePayouts + paidPayouts > payouts
            ? payouts - paidPayouts
            : duePayouts;
        paidPayouts += duePayouts;

        beneficiary.transfer(duePayouts * amount);
    }
}
