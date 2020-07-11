pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

contract MultiSigWallet {
    address[] public approvers;
    mapping(address => bool) approversMap;
    uint256 public quorum;

    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }

    Transfer[] public transfers;
    mapping(address => mapping(uint256 => bool)) public approvals;

    constructor(address[] memory _approvers, uint256 _quorum) public {
        approvers = _approvers;
        quorum = _quorum;

        for (uint256 i = 0; i < _approvers.length; i++) {
            approversMap[_approvers[i]] = true;
        }
    }

    modifier onlyApprover() {
        require(approversMap[msg.sender] == true, "only approver are allowed");
        _;
    }

    function getApprovers() external view returns (address[] memory) {
        return approvers;
    }

    function createTransfer(uint256 _amount, address payable _to)
        external
        onlyApprover()
    {
        transfers.push(Transfer(transfers.length, _amount, _to, 0, false));
    }

    function getTransfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    function approveTransfer(uint256 _id) external onlyApprover() {
        require(transfers[_id].sent == false, "transfer has already been sent");
        require(
            approvals[msg.sender][_id] == false,
            "cannot approve transfer twice"
        );

        approvals[msg.sender][_id] = true;
        transfers[_id].approvals++;

        if (transfers[_id].approvals >= quorum) {
            transfers[_id].sent = true;
            address payable to = transfers[_id].to;
            uint256 amount = transfers[_id].amount;

            to.transfer(amount);
        }
    }

    receive() external payable {}
}
