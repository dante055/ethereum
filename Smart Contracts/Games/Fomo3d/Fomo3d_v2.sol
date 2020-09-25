// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// u can integateate it with chainlink alarm to schedulte the recreation of the round;

contract Fomo3d_v3 {
    address public admin;

    enum State {INACTIVE, ACTIVE}
    State public currentState;
    uint public initialKeyPrice = 1 ether;
    uint256 public hardEndTime = 3600 * 5; // 5 hour

    struct Round {
        address currentLeader;
        uint256 startTime;
        uint256 endTime;
        uint256 totalKeys;
        uint256 pricePool;
        address[] players;
        mapping(address => uint256) playersKeys;
    }

    mapping(uint256 => Round) public roundDetails;
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

        Round storage _round = roundDetails[roundId];

        // or thow error here 
        // require(block.timestamp <= endTime || block.timestamp <= hardEndTime, "the privious round is completed, wait for the new  roud to begin!!");
        if (block.timestamp > _round.endTime || block.timestamp > hardEndTime) {
            msg.sender.transfer(msg.value); // refund
            _distribute(); // districute the rewards
            _createRound(); // re run the game
            return;
        }

        // continume
        require(block.timestamp >= _round.startTime, "The current round has not started yet!!");
        require(
            msg.value % getKeyPrice() == 0,
            "You are sending some extra eth, check the current key price!!"
        );
        uint256 keyCount = msg.value / getKeyPrice();
        if (_round.playersKeys[msg.sender] == 0) {
            _round.players.push(msg.sender);
        }
        _round.playersKeys[msg.sender] += keyCount;
        _round.pricePool += msg.value;

        _round.endTime = _round.endTime + 30 > hardEndTime ? hardEndTime : _round.endTime + 30;
        _round.currentLeader = msg.sender;
    }

    // emergency distribute cnbe run by any one
    function runDistributeAndCreateNewRound() external inState(State.ACTIVE){
        require(
            block.timestamp > roundDetails[roundId].endTime || block.timestamp > hardEndTime,
            "The current round is still not over!!"
        );
        _distribute();
        _createRound();
    }

    function _createRound() internal {
        roundId++;
        Round storage _round = roundDetails[roundId];
        _round.startTime = block.timestamp + 60; // will state after 1 min
        _round.endTime = _round.startTime + 300; // will end after 5 min
    }

    function _distribute() internal {
        Round storage _round = roundDetails[roundId];

        // uint256 developerFees = _round.pricePool * 2 / 100; //2%
        uint256 winnersRewards = _round.pricePool * 48 / 100; // 48%
        uint256 playersReward =  _round.pricePool * 50 / 100; // 50%
        uint256 curentKeyPrice = (initialKeyPrice + ((_round.endTime - _round.startTime) / 60) * 0.01 ether);
        uint256 singleKeyValue = playersReward / curentKeyPrice;

        payable(_round.currentLeader).transfer(winnersRewards);

        for(uint256 i=0; i< _round.players.length; i++ ) {
            if(_round.players[i] != _round.currentLeader) {
                payable(_round.players[i]).transfer(_round.playersKeys[_round.players[i]] * singleKeyValue);
            }
        }
        // developerFees + winners key reward
        payable(admin).transfer(address(this).balance);
    }

    function getKeyPrice() public view returns (uint256) {
        // increase by 0.01 eth after ever 1 min
        uint256 periodCount = ((block.timestamp - roundDetails[roundId].startTime) / 60);
        return initialKeyPrice + periodCount * 0.01 ether;
    }

    modifier inState(State _state) {
        require(currentState == _state, "The contract is in wrong state!!");
        _;
    }
}
