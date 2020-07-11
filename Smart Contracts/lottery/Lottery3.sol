pragma solidity ^0.6.0;
// pragma experimental ABIEncoderV2;

import "PickWinnerContract.sol";

contract Lottery2 {
    address public manager;
    uint public lotteryRegistrationCost;
    uint public totalPlayersAllowed;
    // uint public lotteryDurationLeft;
    
    struct map {
        mapping(address => bool) playersMap;
    }
    
    mapping(uint => map) mappingStruct ;
    address[] playersArray;
    uint public winningPrize;
    uint public lotteryCounter;
    
    address public addressPickWinner;
    
    constructor(uint _lotteryRegistrationCost, uint _totalPlayersAllowed) public {
        lotteryRegistrationCost = _lotteryRegistrationCost;
        totalPlayersAllowed = _totalPlayersAllowed;
        // lotteryDurationLeft = now + ( _lotteryDurationInWeeks  * 1 weeks );
        
         addressPickWinner =  address(new PickWinnerContract());
    }
    
    function enter() external payable{
        // require(now < lotteryDurationLeft, "this lottery is over wait for next one");
        require(msg.value == (lotteryRegistrationCost * 1 ether)  , 'minimum money stake requirement not met');
        address sender = msg.sender;
        require(!mappingStruct[lotteryCounter].playersMap[sender], 'player has alreary entered the lottry once');
        
        winningPrize += msg.value;
        mappingStruct[lotteryCounter].playersMap[sender] = true;
        playersArray.push(msg.sender);
        
        if(totalPlayersAllowed == playersArray.length) {
            pickWnner();
        }
    }
    
    function pickWnner() internal {
        PickWinnerContract instance = PickWinnerContract(addressPickWinner);
        
        // // learn how to concatenate string and unit to use totalPlayersAllowed
        // // and learn how to use ethereum alarm clock to schedule transaction after a fixed perid of time 
        // // btw 0 to n-1
        string memory str = 'random number between 0 and 2'; // for 3 players
        uint winnerIndex = instance.pickRandomWinner(str);
        
        payable(playersArray[winnerIndex]).transfer(address(this).balance);
        playersArray =  new address[](0);
        winningPrize = 0;
        lotteryCounter++;
    }
    
    function destroy() external {
        selfdestruct(payable(manager));
    }
    
}