pragma solidity ^0.5.0;

contract ExceptionExample {
    
    mapping(address => uint64) public recievedBalance;
    // uint64 can store around 18 ethers
    // will roll over to zero after reaching maximum value
    // so if we stor 20eth then only approx 1.5eth will saved
    
    
    function sendMoney() public payable {
        assert(recievedBalance[msg.sender] + uint64(msg.value) >= recievedBalance[msg.sender]);
        recievedBalance[msg.sender] += uint64(msg.value);
    }
    
    function withdrawPartialMoney(address payable _to, uint64 amount) public {
        // check effect interactions pattern
        require(recievedBalance[msg.sender] >= amount, "You dont have enought money!!");
        assert(recievedBalance[msg.sender] >= recievedBalance[msg.sender] - amount);
        recievedBalance[msg.sender] -= amount;
        _to.transfer(amount);
    }
    
}