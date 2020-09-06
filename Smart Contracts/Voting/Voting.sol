// SPDX-License-Identifier:MIT
pragma solidity 0.7.0;
pragma experimental ABIEncoderV2;

contract Voting {
    address public admin;

    struct Choices {
        uint choiceId;
        string name;
        uint votesReceived;
        // bool isWinner;
    }

    struct ChoicesTemp{
        uint _id;
        string _name;
    }

    struct Voter {
        bool isVoter;
        bool hasVoted;
    }

    struct Ballot {
        bool ballotExist;
        uint ballotId;
        string name;

        Choices[] choices;
        address[] voterAddress;
        mapping(address => Voter) voters;

        uint timeLimit;
        uint endTime;
        bool hasVotingBegin;

        uint totalVatesLogged;
    }
    uint nextBallotId;
    mapping(uint => Ballot) public ballots;


    // mapping(address => mapping(uint => Voter)) public voters;

    constructor() {
        admin = msg.sender;
    }

    function createBallot(
            string memory _ballotName,
            string[] memory _choicesNames,
            uint _timeLimit
        )
        external onlyAdmin() {
            require(_choicesNames.length > 1, "Should have minimum 2 choices present for the ballot!");
            ballots[nextBallotId].ballotExist = true;
            ballots[nextBallotId].ballotId = nextBallotId;
            ballots[nextBallotId].name = _ballotName;
            ballots[nextBallotId].timeLimit = _timeLimit;

            for(uint i = 0; i < _choicesNames.length; i++) {
                ballots[nextBallotId].choices.push(Choices(i, _choicesNames[i], 0));
            }

            nextBallotId++;
    }

    function addVoters(uint _ballotId, address[] calldata _voters) external onlyAdmin() ballotExist(_ballotId){
        if(ballots[_ballotId].hasVotingBegin == true) {
            require(block.timestamp < ballots[_ballotId].endTime, "Cant add more voters as voting period has already endded!");
        }
        for(uint i = 0; i < _voters.length; i++) {
            require(ballots[_ballotId].voters[_voters[i]].isVoter == false, "Voters array has dublicate values!");
            ballots[_ballotId].voters[_voters[i]].isVoter = true;
            ballots[_ballotId].voterAddress.push(_voters[i]);
        }
    }

    function begingVoting(uint _ballotId) external ballotExist(_ballotId) onlyAdmin() {
        require(ballots[_ballotId].hasVotingBegin == false, "Voting has already started yet!");
        require(ballots[_ballotId].voterAddress.length > 1, "Should have atleast 2 voters added as approved voters!");
        ballots[_ballotId].hasVotingBegin = true;
        ballots[_ballotId].endTime = block.timestamp + ballots[_ballotId].timeLimit;
    }

    function vote(uint _ballotId, uint _choiceId) external ballotExist(_ballotId) {
        require(ballots[_ballotId].choices.length > _choiceId, "Choice isnt present!");
        require(ballots[_ballotId].hasVotingBegin == true, "Voting hasnt begin yet!");
        require(block.timestamp < ballots[_ballotId].endTime, "Voting period has endded!");
        require(ballots[_ballotId].voters[msg.sender].isVoter == true, "Your are not an approved voter!");
        require(ballots[_ballotId].voters[msg.sender].hasVoted == false, "You have already voted for this ballot!");

        ballots[_ballotId].voters[msg.sender].hasVoted = true;
        ballots[_ballotId].choices[_choiceId].votesReceived++;

        ballots[_ballotId].totalVatesLogged++;
    }

    function result(uint _ballotId) external view ballotExist(_ballotId) returns(Choices[] memory) {
        require(ballots[_ballotId].hasVotingBegin == true, "Voting hasnt begin yet!");
        require(block.timestamp > ballots[_ballotId].endTime, "Voting period has not endded yet!");

        return ballots[_ballotId].choices;
    }

    function showWinner(uint _ballotId) external view ballotExist(_ballotId) returns(Choices memory) {
        require(ballots[_ballotId].hasVotingBegin == true, "Voting hasnt begin yet!");
        require(block.timestamp > ballots[_ballotId].endTime, "Voting period has not endded yet!");

        Choices memory _winner;
        uint _maxVotes = ballots[_ballotId].choices[0].votesReceived;
        uint _winnerId = ballots[_ballotId].choices[0].choiceId;
        bool draw;

        for(uint i = 1; i < ballots[_ballotId].choices.length; i++) {
            if(ballots[_ballotId].choices[i].votesReceived > _maxVotes) {
                _maxVotes = ballots[_ballotId].choices[i].votesReceived;
                _winnerId = ballots[_ballotId].choices[i].choiceId;
                draw = false;
            } else if(ballots[_ballotId].choices[i].votesReceived == _maxVotes) {
                draw = true;
            }
        }

        if(draw) {
            return _winner;
        } else {
            _winner = Choices(_winnerId, ballots[_ballotId].choices[_winnerId].name, ballots[_ballotId].choices[_winnerId].votesReceived);
            return _winner;
        }
    }

    function showChoices(uint _ballotId)
        external
        view
        ballotExist(_ballotId)
        returns(ChoicesTemp[] memory) {

            ChoicesTemp[] memory _choices = new ChoicesTemp[](ballots[_ballotId].choices.length);

            for(uint i = 0; i < ballots[_ballotId].choices.length; i++) {
                _choices[i]._id = ballots[_ballotId].choices[i].choiceId;
                _choices[i]._name = ballots[_ballotId].choices[i].name;
            }
            // return ballots[_ballotId].choices;
            return _choices;
    }

    function showVoters(uint _ballotId)
        external
        view
        ballotExist(_ballotId)
        returns(address[] memory) {
            return ballots[_ballotId].voterAddress;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin!");
        _;
    }

    modifier ballotExist(uint _ballotId) {
        require(ballots[_ballotId].ballotExist == true, "Ballot with this id does not exist!");
        _;
    }
}
