// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract Owner {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not the owner of this vault!!");
        _;
    }
}

contract Vault {
    bytes32 private passWord;
    
    // constructor(bytes32  _password)  {
    //     passWord = keccak256(abi.encode(_password));
    // }
    
    function setPassword(bytes32  _password) external {
        passWord = keccak256(abi.encode(_password));
    }
    
    function getPassword() external view returns(bytes32) {
        return passWord;
    }
}

contract Factory is Owner{
    address private vaultAddress;
    
    // constructor(string memory _secrect) {
    //     bytes32 secrect = keccak256(abi.encode(_secrect));
    //     vaultAddress = address(new Vault(secrect));
    // }
    
    // function setSecret(string memory _secrect) external {
    //     secrect = keccak256(abi.encode(_secrect));
    //     vaultAddress = address(new Vault(secrect));
    // }
    
    constructor() {
        vaultAddress = address(new Vault());
    }
    
    function setSecret(string memory _secrect) external isOwner() {
        Vault temp = Vault(vaultAddress);
        bytes32 secrect = keccak256(abi.encode(_secrect));
        temp.setPassword(secrect);
    }
    
    function getSecret() external view isOwner() returns(bytes32) {
        Vault temp = Vault(vaultAddress);
        return temp.getPassword();
    }
    
    function getVaultAddress() external view isOwner() returns(address) {
        return vaultAddress;
    }
} 
