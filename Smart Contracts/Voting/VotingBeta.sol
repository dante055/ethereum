pragma solidity 0.7.0;
pragma experimental ABIEncoderV2;

contract VotingBeta {
    address public admin;
    uint  timeLimit;
    bool public votingOpen;
    uint public votingEndTime;

    struct Candidate {
        bool isCandidate;
        uint votesRecieved;
    }
    address[] public candidates;
    mapping(address => Candidate) candidateStatus;

    struct Voters {
        bool isApprovedVoter;
        bool hasVoted;
        // address votedFor;
    }
    address[] public voters;
    mapping(address => Voters) votingStatus;

    struct Winner {
        address winner;
        int winnersIndex;
        uint votesRecieved;
        uint winningMargin;
    }
    // Winner winner;

    constructor(address[] memory _candidates, uint _timeLimit) {
        admin = msg.sender;
        candidates = _candidates;
        timeLimit = _timeLimit;

        for(uint i = 0; i < _candidates.length; i++) {
        require(candidateStatus[_candidates[i]].isCandidate == false, "You have dublicate candidate!");
            candidateStatus[_candidates[i]].isCandidate = true;
        }
    }

    function approveVoter(address _voter) external onlyAdmin {
        // require(votingOpen == false, "Voting has already started yet!");
        require(votingStatus[_voter].isApprovedVoter == false, "Already approved!");
        voters.push(_voter);
        votingStatus[_voter].isApprovedVoter = true;
    }

    function approveMultipleVoters(address[] calldata _voters) external onlyAdmin {
        // require(votingOpen == false, "Voting has already started yet!");
        for(uint i = 0; i < _voters.length; i++) {
             require(votingStatus[_voters[i]].isApprovedVoter == false, "One of voters is already approved!");
        voters.push(_voters[i]);
        votingStatus[_voters[i]].isApprovedVoter = true;
        }
    }

    function begingVoting() external onlyAdmin {
        require(votingOpen == false, "Voting has already started yet!");
        votingEndTime = block.timestamp + timeLimit;
        votingOpen = true;
    }

    function vote(address _candidate) external {
        require(votingOpen == true, "Voting has not started yet!");
        require(block.timestamp < votingEndTime, "Voting has been closed!");
        require(votingStatus[msg.sender].isApprovedVoter == true, "Not a voter!");
        require(votingStatus[msg.sender].hasVoted == false, "Already voted!");
        require(candidateStatus[_candidate].isCandidate == true, "Not a candidate");

        votingStatus[msg.sender].hasVoted = true;
        // votingStatus[msg.sender].votedFor = _candidate;
        candidateStatus[_candidate].votesRecieved++;
    }

    // function revealResult() external view onlyAdmin returns(bool, Winner memory) {
    function seeWinner() external view returns(bool, Winner memory) {
        require(votingOpen == true, "Voting has not started yet!");
        require(block.timestamp > votingEndTime, "Voting has not yet been closed!");

        address _winner;
        uint winnersIndex;
        uint votesRecieved;
        uint winningMargin;

        bool draw;

        address[] memory tempCandidates = candidates;
        address temp;
        Winner memory tempWinner;

        for(uint i = 0; i < tempCandidates.length - 1; i++) {
            if(candidateStatus[tempCandidates[i]].votesRecieved < candidateStatus[tempCandidates[i+1]].votesRecieved) {
                draw = false;

                winnersIndex = i + 1;
                _winner = candidates[i+1];
                votesRecieved = candidateStatus[tempCandidates[i+1]].votesRecieved;
                winningMargin = candidateStatus[tempCandidates[i+1]].votesRecieved - candidateStatus[tempCandidates[i]].votesRecieved;

            } else  if(candidateStatus[tempCandidates[i]].votesRecieved > candidateStatus[tempCandidates[i+1]].votesRecieved) {

                temp = tempCandidates[i];
                tempCandidates[i] = tempCandidates[i+1];
                tempCandidates[i+1] = temp;

                if(_winner != tempCandidates[i+1] || i == 0) {
                    winnersIndex = i;
                    _winner = candidates[i];
                    votesRecieved = candidateStatus[candidates[i]].votesRecieved;
                    winningMargin = candidateStatus[candidates[i]].votesRecieved - candidateStatus[candidates[i+1]].votesRecieved;
                }

            } else {
                draw = true;
            }
        }
        if(draw) {
            tempWinner.winnersIndex = -1;
            return (false, tempWinner);
        } else {
            tempWinner = Winner(_winner, int(winnersIndex), votesRecieved, winningMargin);
            return (true, tempWinner);
        }

    }

    // function seeWinner() external view returns(Winner memory){
    //     require(votingOpen == true, "Voting has not started yet!");
    //     require(block.timestamp > votingEndTime, "Voting has not yet been closed!");

    //     return winner;
    // }

    function seeOtherCanditdates(address _candidate) external view returns(uint){
        require(votingOpen == true, "Voting has not started yet!");
        require(block.timestamp > votingEndTime, "Voting has not yet been closed!");
        require(candidateStatus[_candidate].isCandidate == true, "Not a candidate");

        return candidateStatus[_candidate].votesRecieved;
    }

    function getCandidates() external view returns(address[] memory) {
        return candidates;
    }

    function getVoters() external view returns(address[] memory) {
        return voters;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin!");
        _;
    }
}
