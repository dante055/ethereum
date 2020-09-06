pragma solidity ^0.6.0;

/**
 * New Fallback Function and Receive function
 * for 0.6.0 only
 * */

 // usecase 1 recevie ether
 // usecase 2 fallback (if u call a function that not exist)


contract A {
    event SomeEvent(address _addr, uint _amount);
    
    // Will be called when (fallback) is used in Remix

     // call when if u send transaction without calling any of its function
     // usefull to accept ether
    receive() external payable {
        emit SomeEvent(msg.sender, msg.value);
    }

    // if u call function that doesnot exist and if u have a falback function then fall backfunction will be executed
    
    ///Will be called when msg.data is not empty or when receive() doesn't exist

    //If not payable => assert-style error on msg.value not empty

    // can be optionally payable 
    // usefull in poxy contracts
    
    fallback () external {
        
    }
}