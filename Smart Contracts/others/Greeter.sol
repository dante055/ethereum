pragma solidity ^0.6.0;

contract Greeter {

    string private _greeting;
    // string public _greeting;


    constructor(string memory message) public {
        _greeting = message;
    }

    /*
        function greet(string memory message) public {
            _greeting = message;
        }
    */

    function getGreeting() public view returns (string memory){
        return _greeting;
    }
}