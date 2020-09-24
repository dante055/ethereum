pragma solidity 0.6.6;

// import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.6/VRFConsumerBase.sol";

import {GovernanceInterface} from "./Interface/GovernanceInterface.sol";
import {LotteryInterface} from "./Interface/LotteryInterface.sol";

// for kovan network

contract Randomness is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;
    GovernanceInterface public governance;

    // mapping (uint => uint) public randomNumber;
    mapping(bytes32 => uint256) public requestIds;
    uint256 public most_recent_random;

    constructor(address _governance)
        public
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088 // LINK Token
        )
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10**18; // 0.1 LINK
        governance = GovernanceInterface(_governance);
    }

    function getRandom(uint256 userProvidedSeed, uint256 lotteryId) public {
        require(
            LINK.balanceOf(address(this)) > fee,
            "Not enough LINK - fill contract with faucet"
        );
        bytes32 _requestId = requestRandomness(keyHash, fee, userProvidedSeed);
        requestIds[_requestId] = lotteryId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        uint256 lotteryId = requestIds[requestId];
        most_recent_random = randomness;
        // randomNumber[lotteryId] = randomness;

        LotteryInterface(governance.lottery()).fulfill_random(
            randomness,
            lotteryId
        );
    }
}
