pragma solidity  ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";

contract LibrariesExample {
    
    using SafeMath for uint;
    
    mapping(address => uint) public tokenBalance;
    
    constructor() public {
        tokenBalance[msg.sender] = tokenBalance[msg.sender].add(1);   
    } 
    // if we send more than 2 ether then u will get max no for uint256 bit because it wraps arount and doesnt give error msg
    // here we can use libraries
    
    
    function sendToken(address _to, uint _amount) public returns(bool) {
        tokenBalance[msg.sender] = tokenBalance[msg.sender].sub(_amount);
        tokenBalance[_to] = tokenBalance[_to].add(_amount);
        return true; 
    }
}