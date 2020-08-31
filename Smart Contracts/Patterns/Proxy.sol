contract Proxy {

    address delegate;
    address owner = msg.sender;

    function upgradeDelegate(address newDelegateAddress) public {
        require(msg.sender == owner);
        delegate = newDelegateAddress;
    }

    function() external payable {
        assembly {
            let _target := sload(0)
            calldatacopy(0x0, 0x0, calldatasize)
            let result := delegatecall(gas, _target, 0x0, calldatasize, 0x0, 0)
            returndatacopy(0x0, 0x0, returndatasize)
            switch result case 0 {revert(0, 0)} default {return (0, returndatasize)}
        }
    }
}

/*
The actual forwarding functionality is implemented in the function starting from line 11
The function does not have a name and is therefore the fallback function, 
Line 13 loads the first variable in storage, in this case the address of the delegate, and stores it in the memory variable _target.
Line 14 copies the function signature and any parameters into memory. 
In line 15 the delegatecall to the _target address is made, including the function data that has been stored in memory.
A boolean containing the execution outcome is returned and stored in the result variable
Line 16 copies the actual return value into memory. 
The switch in line 17 checks whether the execution outcome was negative, in which case any state changes are reverted, or positive, in which case the result is returned to the caller of the proxy.

*/