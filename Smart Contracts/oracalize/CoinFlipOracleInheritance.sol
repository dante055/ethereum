pragma solidity ^0.6.0;

import 'https://github.com/provable-things/ethereum-api/blob/master/provableAPI_0.6.sol';

contract CoinFlipOracle is usingProvable {
    
    string public result;
    bytes32 public oraclizeId;
    address public oracaleConractAddress = address(this);
    
    function coinFlip() public payable returns(string memory) {
        oraclizeId = provable_query('WolframAlpha', 'flip a coin');
        return result;
    }
    
    function __callback(bytes32 _oraclizeId, string memory _result) public override(usingProvable) {
        // this function should be only call from oracalize service
        require(msg.sender == provable_cbAddress());
        result = _result;
    }
}

