// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

/* 
    we have tried to store the move value safely by storing the hash
    but remember that the input can also be decoded so it is not totaly safe
    in v2 we will change the input bu the hash value
*/

contract RockPaperScissors_v1 {
    enum State {NOT_CREATED, CREATED, JOINED, COMMITED, REVEALED}

    struct Game {
        uint bet;   // individual betting amount
        // uint pricePool;
        address[2] players;
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

    function createGame(address _player2) external payable inState(gameId, State.NOT_CREATED) {
        require(msg.value > 0, "Send some eth to lock as the betting amount!!");
        require(msg.sender != _player2, "Player1 and Player2 address cant be same!!");
        
        address[2] memory _players;
        _players[0] = msg.sender;
        _players[1] = _player2;

        // game[gameId] = Game(msg.value, msg.value, _players, State.CREATED, address(0));
        game[gameId] = Game(msg.value, _players, State.CREATED, address(0));
        gameId++;     
    }

    function joineGame(uint _gameId) external payable inState(_gameId, State.CREATED){
        Game storage _game = game[_gameId];
        require(msg.value == _game.bet, "You are not sending the exact betting amount, recheck the betting amount once!!");

        // _game.pricePool += msg.value;
        _game.state = State.JOINED;
    }

    function commitMove(uint _gameId, uint _moveValue, string memory _salt) 
        external 
        onlyPlayer(_gameId)
        inState(_gameId, State.JOINED)
        validMoves(_moveValue)
    {
        require(moves[_gameId][msg.sender].hash == 0, "You have already made you move!!");

        moves[_gameId][msg.sender].hash = keccak256(abi.encodePacked(_moveValue, _salt));

        Game storage _game = game[_gameId];
        if(moves[_gameId][_game.players[0]].hash != 0 &&
         moves[_gameId][_game.players[0]].hash != 0) {
            _game.state = State.COMMITED;
        }
    }

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
