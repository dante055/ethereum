pragma solidity >=0.4.22 <0.7.0;

contract HelloWorld {
    string public str = "HelloWorld";
    uint n = 32;
    // string str = "HelloWorld";
    
    function print() public pure returns(string memory) {
        return "HelloWorld";
    }  // memory : we are coping data from strorage to memory
    
    /*function print2() public pure returns(string memory) {
        return str;
    }*/ // will give error as it reads from str and in pure you cant even read nor change
    
    function print2() public view returns(string memory) {
        return str;
    }
    

    function printNumber() public view returns(uint) {
        return n;
    }   

    // returns (uint n) : declartion shadowns existing decration
    // return (uint) = returns (uint storage)
    
}