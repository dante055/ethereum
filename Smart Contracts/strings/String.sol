pragma solidity ^0.6.0;

contract Strings{
    
    function length(string calldata _str) external pure returns(uint) {
        return bytes(_str).length;
    }
    
    function concatenate(
        string calldata _str1,
        string calldata _str2)
        external
        pure
        returns(string memory) {
            // abi.encodePacked() : concatinate and reurns a in form of bytes
            return string(abi.encodePacked(_str1, _str2));
    }
    
    function reverse(string calldata _str) external pure returns(string memory ) {
        // create a new temp string of same length and then reverse it
        bytes memory str = bytes(_str);
        string memory temp = new string(str.length);
        
        bytes memory _reverse = bytes(temp); 
        // will point to temp and initially will have empty value both _reverse nad temp will have same values in the end
        
        // bytes memory _reverse = bytes(_str); 
        // if we do tish we will have two pointers to this and we wont have and empty copy
        
        
        return string(_reverse);
    }
    
    function compare(
        string calldata _str1,
        string calldata _str2)
        external
        pure
        returns(bool) {
            // abi.encodePacked() : concatinate and reurns a in form of bytes snd then comae the hashes 
            return keccak256(abi.encodePacked(_str1)) == keccak256(abi.encodePacked(_str2)) ;
    }
}