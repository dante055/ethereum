// SPDX-License-Identifier:MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

contract Factory2 {
    address public factoryOwner;
    address[] private walletAddresses;

    constructor() public {
        factoryOwner = msg.sender;
    }

    function createMultiSigWallet(
        address[] calldata _approvers,
        uint256 _quorum
    ) external {
        require(
            _quorum <= _approvers.length,
            "quorum should be less than or equal to the no of approvers"
        );
        MultiSigWallet2 newWallet = new MultiSigWallet2(
            _approvers,
            _quorum,
            msg.sender
        );

        walletAddresses.push(address(newWallet));
    }

    function getAllWalletAddress() external view returns (address[] memory) {
        return walletAddresses;
    }
}

contract MultiSigWallet2 {
    address public walletOwner;
    address[] public approvers;
    uint256 public quorum;

    struct Transfer {
        uint256 _id;
        uint256 _amount;
        address _from;
        address payable _to;
        uint256 _noOfApprovals;
        bool _tranferCompleted;
    }
    Transfer[] public transfers;

    mapping(address => bool) public approversMap;

    mapping(address => mapping(uint256 => bool))
        public approversAppoveTransferMap;

    event DepositeEvent(address indexed, uint256);
    event TransferEvent(
        uint256 indexed,
        address indexed,
        address indexed,
        uint256
    );

    constructor(
        address[] memory _approvers,
        uint256 _quorum,
        address _owner
    ) public {
        walletOwner = _owner;
        approvers = _approvers;
        quorum = _quorum;

        for (uint256 i = 0; i < _approvers.length; i++) {
            require(
                approversMap[_approvers[i]] == false,
                "Same address cant become approver multiple times!"
            );
            approversMap[_approvers[i]] = true;
        }

        require(
            approversMap[_owner] == true,
            "You forgot to add your own address to approvers array!"
        );
    }

    function createTransfer(address payable _to, uint256 _amount)
        external
        isApprover
        haveBalance(_amount)
    {
        transfers.push(
            Transfer(transfers.length, _amount, msg.sender, _to, 0, false)
        );
    }

    function approveTransfer(uint256 _transferId)
        external
        isApprover
        haveBalance(transfers[_transferId]._amount)
    {
        require(
            transfers[_transferId]._tranferCompleted == false,
            "Transfer has already been sent!"
        );
        require(
            approversAppoveTransferMap[msg.sender][_transferId] == false,
            "You have already approved this transfer!"
        );

        transfers[_transferId]._noOfApprovals++;
        approversAppoveTransferMap[msg.sender][_transferId] = true;

        if (transfers[_transferId]._noOfApprovals >= quorum) {
            transfers[_transferId]._tranferCompleted = true;
            transfers[_transferId]._to.transfer(transfers[_transferId]._amount);
            emit TransferEvent(
                _transferId,
                transfers[_transferId]._from,
                transfers[_transferId]._to,
                transfers[_transferId]._amount
            );
        }
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function getAllApprovers() external view returns (address[] memory) {
        return approvers;
    }

    function getAllTransfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    modifier isApprover() {
        require(approversMap[msg.sender] == true, "Caller is not approver!");
        _;
    }

    modifier haveBalance(uint256 _amount) {
        require(
            address(this).balance >= _amount,
            "The contract has not suffecient balance left!"
        );
        _;
    }

    receive() external payable isApprover {
        emit DepositeEvent(msg.sender, msg.value);
    }
}
