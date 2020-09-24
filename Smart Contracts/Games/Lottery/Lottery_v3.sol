pragma solidity ^0.6.6;

// import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.6/ChainlinkClient.sol";

import {GovernanceInterface} from "./Interface/GovernanceInterface.sol";
import {RandomnessInterface} from "./Interface/RandomnessInterface.sol";

contract Lottert_V2 is ChainlinkClient {
    address public admin;
    GovernanceInterface public governance;

    // Alarm stuff
    uint256 public ORACLE_PAYMENT;
    address CHAINLINK_ALARM_ORACLE;
    bytes32 CHAINLINK_ALARM_JOB_ID;
    mapping(bytes32 => uint256) public alarmRequestIds;

    enum LOTTERY_STATE {OPEN, CLOSED, CALCULATING_WINNER}
    struct Lottery {
        uint256 id;
        uint256 minEnteryAmount;
        uint256 maxEnteryAmount;
        address[] contestents;
        mapping(address => bool) constantEnter;
        uint256 pricePool;
        uint256 lotteryEndTime;
        address winner;
        LOTTERY_STATE lotteryState;
    }

    mapping(uint256 => Lottery) private lotteryDetails;
    uint256 private lotteryId = 1;

    constructor(address _governance) public {
        setPublicChainlinkToken();
        admin = msg.sender;
        governance = GovernanceInterface(_governance);

        // kovan network
        ORACLE_PAYMENT = 0.1 * 10**18;
        CHAINLINK_ALARM_ORACLE = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
        CHAINLINK_ALARM_JOB_ID = "a7ab70d561d34eb49e9b1612fd2e044b";
    }

    // create new lottery only if prvious is over
    function createLottery(
        uint256 _lotteryEndTime,
        uint256 _minEnteryAmount,
        uint256 _maxEnteryAmount
    ) public onlyAdmin() {
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
        lotteryDetails[lotteryId].lotteryState = LOTTERY_STATE.OPEN;
        lotteryDetails[lotteryId].minEnteryAmount = _minEnteryAmount;
        lotteryDetails[lotteryId].maxEnteryAmount = _maxEnteryAmount;
        lotteryDetails[lotteryId].lotteryEndTime =
            _lotteryEndTime +
            block.timestamp;

        // set alarm
        Chainlink.Request memory req = buildChainlinkRequest(
            CHAINLINK_ALARM_JOB_ID,
            address(this),
            this.fulfill_alarm.selector
        );
        req.addUint("until", block.timestamp + _lotteryEndTime);
        bytes32 requestId = sendChainlinkRequestTo(
            CHAINLINK_ALARM_ORACLE,
            req,
            ORACLE_PAYMENT
        );
        alarmRequestIds[requestId] = lotteryId;

        lotteryId++;
    }

    function fulfill_alarm(bytes32 _requestId)
        public
        recordChainlinkFulfillment(_requestId)
    {
        uint256 _lotteryId = alarmRequestIds[_requestId];

        require(
            lotteryDetails[_lotteryId].lotteryState == LOTTERY_STATE.OPEN,
            "The lottery hasn't even started!"
        );

        lotteryDetails[_lotteryId].lotteryState = LOTTERY_STATE
            .CALCULATING_WINNER;
        pickWinner(_lotteryId);
    }

    function pickWinner(uint256 _lotteryId) private lotteryExist(_lotteryId) {
        require(
            lotteryDetails[_lotteryId].lotteryState ==
                LOTTERY_STATE.CALCULATING_WINNER,
            "Lottery winner calculation has not started yet!!"
        );
        require(
            lotteryDetails[_lotteryId].winner != address(0),
            "Winner for this lottery has already been choosen!!"
        );
        RandomnessInterface(governance.randomness()).getRandom(
            _lotteryId,
            _lotteryId
        );
    }

    function fulfill_random(uint256 randomness, uint256 _lotteryId) external {
        require(
            msg.sender == governance.randomness(),
            "Can only be called from the randomess contract!!"
        );
        require(
            lotteryDetails[_lotteryId].lotteryState ==
                LOTTERY_STATE.CALCULATING_WINNER,
            "You aren't at that stage yet!"
        );
        require(randomness > 0, "random-not-found");
        Lottery storage _lottery = lotteryDetails[_lotteryId];

        uint256 randomNo = randomness % _lottery.contestents.length;
        address winnerAddress = _lottery.contestents[randomNo];
        _lottery.winner = winnerAddress;
        _lottery.lotteryState = LOTTERY_STATE.CLOSED;

        payable(winnerAddress).transfer(_lottery.pricePool);
    }

    function enterInLottery(uint256 _lotteryId)
        external
        payable
        lotteryExist(_lotteryId)
    {
        Lottery storage _lottery = lotteryDetails[_lotteryId];
        require(
            block.timestamp < _lottery.lotteryEndTime &&
                _lottery.lotteryState == LOTTERY_STATE.OPEN,
            "Lottery with this id is not active!!"
        );
        require(
            msg.value >= _lottery.minEnteryAmount &&
                msg.value <= _lottery.maxEnteryAmount,
            "You are not sending the minimun amount to enter in the lottery!!"
        );
        require(
            msg.value == _lottery.minEnteryAmount,
            "To enterInLottery u require to pay entry ammount!!"
        );

        _lottery.pricePool += msg.value;

        if (!_lottery.constantEnter[msg.sender]) {
            _lottery.contestents.push(msg.sender);
            _lottery.constantEnter[msg.sender] = true;
        }
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
            LOTTERY_STATE
        )
    {
        return (
            lotteryDetails[_lotteryId].minEnteryAmount,
            lotteryDetails[_lotteryId].pricePool,
            lotteryDetails[_lotteryId].lotteryEndTime,
            lotteryDetails[_lotteryId].contestents.length,
            lotteryDetails[_lotteryId].lotteryState
        );
    }

    function seeWinnerDerails(uint256 _lotteryId)
        external
        view
        lotteryExist(_lotteryId)
        returns (uint256, address)
    {
        require(
            block.timestamp > lotteryDetails[_lotteryId].lotteryEndTime &&
                lotteryDetails[_lotteryId].lotteryState == LOTTERY_STATE.CLOSED,
            "Lottery with this id is still active!!"
        );

        return (
            lotteryDetails[_lotteryId].pricePool,
            lotteryDetails[_lotteryId].winner
        );
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
}
