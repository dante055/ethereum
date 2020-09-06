pragma solidity ^0.6.0;

import "./AllowanceContract.sol";

contract SimpleWallet is AllowanceContract {
    
    event MoneySent(address indexed _benificiary, uint _amount);
    event MoneyRecieved(address indexed _from, uint _amount);
    
    uint public totalDepositedAmount;
    
    function deposite() public payable {
        emit MoneyRecieved(msg.sender, msg.value);
        totalDepositedAmount = totalDepositedAmount.add(msg.value);
    }
    
    function withdrawAllowance(uint _amount) public ownerOrAllowed(_amount) {
        require(totalDepositedAmount >= _amount, "Insufficient funds");
        
        if(owner() != msg.sender) {
            if(now >= allowance[msg.sender].timeStamp + 1 weeks) {
                allowance[msg.sender].withdrawAmount = 0;
                allowance[msg.sender].timeStamp = 0; // week will start from when the person has with drawn money
                // allowance[msg.sender].timeStamp = allowance[msg.sender].timeStamp + 1 weeks; // automatically resets the week
            }
            
            require(allowance[msg.sender].withdrawAmount + _amount <= allowance[msg.sender].maxAllowanceAmount || now >= allowance[msg.sender].timeStamp + 1 weeks, "you have already withdrawn max amount for this week");
       
            if(allowance[msg.sender].withdrawAmount == 0) {
                allowance[msg.sender].timeStamp = now;
            }
            allowance[msg.sender].withdrawAmount = allowance[msg.sender].withdrawAmount.add(_amount);
        }
        
        emit MoneySent(msg.sender, _amount);
        totalDepositedAmount = totalDepositedAmount.sub(_amount);
        msg.sender.transfer(_amount);
    }
    
    function renounceOwnership() public override(Ownable) {
        revert("Cant renounce Ownership here");
    }
    
}