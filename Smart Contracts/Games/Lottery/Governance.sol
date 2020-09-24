pragma solidity ^0.6.6;

contract Governance {
    address public lottery;
    address public randomness;

    function init(address _lottery, address _randomness) public {
        require(_randomness != address(0), "governance/no-randomnesss-address");
        require(_lottery != address(0), "no-lottery-address-given");

        randomness = _randomness;
        lottery = _lottery;
    }
}
