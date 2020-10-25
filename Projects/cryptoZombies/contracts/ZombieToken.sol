// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ZombieToken is ERC721 {
    address public admin;
    address public zombieFactoryAddress;

    constructor(string memory name, string memory symbol)
        public
        ERC721(name, symbol)
    {
        admin = msg.sender;
    }

    function setContractAddress(address _zombieFactoryAddress) external {
        require(msg.sender == admin);
        zombieFactoryAddress = _zombieFactoryAddress;
    }

    function mint(address _to, uint256 _tokenId) external {
        require(msg.sender == zombieFactoryAddress);
        _mint(_to, _tokenId);
    }
}
