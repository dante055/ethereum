pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaign;

    function createCampaign(uint minimum) public {
       address newCampaign =  new Campaign(minimum, msg.sender);
       deployedCampaign.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns(address[]) {
        return deployedCampaign;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) votingApprovals;
    }

    Request[] public requests; //array of Request
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address creator) public {
        manager = creator;
        // manager = msg.sender;  // when call from other contract will be other contract not our user
        minimumContribution = minimum;
    }

    function contribute() public payable {
        // require(!approvers[msg.sender]);  if you want that sender conrtibutes only one time
        require(msg.value > minimumContribution);

        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            approversCount++;
        }
    }

    function createRequest(string description, uint value, address recipient) public restricted {
      // we can also check if the value is less than or equal to the amount n the contract
        Request memory newRequest = Request({
           description: description,
           value: value,
           recipient: recipient,
           complete: false,
           approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];
        // mark storage as we want to manipulte the copy of struct that is stored inside storage

        require(approvers[msg.sender]); // person has contributed
        require(!request.votingApprovals[msg.sender]); // person jas not voted yet on this request
        // require statement allow truth and reject false

        request.votingApprovals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public payable restricted {
        Request storage request = requests[index];

        require(!request.complete);
        require(request.approvalCount > (approversCount / 2));

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }
    // future modification : when request is completed remove from pending request and then add it in completed

    function getRequestsCount() public view returns (uint) {
      return requests.length;
    }
}
