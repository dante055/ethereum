pragma solidity ^0.5.0;

contract MappingExample2 {
    
    mapping(address => uint) public recievedBalance;
    
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function sendMoney() public payable {
        recievedBalance[msg.sender] += msg.value;
    }
    
    function withdrawPartialMoney(address payable _to, uint amount) public {
        // check effect interactions pattern
        require(recievedBalance[msg.sender] >= amount);
        recievedBalance[msg.sender] -= amount;
        _to.transfer(amount);
    }
    
    function withdrawAllMoney(address payable _to) public {
        uint balanceToSend = recievedBalance[msg.sender];
        recievedBalance[msg.sender] = 0;
        _to.transfer(balanceToSend);
    }
}