pragma solidity 0.6.6;

import "https://github.com/smartcontractkit/chainlink/blob/develop/evm-contracts/src/v0.6/VRFConsumerBase.sol";

interface LotteryInterface {
    function fulfill_random(uint256, uint256) external;
}

interface GovernanceInterface {
    function lottery() external view returns (address);

    function randomness() external view returns (address);
}

contract Randomness is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;
    GovernanceInterface public governance;

    uint256 public most_recent_random;
    uint256 public currentLotteryId;
    bool public checkGetRunchecked;
    bool public checkFullfii;

    constructor(address _governance)
        public
        // constructor()
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088 // LINK Token
        )
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10**18; // 0.1 LINK
        governance = GovernanceInterface(_governance);
    }

    function reset() external {
        checkGetRunchecked = false;
        checkFullfii = false;
    }

    // function getRandom(uint256 userProvidedSeed, uint256 lotteryId) public {
    function getRandom(uint256 userProvidedSeed, uint256 _lotteryId) public {
        require(
            LINK.balanceOf(address(this)) > fee,
            "Not enough LINK - fill contract with faucet"
        );
        checkGetRunchecked = true;
        currentLotteryId = _lotteryId;
        requestRandomness(keyHash, fee, userProvidedSeed);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        checkFullfii = true;
        most_recent_random = randomness;
        LotteryInterface(governance.lottery()).fulfill_random(
            randomness,
            currentLotteryId
        );
    }
}
