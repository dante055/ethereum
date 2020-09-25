// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// u can integateate it with chainlink alarm to schedulte the recreation of the round;

contract Fomo3d_v1 {
    address public admin;

    enum State {INACTIVE, ACTIVE}

    State currentState;
    address currentLeader;
    uint256 startTime;
    uint256 endTime;
    uint256 hardEndTime = 3600 * 5; // 5 hour
    uint256 initialKeyPrice = 1 ether;
    uint256 totalKeys;
    uint256 pricePool;
    address[] players;
    mapping(address => uint256) playersKeys;

    mapping(uint256 => address) public roundWinners;
    uint256 public roundId;

    constructor() {
        admin = msg.sender;
    }

    // run only once
    function kickstart() external inState(State.INACTIVE) {
        require(
            roundId == 0,
            "This function can only be called once in the contrace life!!"
        );
        currentState = State.ACTIVE;
        _createRound();
    }

    function bet() external payable inState(State.ACTIVE){

        // or thow error here 
        // require(block.timestamp <= endTime || block.timestamp <= hardEndTime, "the privious round is completed, wait for the new  roud to begin!!");
    
        if (block.timestamp > endTime || block.timestamp > hardEndTime) {
            msg.sender.transfer(msg.value); // refund
            _distribute(); // districute the rewards
            _createRound(); // re run the game
            return;
        }

        // continume
        require(block.timestamp >= startTime, "The current round has not started yet!!");
        require(
            msg.value % getKeyPrice() == 0,
            "You are sending some extra eth, check the current key price!!"
        );
        uint256 keyCount = msg.value / getKeyPrice();
        if (playersKeys[msg.sender] == 0) {
            players.push(msg.sender);
        }
        playersKeys[msg.sender] += keyCount;
        pricePool += msg.value;

        endTime = endTime + 30 > hardEndTime ? hardEndTime : endTime + 30;
        currentLeader = msg.sender;
    }

    // emergency distribute cnbe run by any one
    function runDistributeAndCreateNewRound() external {
        require(
            block.timestamp > endTime || block.timestamp > hardEndTime,
            "The current round is still not over!!"
        );
        _distribute();
        _createRound();
    }

    // do cleanup and reintialize
    // make a mapping of roundId to a struct of theri details
    function _createRound() internal {
        for (uint256 i = 0; i < players.length; i++) {
            delete playersKeys[players[i]];
        }
        delete players;

        roundId++;
        pricePool = 0;
        totalKeys = 0;
        currentLeader = address(0);
        startTime = block.timestamp + 60; // will state after 1 min
        endTime = startTime + 300; // will end after 5 min
    }

    function _distribute() internal {
        // uint256 developerFees = pricePool * 2 / 100; //2%
        uint256 winnersRewards = pricePool * 48 / 100; // 48%
        uint256 playersReward =  pricePool * 50 / 100; // 50%
        uint256 curentKeyPrice = (initialKeyPrice + ((endTime - startTime) / 60) * 0.01 ether);
        uint256 singleKeyValue = playersReward / curentKeyPrice;

        roundWinners[roundId] = currentLeader;
        payable(currentLeader).transfer(winnersRewards);

        for(uint256 i=0; i< players.length; i++ ) {
            if(players[i] != currentLeader) {
                payable(players[i]).transfer(playersKeys[players[i]] * singleKeyValue);
            }
        }
        // developerFees + winners key reward
        payable(admin).transfer(address(this).balance);
    }

    function getKeyPrice() public view returns (uint256) {
        // increase by 0.01 eth after ever 1 min
        uint256 periodCount = ((block.timestamp - startTime) / 60);
        return initialKeyPrice + periodCount * 0.01 ether;
    }

    function getRoundDetails() 
        external 
        view 
        returns(
            uint256 _roundId,
            uint256  _startTime,
            uint256  _endTime,
            uint256  _pricePool,
            uint256 _totalKeys
        ) 
    {
        require(roundId > 0, "The game has not begin yet!!");
        return (roundId, startTime, endTime, pricePool, totalKeys);
    }


    modifier inState(State _state) {
        require(currentState == _state, "The contract is in wrong state!!");
        _;
    }
}
