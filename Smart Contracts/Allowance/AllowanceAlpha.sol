pragma solidity ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract AllowanceContract is Ownable {
    
    event AllowanceChanged(address indexed _forWho, address indexed _fromWhome, uint _oldAmount, uint _newAnount);
    
    using SafeMath for uint;
    
    struct Allowance {
        uint withdrawAmount;
        uint timeStamp;
        uint maxAllowanceAmount;
    }
    
    mapping(address => Allowance) public allowance;
    
    modifier ownerOrAllowed(uint _amount) {
        require(owner() == msg.sender || allowance[msg.sender].maxAllowanceAmount >= _amount , "You are not allowed");
        _;
    }
    
    
    function addAllowance(address _to, uint _maxAllowanceAmount) public onlyOwner() {
        emit AllowanceChanged(_to, msg.sender, allowance[_to].maxAllowanceAmount, _maxAllowanceAmount);
        allowance[_to].maxAllowanceAmount = _maxAllowanceAmount;
    }
    
    function changeAllowance(address _to, uint _maxAllowanceAmount) public onlyOwner() {
        emit AllowanceChanged(_to, msg.sender, allowance[_to].maxAllowanceAmount, _maxAllowanceAmount);
        allowance[_to].maxAllowanceAmount = _maxAllowanceAmount;
    }
    
}