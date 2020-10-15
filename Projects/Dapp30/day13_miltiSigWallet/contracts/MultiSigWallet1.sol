// SPDX-License-Identifier:MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

contract Factory1 {
    address public factoryOwner;
    address[] private walletAddresses;

    constructor() public {
        factoryOwner = msg.sender;
    }

    function createMultiSigWallet() external payable {
        MultiSigWallet1 newWallet = new MultiSigWallet1(msg.value, msg.sender);

        walletAddresses.push(address(newWallet));

        payable(newWallet).transfer(msg.value);
    }

    function getAllWalletAddress() external view returns (address[] memory) {
        return walletAddresses;
    }
}

contract MultiSigWallet1 {
    address public walletOwner;
    uint256 public minLockingAmount;

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
    uint256 public noOfApprovers;

    mapping(address => mapping(uint256 => bool))
        public approversAppoveTransferMap;

    event DepositeEvent(address indexed, uint256);
    event TransferEvent(
        uint256 indexed,
        address indexed,
        address indexed,
        uint256
    );

    constructor(uint256 _minLockingAmount, address _owner) public {
        walletOwner = _owner;
        minLockingAmount = _minLockingAmount;

        approversMap[_owner] = true;
        noOfApprovers++;
    }

    function becomeApprover() external payable {
        require(
            msg.value >= minLockingAmount,
            "More eth needed to be locked in order to become approver!"
        );

        approversMap[msg.sender] = true;
        noOfApprovers++;
    }

    function unBecomeApprover() external isApprover {
        approversMap[msg.sender] = false;
        msg.sender.transfer(minLockingAmount);
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
            "You have already approved this transfer"
        );
        transfers[_transferId]._noOfApprovals++;
        approversAppoveTransferMap[msg.sender][_transferId] = true;

        if (transfers[_transferId]._noOfApprovals >= noOfApprovers / 2 + 1) {
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

    function confirmTransfer(uint256 _transferId)
        external
        haveBalance(transfers[_transferId]._amount)
    {
        require(
            transfers[_transferId]._tranferCompleted == false,
            "Transfer has already been sent!"
        );
        require(
            approversMap[msg.sender] == true ||
                msg.sender == transfers[_transferId]._from ||
                msg.sender == transfers[_transferId]._to,
            "Caller can be either approver, sender, or recipient"
        );

        if (transfers[_transferId]._noOfApprovals >= noOfApprovers / 2 + 1) {
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

    function getAllTransfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    modifier isApprover() {
        require(approversMap[msg.sender] == true, "Caller is not approver!");
        _;
    }

    modifier haveBalance(uint256 _amount) {
        require(
            address(this).balance >=
                (_amount + (noOfApprovers * minLockingAmount)),
            "The contract has not suffecient balance left after locking eth!"
        );
        _;
    }

    receive() external payable isApprover {
        emit DepositeEvent(msg.sender, msg.value);
    }
}
