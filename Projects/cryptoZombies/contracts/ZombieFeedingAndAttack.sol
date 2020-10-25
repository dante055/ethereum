// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./ZombieFactory.sol";

interface KittyInterface {
    function getKitty(uint256 _id)
        external
        view
        returns (
            bool isGestating,
            bool isReady,
            uint256 cooldownIndex,
            uint256 nextActionAt,
            uint256 siringWithId,
            uint256 birthTime,
            uint256 matronId,
            uint256 sireId,
            uint256 generation,
            uint256 genes
        );
}

contract ZombieFeedingAndAttack is ZombieFactory {
    // ZombieFactory zombieFactory;

    address ckAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d; // kitty addressssss
    // address ckAddress = 0xa751b62893867d0608a2ada5d17d0c43e3433040; // cheshire truffle
    KittyInterface kittyContract = KittyInterface(ckAddress);

    uint256 randAttackNonce = 0;

    constructor(address _token, uint256 _zombiePrice)
        public
        ZombieFactory(_token, _zombiePrice)
    {}

    // constructor(address _zombieFactoryAddress) public {
    //     zombieFactory = ZombieFactory(_zombieFactoryAddress);
    // }

    function feedOnOther(uint256 _zombieId, uint256 _targetDna) external {}

    function feedOnKitty(uint256 _zombieId, uint256 _kittyId)
        public
        isZombieOwner(_zombieId)
    {
        uint256 _kittyDna;
        (, , , , , , , , , _kittyDna) = kittyContract.getKitty(_kittyId);
        require(_kittyDna > 0);
        Zombie storage _zombie = zombie[_zombieId];
        uint32 _generation = zombie[_zombieId].generation + 1;

        require(_isReady(_zombie));
        _feedAndMultiply(_zombieId, _kittyDna, _generation, "Kitty Zombie");
        _triggerCooldown(_zombie);
    }

    function attack(uint256 _zombieId, uint256 _targetId)
        external
        isZombieOwner(_zombieId)
    {
        require(zombie[_targetId].zombieId != 0);
        Zombie storage _myZombie = zombie[_zombieId];
        Zombie storage _targetZombie = zombie[_targetId];

        require(_isReady(_myZombie));
        if (_randAttackWinRatio() > _myZombie.attackVictoryProbability) {
            // win
            _myZombie.winCount++;
            _targetZombie.lossCount++;

            // after ever 5 wins level increse and attackVictoryProbability increase and a new zombie can be minted
            if (_myZombie.winCount % 5 == 0) {
                _myZombie.level++;
                if (_myZombie.attackVictoryProbability < 79) {
                    _myZombie.attackVictoryProbability += 2;
                }
                uint32 _generation = _myZombie.generation >
                    _targetZombie.generation
                    ? _myZombie.generation + 1
                    : _targetZombie.generation + 1;
                // you can also add logic to change the species name acording to level
                _feedAndMultiply(
                    _zombieId,
                    _targetZombie.zombieDna,
                    _generation,
                    "Zombie Warrior"
                );
            }
        } else {
            //loss
            _myZombie.lossCount++;
            _targetZombie.winCount++;
        }

        _triggerCooldown(_myZombie);
    }

    function _feedAndMultiply(
        uint256 _zombieId,
        uint256 _targetDna,
        uint32 _generation,
        string memory _species
    ) internal {
        uint256 _uniqueId;
        uint256 _newDna;
        uint256 _averageDna = (zombie[_zombieId].zombieDna + _targetDna) / 2;
        uint256 _dna = uint256(
            keccak256((abi.encodePacked(_averageDna, zombieTokenIds.length)))
        );
        if (
            keccak256(abi.encodePacked(_species)) ==
            keccak256(abi.encodePacked("Kitty Zombie"))
        ) {
            _newDna = _dna - (_dna % 100) + 99;
        }
        uint32 _coolDownTime = 24 + (6 * _generation);

        _createZombie(
            _uniqueId,
            _dna,
            "No Name",
            _species,
            _generation,
            _coolDownTime,
            zombie[_zombieId].zombieDna,
            _targetDna
        );
    }

    function _isReady(Zombie storage _zombie) internal view returns (bool) {
        return _zombie.readyTime < block.timestamp;
    }

    function _triggerCooldown(Zombie storage _zombie) internal {
        _zombie.readyTime = _zombie.readyTime + _zombie.coolDownTime;
    }

    function _randAttackWinRatio() internal returns (uint256) {
        randAttackNonce++;
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        msg.sender,
                        randAttackNonce
                    )
                )
            ) % 100;
    }
}
