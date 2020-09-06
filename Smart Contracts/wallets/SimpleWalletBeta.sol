pragma solidity ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";

contract SimpleWalletBeta {
    
    using SafeMath for uint;
    
    address public owner;
    uint public maxAllowanceAmount;
    uint public totalDepositedAmount;
    
    struct Allowance {
        uint withdrawAmount;
        uint timeStamp;
    }
    
    mapping(address => Allowance) public allowance;
    
    constructor(uint _maxAllowanceAmount) public {
        owner = msg.sender;
        maxAllowanceAmount = _maxAllowanceAmount;
    }
    
    
    modifier onlyOwner {
        require(msg.sender == owner, "Is not owner of the contract!!");
        _;
    }
    
    function Deposite() public payable {
        totalDepositedAmount = totalDepositedAmount.add(msg.value);
    }
    
    function SetMaxAllowanceAmount(uint _maxAllowanceAmount) public onlyOwner {
        maxAllowanceAmount = _maxAllowanceAmount;
    }
    
    function withdrawAllowance(uint _amount) public {
        require(totalDepositedAmount >= _amount, "Insufficient funds");
        
        if(now >= allowance[msg.sender].timeStamp + 1 weeks) {
            allowance[msg.sender].timeStamp = 0;
            allowance[msg.sender].withdrawAmount = 0;
        }
        
        require(allowance[msg.sender].withdrawAmount + _amount <= maxAllowanceAmount || now >= allowance[msg.sender].timeStamp + 1 weeks, "you have already withdrawn max amount for this week");
   
        if(allowance[msg.sender].withdrawAmount == 0) {
            allowance[msg.sender].timeStamp = now;
        }
        
        totalDepositedAmount = totalDepositedAmount.sub(_amount);
        allowance[msg.sender].withdrawAmount = allowance[msg.sender].withdrawAmount.add(_amount);
        msg.sender.transfer(_amount);
    }
}