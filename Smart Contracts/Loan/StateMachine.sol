// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract StateMachine {
    address public lender;

    enum State{PENDING, ACTIVE, CLOSED}

    uint public amountAvailable;
    uint public interestAmount;
    uint public intrestPeriod;

    struct Loan {
        uint loanId;
        address browwer;
        uint borrowedAmount;
        uint borrowedTime;
        uint loanEndTime;
        State state;
    }
    mapping(uint => Loan) public loanDetails;
    uint public loanNextId = 1;

    receive() external payable {
        require(msg.sender == lender, "Caller is not the owner!!");
        amountAvailable = amountAvailable + msg.value;
    }

    constructor(uint _interestAmount, uint _intrestPeriod) payable {
        lender = msg.sender;
        amountAvailable = msg.value;
        interestAmount = _interestAmount;
        intrestPeriod = _intrestPeriod;
    }


    // you can add extra logic to handle "loanEndTime" like increse the interst rate when the time excceds the given time 
    function borrow(uint _amount) external {
        require(amountAvailable >= _amount, "Contract have insufficent funds!!");

        loanDetails[loanNextId] = Loan(loanNextId, msg.sender, _amount, block.timestamp, 0, State.ACTIVE);

        msg.sender.transfer(_amount);
        loanNextId++;
    }

    function reimberse(uint _loanId) external payable {        
        require(loanDetails[_loanId].state == State.ACTIVE, "State of loan is not active!!");

        uint _interestAmount = ((block.timestamp - loanDetails[_loanId].borrowedTime) / intrestPeriod ) * interestAmount;
        require(loanDetails[_loanId].borrowedAmount + _interestAmount == msg.value, "The borrowed amount with interest added does not match to the amount u a sending!!");

        loanDetails[_loanId].loanEndTime = block.timestamp;
        loanDetails[_loanId].state = State.CLOSED;
    }

    function calculateInterest(uint _loanId) external view returns(uint){
        require(loanDetails[_loanId].state == State.ACTIVE, "State of loan is not active!!");
        uint _interestAmount = ((block.timestamp - loanDetails[_loanId].borrowedTime) / intrestPeriod ) * interestAmount;
        return _interestAmount;
    }

    function contractBalance() external view returns(uint) {
        return address(this).balance;
    }
}