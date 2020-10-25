// SPDX-License-Identifier:MIT
pragma solidity ^0.7.0;

// Functionaly to be added 
// create an erc20 token to be given as incentive to investors and how to utilize it like when benifits gains from burning it
// redeemShares(uint _amount)                   :  according to the market value of dao using oracal
// transferShare(uint _amount, address _to)     :  buying and selling of shares in other exchange platforms
// create an emergeny exit path in such a way that u can distibute amount per share

contract DAO {
    address public admin;
    uint public contributeEndTime;
    uint public voteTimeLimit;
    uint public quorum;      // total percentage of votes required
    uint public totalShares; // 1 wei = 1 share
    uint public availabeAmout;  
    
    struct Innvestor {
        bool isInvestor;
        uint shares;
    }
    address[] public investorsArr;
    mapping(address => Innvestor) public investors;
    // mapping(address => bool) public investors;
    // mapping(address => uint) public shares;
    // mapping(address => mapping(bool => uint) public investors;
    
    struct Proposal {
        bool proposalExist;
        uint propsalId;
        string proposalName;
        uint amount;
        address payable recipient;
        uint votesRecievedPerShare;
        uint votingEndTime;
        bool executed;
        bool proposalPassed;
    }
    uint public nextProposalIds;
    mapping(uint => Proposal) public proposals;
    
    mapping(address => mapping(uint => bool)) public votes;
    
    event Deposite(address indexed _from, uint _amount);
    event Transfer(address indexed _from, address indexed _to, uint _amount);
    
    constructor(uint _contributeTime, uint _voteTimeLimit, uint _quorum) {
        admin = msg.sender;
        contributeEndTime = block.timestamp + _contributeTime;
        voteTimeLimit = _voteTimeLimit;
        quorum = _quorum;
    }
    
    function contribute() external payable {
        require(block.timestamp <= contributeEndTime, "The investment period has already ended!");
        investors[msg.sender].isInvestor = true;
        investors[msg.sender].shares += msg.value;
        investorsArr.push(msg.sender);
        
        totalShares += msg.value;
        availabeAmout += msg.value;
        emit Deposite(msg.sender, msg.value);
    }
    
    function createProposal(string memory _name, uint _amount, address payable _recipient) external onlyInvestors() {
        require(_amount <= availabeAmout, "Dao has insufficient funds at the current time!");
        Proposal storage _proposal = proposals[nextProposalIds];
        _proposal.proposalExist = true;
        _proposal.propsalId = nextProposalIds;
        _proposal.proposalName = _name;
        _proposal.amount = _amount;
        _proposal.recipient = _recipient;
        _proposal.votingEndTime = block.timestamp + voteTimeLimit;
        
        availabeAmout -= _amount;
        nextProposalIds++;
    }
    
    function vote(uint _proposalId) external proposalExist(_proposalId) onlyInvestors() {
        require(block.timestamp <= proposals[_proposalId].votingEndTime, "Voting period has alredy ended!");
        require(votes[msg.sender][_proposalId] == false, "You have already voted for this proposal!");
        
        votes[msg.sender][_proposalId] = true;
        proposals[_proposalId].votesRecievedPerShare += investors[msg.sender].shares; 
    }
    
    function executeTransfer(uint _proposalId) external proposalExist(_proposalId) onlyAdmin() {
        Proposal storage _proposal = proposals[_proposalId];
        require(_proposal.executed == false, "The proposal has already been executed!");
        require(block.timestamp > _proposal.votingEndTime, "The voting for this proposal hasn't ended!");
        
        _proposal.executed = true;
        // uint votingPercent = _proposal.votesRecievedPerShare / totalShares * 100;
        uint _votingPercent = (_proposal.votesRecievedPerShare * 100) / totalShares ;
    
        if(_votingPercent >= quorum) {
            _proposal.proposalPassed = true;
            _transferAmount(_proposal.amount, _proposal.recipient);
        } else {
            _proposal.proposalPassed = false;
            availabeAmout += _proposal.amount;
        }
    }
    
    function _transferAmount(uint _amount, address payable _to) internal {
        require(_amount <= address(this).balance, "The Dao has insufficient funds!");
        _to.transfer(_amount);
        emit Transfer(msg.sender, _to, _amount);
    }
    
    // function emergencyExit(uint _amount, address payable _to) external onlyAdmin() {
    //     _to.transfer(_amount);
    //     emit Transfer(msg.sender, _to, _amount);
    // }
    
    //  propblem : 100(_totalAvailabeBalance) / 200(totalShares)  = 0
    // function emergencyExit() external onlyAdmin() {
    //     uint _totalAvailabeBalance = address(this).balance;
    //     require(_totalAvailabeBalance > 0, "The Dao contract does not have any funds");
        
    //     uint _amount;
    //     uint _perShareAmount = _totalAvailabeBalance / totalShares;    
            
    //     for(uint i = 0; i < investorsArr.length; i++) {
    //         if(investors[investorsArr[i]].shares > 0) {
    //             _amount = investors[investorsArr[i]].shares * _perShareAmount;
    //             payable(investorsArr[i]).transfer(_amount);
    //             emit Transfer(msg.sender, investorsArr[i], _amount);
    //         }
    //     }
    //     _totalAvailabeBalance = address(this).balance;
    //     if(_totalAvailabeBalance > 0) {
    //         msg.sender.transfer(_totalAvailabeBalance);
    //         emit Transfer(msg.sender, msg.sender, _totalAvailabeBalance)    ;
    //     }
    // }

    function getTimeStamp() external view returns(uint) {
        return block.timestamp;
    } 
    
    function balanceOf() external view returns(uint) {
        return address(this).balance;
    }
    
    //For ether returns of proposal investments
    receive() external payable {
        emit Deposite(msg.sender, msg.value);
    }
    
    modifier onlyInvestors() {
        require(investors[msg.sender].isInvestor == true, "Caller is not a investor!");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not  admin!");
        _;
    }
    
    modifier proposalExist(uint _proposalId) {
        require(proposals[_proposalId].proposalExist == true, "Proposal does not exist!");
        _;
    }
}