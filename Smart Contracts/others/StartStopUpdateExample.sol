pragma solidity ^0.5.0;

contract StartStopUpdateExample {
    
    address owner;
    
    bool public paused; 
    
    constructor() public {
        owner = msg.sender;
    } 
    // constructor can be public or internal
    // if the constructor has a 'payable' modifier, then the constructor can only be public.
    
    function sendMoney() public payable {
        
    }
    
    function setPaused(bool _paused) public {
        require(msg.sender == owner, "You are not the owner");
        paused = _paused;
    } // if paused then u can only send money not withDraw it
    
    function withDrawMoney(address payable _to) public {
        require(msg.sender == owner, "You are not the owner");
        require(!paused, "Contract is paused"); // !true = false
        _to.transfer(address(this).balance);
    }
    
    function destroySmartContract(address payable _to) public {
        require(msg.sender == owner, "You are not the owner");
        selfdestruct(_to); // _to will recieve all the funds
    }
 }