pragma solidity ^0.6.6;

interface RandomnessInterface {
    function randomNumber(uint256) external view returns (uint256);

    function getRandom(uint256, uint256) external;
}

interface GovernanceInterface {
    function lottery() external view returns (address);

    function randomness() external view returns (address);
}

contract Lottert_V3 {
    address public admin;
    GovernanceInterface public governance;

    uint256 public most_recent_random;
    uint256 public randomNo;
    bool public checkWinner;
    bool public checkFullfill;

    struct Lottery {
        uint256 id;
        uint256 minEnteryAmount;
        address[] contestents;
        mapping(address => bool) constantEnter;
        uint256 pricePool;
        uint256 lotteryEndTime;
        address winner;
    }

    mapping(uint256 => Lottery) private lotteryDetails;
    uint256 lotteryId = 1;

    constructor(address _governance) public {
        admin = msg.sender;
        governance = GovernanceInterface(_governance);
    }

    function createLottery(uint256 _lotteryEndTime, uint256 _minEnteryAmount)
        external
        onlyAdmin()
    {
        require(
            _lotteryEndTime > 0,
            "Lottery end time shoud be greater than now."
        );
        require(
            _minEnteryAmount > 0,
            "Minimun entry ammount should be greater than zero!!"
        );
        if (lotteryId > 1) {
            require(
                block.timestamp >
                    lotteryDetails[lotteryId - 1].lotteryEndTime &&
                    lotteryDetails[lotteryId - 1].winner != address(0),
                "Previons lottery is still active or lottery has finished and u didnt hace choose winner yet!!"
            );
        }

        lotteryDetails[lotteryId].id = lotteryId;
        lotteryDetails[lotteryId].minEnteryAmount = _minEnteryAmount;
        lotteryDetails[lotteryId].lotteryEndTime =
            _lotteryEndTime +
            block.timestamp;

        lotteryId++;
    }

    function enterInLottery(uint256 _lotteryId)
        external
        payable
        lotteryExist(_lotteryId)
    {
        Lottery storage _lottery = lotteryDetails[_lotteryId];
        require(
            msg.value == _lottery.minEnteryAmount,
            "To enterInLottery u require to pay entry ammount!!"
        );
        _lottery.pricePool += msg.value;
        // if (!_lottery.constantEnter[msg.sender]) {
        _lottery.contestents.push(msg.sender);
        //   _lottery.constantEnter[msg.sender] = true;
        // }
    }

    function ranage(uint256 _lotteryId)
        external
        view
        lotteryExist(_lotteryId)
        returns (uint256)
    {
        return lotteryDetails[_lotteryId].contestents.length;
    }

    function seeLotteryDetails(uint256 _lotteryId)
        external
        view
        lotteryExist(_lotteryId)
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        bool _lotteryActive;
        if (block.timestamp < lotteryDetails[_lotteryId].lotteryEndTime) {
            _lotteryActive = true;
        }

        return (
            lotteryDetails[_lotteryId].minEnteryAmount,
            lotteryDetails[_lotteryId].pricePool,
            lotteryDetails[_lotteryId].lotteryEndTime,
            lotteryDetails[_lotteryId].contestents.length,
            _lotteryActive
        );
    }

    function reset() external {
        checkWinner = false;
        checkFullfill = false;
    }

    function pickWinner(uint256 _seed, uint256 _lotteryId)
        public
        lotteryExist(_lotteryId)
    {
        checkWinner = true;
        RandomnessInterface(governance.randomness()).getRandom(
            _seed,
            _lotteryId
        );
    }

    function fulfill_random(uint256 randomness, uint256 _lotteryId) external {
        checkFullfill = true;
        most_recent_random = randomness;
        randomNo = randomness % lotteryDetails[_lotteryId].contestents.length;
        lotteryDetails[_lotteryId].winner = lotteryDetails[_lotteryId]
            .contestents[randomNo];
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin!!");
        _;
    }

    modifier lotteryExist(uint256 _lotteryId) {
        require(
            _lotteryId > 0 && _lotteryId <= lotteryId,
            "Lottery with this id does not exit!!"
        );
        _;
    }

    modifier lotteryActive(uint256 _lotteryId) {
        require(
            block.timestamp < lotteryDetails[_lotteryId].lotteryEndTime,
            "Lottery with this id has already been over!!"
        );
        _;
    }
}
