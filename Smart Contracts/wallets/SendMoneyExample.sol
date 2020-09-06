pragma solidity ^0.5.0;

contract SendMoneyExample {
    
    uint public balanceRecieved;
    
    function reciveMoney() public payable {
         balanceRecieved = msg.value;
    }
    
    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function withDrawMoney() public {
        // since we are transfering it no need to be payable
        address payable to = msg.sender;
        to.transfer(this.getContractBalance());
    }
    
    function withDrawMoneyTo(address payable _to) public {
        _to.transfer(this.getContractBalance());
    }
}