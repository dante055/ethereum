pragma solidity ^0.6.0;

/* eariler
contract A {
    
    unit a;
    
    function fun() external ;
}

contract B is A {
    
    uint a;
    function fun() external {
    	// ...
    }
}
*/

// now if in the parent smart contract if u have any unimlementd function then u have to add abstract keyword
// and the function that is not implementd u have to add the  virtual keyword
// and in the implemented  function u need to add the overide keyword

// and also now u can shadow the variable

abstract contract A {
    
    uint a;
    function fun() external virtual ;
}

contract B is A {
    
    // uint a; now not allowed
    function fun() external override {
    	// ...
    }
}