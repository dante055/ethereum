pragma solidity ^0.5.0;

contract SimpleMappingExample {
    
    mapping(uint => bool) public myMapping;
    mapping(address => bool) public myAddressMapping;
    
    function setValue(uint _index) public {
        myMapping[_index] = true;
    }
    
    function setMyAddress() public {
        myAddressMapping[msg.sender] = true;
    } // for white listing
}