pragma solidity ^0.6.0;

import 'CoinFlipOracle2.sol';

contract FlipperOracalize {
    enum GameState {noWager, wagerMade, wagerAccepted}
    GameState public currentState;
    uint public wager;
    address payable public player1;
    address payable public player2;
    
    address public oracaleConractAddress;
    
    address public owner;
    
    uint private seedBlockNumber;
    
    constructor() public {
        owner = msg.sender;
        currentState = GameState.noWager;
    }
    
    modifier onlyState(GameState expectedState) { 
        require(expectedState == currentState); 
        _;
    }
    
    modifier isOwner(address _owner) {
        require(owner == _owner);
        _;
    }
    
    function deployOraclizedContract() public isOwner(msg.sender) {
        require(oracaleConractAddress == address(0));
        oracaleConractAddress =  address(new CoinFlipOracle());
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
        CoinFlipOracle coinFlipInstance = CoinFlipOracle(oracaleConractAddress);
        
        string memory coinFlip = coinFlipInstance.coinFlip();
        string memory tail = "tails"; 
        
        if(keccak256(abi.encodePacked((coinFlip))) == keccak256(abi.encodePacked((tail)))) {
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