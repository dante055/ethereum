pragma solidity ^0.6.0;

library Search {
    
    function indexOf(uint[] memory _arr, uint _value) public pure returns(uint) {
        for(uint i = 0; i < _arr.length; i++)
            if(_arr[i] == _value) return i;
        return uint(-1);
    }
}

contract libraryExample2 {
    uint[] public data;
    
    function append(uint _value) public {
        data.push(_value);
    }
    
    function replace(uint _old, uint _new) public {
        // library function
        uint index = Search.indexOf(data, _old);
        if(index == uint(-1))
            data.push(_new);
        else
            data[index] = _new;
    }
}