// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./ZombieToken.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

// import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

// two ways to deploy token: 1. deploy in the constructor, 2. deploy and add address
// we cam add the logic for incrementting price and adding prices according to the token rareity
// we can also added zombie which are minted by the admin and attach price to it;
contract ZombieFactory is Ownable {
    address public zombieTokenAddress;

    ZombieToken zombieToken;
    uint256 zombiePrice;

    struct Zombie {
        uint256 zombieId; // currently we are using the same logic for id and dna u can change it later
        uint256 zombieDna;
        string name;
        string species;
        uint32 generation;
        uint32 level;
        uint32 readyTime;
        uint32 attackVictoryProbability;
        uint16 winCount;
        uint16 lossCount;
        uint32 coolDownTime; // default 1 day can cange by level
        uint256 parent1Id;
        uint256 parent2Id;
    }
    mapping(uint256 => Zombie) public zombie;
    uint256[] public zombieTokenIds;

    constructor(address _token, uint256 _zombiePrice) public {
        zombieToken = ZombieToken(_token);
        zombiePrice = _zombiePrice;
    }

    // function setTokenAddress(address _zombieTokenAddress) external onlyOwner {
    //     zombieToken = ZombieToken(_zombieTokenAddress);
    // }

    // limited time per user
    function createRandomZombie(string calldata _name) external payable {
        require(zombieToken.balanceOf(msg.sender) < 2);
        require(msg.value == zombiePrice);

        uint256 _uniqueId = _generateUniqueId();
        uint256 _dna = uint256(
            keccak256(abi.encodePacked(_name, _uniqueId, zombieTokenIds.length))
        );

        zombieToken.mint(msg.sender, _uniqueId);

        // 24 hours
        _createZombie(_uniqueId, _dna, _name, "Zombie Soldier", 0, 24, 0, 0);
    }

    function _generateUniqueId() internal view returns (uint256) {
        uint256 _uinqueId = uint256(
            keccak256((abi.encodePacked(block.timestamp, block.difficulty)))
        );
        return _uinqueId;
    }

    function _createZombie(
        uint256 _uniqueId,
        uint256 _dna,
        string memory _name,
        string memory _species,
        uint32 _generation,
        uint32 _coolDown,
        uint256 _parent1Id,
        uint256 _parent2Id
    ) internal {
        zombieTokenIds.push(_uniqueId);

        uint32 _attackVictoryProbability = 50;

        _attackVictoryProbability = 50 + ((_generation / 2));
        if (_attackVictoryProbability > 80) {
            _attackVictoryProbability = 80;
        }

        zombie[_uniqueId] = Zombie(
            _uniqueId,
            _dna,
            _name,
            _species,
            _generation,
            1,
            uint32(block.timestamp) + _coolDown,
            _attackVictoryProbability,
            0,
            0,
            _coolDown,
            _parent1Id,
            _parent2Id
        );
    }

    modifier isZombieOwner(uint256 _zombieId) {
        require(zombieToken.ownerOf(_zombieId) == msg.sender);
        _;
    }
}
