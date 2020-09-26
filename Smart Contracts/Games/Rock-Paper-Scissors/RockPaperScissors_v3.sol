// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

/*
    we will add a timer so that if the player doesnt reveal the move with in the time limit
    the funds will transfer to the player who haver revealed it
    if both havent reveald it then the funds with be given back to both
*/

contract RockPaperScissors_v1 {
    enum State {NOT_CREATED, CREATED, JOINED, COMMITED, REVEALED, CLOSED}

    struct Game {
        uint bet;   // individual betting amount
        // uint pricePool;
        address[2] players;
        uint timeLimit; // starts after the creation
        State state;
        address winner;
    }

    struct Move {
        bytes32 hash;
        uint256 moveValue;
    }

    mapping(uint256 => Game) public game;
    mapping(uint256 => mapping(address => Move)) public moves;
    mapping(uint256 => uint256) public winningMoves; // 1: rock, 2: paper, 3: scissors
    uint256 gameId;

    constructor() {
        winningMoves[1] = 3;    // rock : scissors
        winningMoves[2] = 1;    // paper: rock
        winningMoves[3] = 2;    // scissors: paper
    }

    function createGame(address _player2, uint _timeLimit) external payable inState(gameId, State.NOT_CREATED) {
        require(msg.value > 0, "Send some eth to lock as the betting amount!!");
        require(msg.sender != _player2, "Player1 and Player2 address cant be same!!");
        
        address[2] memory _players;
        _players[0] = msg.sender;
        _players[1] = _player2;

        // game[gameId] = Game(msg.value, msg.value, _players, State.CREATED, address(0));
        game[gameId] = Game(msg.value, _players, block.timestamp + _timeLimit, State.CREATED, address(0));
        gameId++;     
    }

    function joineGame(uint _gameId) external payable inState(_gameId, State.CREATED){
        Game storage _game = game[_gameId];
        require(_game.timeLimit > block.timestamp, "TimeLimit for this game is over!!");
        require(msg.value == _game.bet, "You are not sending the exact betting amount, recheck the betting amount once!!");

        // _game.pricePool += msg.value;
        _game.state = State.JOINED;
    }

    // checking of valid move values will be done in the frontend
    // we can handle salt in 2 ways either ask the userto remember it (prefered) or u youself handle creating and storing it securey
    
    // calculate move hash in the front end
    // _moveHash = keccak256(abi.encodePacked(_moveValue, _salt)) 
    // web3.utils.soliditySha3Raw(param1 [, param2, ...])
    function commitMove(uint _gameId, bytes32 _moveHash) 
        external 
        onlyPlayer(_gameId)
        inState(_gameId, State.JOINED)
    {
        Game storage _game = game[_gameId];
        require(_game.timeLimit > block.timestamp, "TimeLimit for this game is over!!");
        require(moves[_gameId][msg.sender].hash == 0, "You have already made you move!!");

        moves[_gameId][msg.sender].hash = _moveHash;

        if(moves[_gameId][_game.players[0]].hash != 0 &&
         moves[_gameId][_game.players[0]].hash != 0) {
            _game.state = State.COMMITED;
        }
    }

    // now send the _moveValue and the _salt and caclulate has and compare it with mve hash
    // you can remember _moveValue and salt in the the front end so u dont have to reenter it
    function revealMove(uint _gameId, uint _moveValue, string memory _salt)
        external 
        onlyPlayer(_gameId)
        inState(_gameId, State.COMMITED)
        validMoves(_moveValue) 
    {
        require(moves[_gameId][msg.sender].hash == keccak256(abi.encodePacked(_moveValue, _salt)), "You moveId or salt does not match with commitment!!");
        require(moves[_gameId][msg.sender].moveValue == 0, "You have already reveal you move!!");

        moves[_gameId][msg.sender].moveValue = _moveValue;

        Game storage _game = game[_gameId];
        uint _move1 = moves[_gameId][_game.players[0]].moveValue;
        uint _move2 = moves[_gameId][_game.players[1]].moveValue;

        if(_move1 != 0 &&_move2 != 0) {
            _game.state = State.REVEALED;

            // draw
            if(_move1 == _move2) {
                payable(_game.players[0]).transfer(_game.bet);
                payable(_game.players[1]).transfer(_game.bet);
                return;
            }

            address _winner = winningMoves[_move1] == _move2 ? _game.players[0] : _game.players[1];
            _game.winner = _winner;
            payable(_winner).transfer(2 * _game.bet);
        }
    }

    // players can run it when the time limit is over
    function refund(uint _gameId) external onlyPlayer(_gameId) {
        Game storage _game = game[_gameId];
        require(block.timestamp > _game.timeLimit , "TimeLimit for this game isnt over yet!!");
        require(_game.state != State.REVEALED, "Winner for this game have been choosen!!");
        require(_game.state != State.CLOSED, "Reund for this game has alreay been done!!");

        Move storage _move1 = moves[_gameId][_game.players[0]];
        Move storage _move2 = moves[_gameId][_game.players[1]];

        _game.state == State.CLOSED; // so that they cant call this function again

        if(_move1.hash != 0 && _move2.hash !=0) {
            // both have commited check who havent revealed
            if(_move1.moveValue == 0 && _move2.moveValue == 0) {
                // both havent revealed so refund to both
                payable(_game.players[0]).transfer(_game.bet);
                payable(_game.players[1]).transfer(_game.bet);
            } else if(_move2.moveValue == 0) {
                // player 2 hasnet revelet to player1 win by default
                payable(_game.players[0]).transfer(2 * _game.bet);
            } else if(_move1.moveValue == 0) {
                // player 1 hasnet revelet to player2 win by default
                payable(_game.players[1]).transfer(2 * _game.bet);
            }
        } else if (_move1.hash != 0) {
            // player one has commited
            payable(_game.players[0]).transfer(_game.bet);
        } else if (_move2.hash != 0) {
            // player2 has commited
            payable(_game.players[1]).transfer(_game.bet);
        }
    }

    modifier inState(uint _gameId, State _state) {
        require(game[_gameId].state == _state, "The game is not in required state!!");
        _;
    }

    modifier onlyPlayer(uint _gameId) {
        require(msg.sender == game[_gameId].players[0] || msg.sender == game[_gameId].players[1], "You are not a registerd player for this game!!");
        _;
    }

    modifier validMoves(uint _moveValue) {
        require(_moveValue == 1 || _moveValue == 2 || _moveValue == 3, "You are inputing an unregistered move, (registerd moves: 1, 2, 3)!!");
        _;
    }
}
