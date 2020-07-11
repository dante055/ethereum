pragma solidity ^0.6.0;

contract Flipper {
    enum GameState {noWager, wagerMade, wagerAccepted}
    GameState public currentState;
    uint public wager;
    address payable public player1;
    address payable public player2;
    
    uint private seedBlockNumber;
    
    constructor() public {
        currentState = GameState.noWager;
    }
    
    modifier onlyState(GameState expectedState) { 
        require(expectedState == currentState); 
        _;
    }
    
    function makeWager() public onlyState(GameState.noWager) payable {
        require(msg.value >= 1 ether);
        wager = msg.value;
        player1 = msg.sender;
        currentState = GameState.wagerMade;
    }
     
    function acceptWager() public onlyState(GameState.wagerMade) payable {
        require(msg.value == wager);
        wager += msg.value;
        player2 = msg.sender;
        seedBlockNumber = block.number;
        currentState = GameState.wagerAccepted;
    }
    
    function resolveBet() public onlyState(GameState.wagerAccepted) {
        //  a 256 bit  integer can have 2^256 possible combination in binary code
        // so if we divide 2^256 / 2 we can get
        // defAULT 256 BIT integer
        // if we force convert block hash to uint it will be btw 0 to 1.1579209e+77
        // if we divide it by the 2 (1.1579209e+77/2) and get the middle then there is equal change to get 0 or 1
        // 6 sided dice = divide ny 6 then poibility is 1/6 times
        
        // ex: 0-4 --- 4/2 = 2 --- int(3/2)= 1 ---- int(1/2) = 0
        // 0-30 ---- 30/6= 5 --- 7/5 = 1
        // 0-60 --- 60/6 = 10 --- 7/10 = 0 --- 17/10 = 1 --- 57/10 = 5
        
        uint blockValue = uint256(blockhash(seedBlockNumber));
        uint FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
        uint coinFlip = uint(uint256(blockValue) / FACTOR);

        // or using linearS congruential ALGO
        //  coinFlip = uint8(uint256(keccak256(block.timestamp, block.difficulty))%2);
        
        if(coinFlip == 0) {
            player1.transfer(address(this).balance);
        } else {
            player2.transfer(address(this).balance);
        }
    
        wager = 0;
        player1 = address(0);
        player2 = address(0);
        currentState = GameState.noWager;
    }
}