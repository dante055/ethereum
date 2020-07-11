pragma solidity ^0.6.0;

contract OwnerEvent {

    address private _owner;
    event OwnerSet(address owner);

    function setOwner(address ownerAddress) public {
        _owner = ownerAddress;
        emit OwnerSet(_owner);
        // emit OwnerSet(msg.sender);
    }

    function getCurrentOwner() public view returns (address){
        return _owner;
    }
}