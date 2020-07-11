pragma solidity ^0.6.0;

import 'Strings.sol';

contract Instance {
    Strings  stringInstance = new Strings();
    
    function length(string calldata _str) external view returns(uint) {
        return stringInstance.length(_str);
    }
}