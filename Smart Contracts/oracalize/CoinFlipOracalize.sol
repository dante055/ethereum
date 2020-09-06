// deploy using metamask on test network as it requires ether
pragma solidity ^0.6.0;

import 'https://github.com/provable-things/ethereum-api/blob/master/provableAPI_0.6.sol';

contract CoinFlipOracle is usingProvable {
    
    string public result;
    bytes32 public oraclizeId;
    
    function coinFlip() public payable {
        oraclizeId = provable_query('WolframAlpha', 'flip a coin');
        // ('WolframAlpha', 'random number between 0 and 100')
    }
    
    function __callback(bytes32 _oraclizeId, string memory _result) public override(usingProvable) {
        // this function should be only call from oracalize service
        require(msg.sender == provable_cbAddress());
        result = _result;
    }
}