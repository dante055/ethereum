pragma solidity ^0.5.11;

contract Owner {
    address owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
}
