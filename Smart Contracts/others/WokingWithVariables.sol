pragma solidity ^0.5.0;

contract WokingWithVariables {
    uint256 public myInt;
    
    function setMyInt(uint _myInt) public {
        myInt = _myInt;
    }
    // uint = uint256

        
    function resetMyInt() public {
        delete myInt;
    }
    
    bool public myBool;
    
    function setMyBool(bool _myBool) public {
        myBool = _myBool;
    }
    
    uint8 public myUint8;
    
    function incrementUint() public {
        myUint8++;
    }
    
    function decrementUint() public {
        myUint8--;
    }
    
    address public myAddess;
    
    function setMyAddres(address _myAddress) public {
        myAddess = _myAddress;
    }
    
    function getBalanceOfAddress() public view returns(uint) {
        return myAddess.balance;
    }
    
    // strings are byte array
    // we cannot concatinate, expensive, of use funtion like other language
    // we can work in other ways: like store it outsisde of blockchain(and use hash to verify it), or in events outside solidity
    string public myString = "hello world";
    
    //for reference types we have to define data location
    function setMyAddres(string memory _myString) public {
        myString = _myString;
    }
}