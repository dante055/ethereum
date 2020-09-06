/*pragma solidity ^0.5.0;

contract StructExample {
    struct Payment {
        uint amount;
        uint timestamps;
    }
    
    struct Balance {
        uint totalBalance;
        uint numPayments;
        mapping(uint => Payment) payments;
    }
    
    mapping(address => Balance) public recievedBalance; // we could have also worked with arrays of strunct
    
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function sendMoney() public payable {
        Balance storage balance = recievedBalance[msg.sender];
        // mark storage as we want to manipulte the copy of struct that is stored inside storage
        
        // Balance memory balance = recievedBalance[msg.sender];  // totalBalance wont increse
        
        balance.totalBalance += msg.value;
        Payment memory payment = Payment(msg.value, now);
        balance.payments[balance.numPayments] = payment;
        balance.numPayments++;
    }
    
    function withdrawPartialMoney(address payable _to, uint amount) public {
        // check effect interactions pattern
        require(recievedBalance[msg.sender].totalBalance >= amount);
        recievedBalance[msg.sender].totalBalance -= amount;
        _to.transfer(amount);
    }
    
    function withdrawAllMoney(address payable _to) public {
        uint balanceToSend = recievedBalance[msg.sender].totalBalance;
        recievedBalance[msg.sender].totalBalance = 0;
        _to.transfer(balanceToSend);
    }
}*/

// new sol 0.6

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

struct Payment {
    uint amount;
    uint timestamps;
}
    
struct Balance {
    uint totalBalance;
    uint numPayments;
    mapping(uint => Payment) payments;
}
    
contract StructExample {

    function returnStruct() external returns(Payment memory) {
        //cant return the Balance struct cause it contain mapping and ony libraries cant return it
    }
    
    mapping(address => Balance) public recievedBalance;
    
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function sendMoney() public payable {
        Balance storage balance = recievedBalance[msg.sender];
        // mark storage as we want to manipulte the copy of struct that is stored inside storage
        
        // Balance memory balance = recievedBalance[msg.sender];  // totalBalance wont increse
        
        balance.totalBalance += msg.value;
        Payment memory payment = Payment(msg.value, now);
        balance.payments[balance.numPayments] = payment;
        balance.numPayments++;
    }
    
    function withdrawPartialMoney(address payable _to, uint amount) public {
        // check effect interactions pattern
        require(recievedBalance[msg.sender].totalBalance >= amount);
        recievedBalance[msg.sender].totalBalance -= amount;
        _to.transfer(amount);
    }
    
    function withdrawAllMoney(address payable _to) public {
        uint balanceToSend = recievedBalance[msg.sender].totalBalance;
        recievedBalance[msg.sender].totalBalance = 0;
        _to.transfer(balanceToSend);
    }
}