pragma solidity ^0.6.0;

interface Interface{
    function Hello() external pure returns(string memory);
}

contract InterfaceContract {
    
    function Hello() external pure returns(string memory){
        return "Hello";
    }
}