pragma solidity ^0.6.0;

import "InterfaceContract.sol";

contract InterfaceExample{
    
    function callHello(address _add) external pure returns(string memory) {
        Interface i = Interface(_add);
        
        return i.Hello();
    }
}