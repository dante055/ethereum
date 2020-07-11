import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.checkForWinner = this.checkForWinner.bind(this);
  }

  state = {
    PLAYER_ONE_SYMBOL: 'X',
    PLAYER_TWO_SYMBOL: 'O',
    currentTurn: 'X',
    board: ['', '', '', '', '', '', '', '', ''],
    winner: ''
  };

  handleClick(index) {
    if (this.state.board[index] === '') {
      this.state.board[index] = this.state.currentTurn;
      this.setState({
        currentTurn:
          this.state.currentTurn === this.state.PLAYER_ONE_SYMBOL
            ? this.state.PLAYER_TWO_SYMBOL
            : this.state.PLAYER_ONE_SYMBOL
      });

      if (this.checkForWinner()) {
        if (this.state.currentTurn === 'X') {
          this.setState({ winner: 'player 1' });
        } else {
          this.setState({ winner: 'player 2' });
        }
      }
    } else {
      alert('NOT YOUR TURN!!');
    }
  }

  checkForWinner() {
    var boardState = this.state.board;
    var winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    return winningCombos.find(combo => {
      if (
        boardState[combo[0]] === boardState[combo[1]] &&
        boardState[combo[1]] === boardState[combo[2]]
      ) {
        return boardState[combo[0]];
      } else {
        return false;
      }
    });
  }

  render() {
    return (
      <div className="board">
        {this.state.board.map((cell, index) => {
          return (
            <div
              onClick={() => this.handleClick(index)}
              data-cell-id={index}
              key={index}
              className="square"
            >
              {cell}
            </div>
          );
        })}

        {this.state.winner != '' ? (
          <p> {alert(this.state.winner + ' won the game!')}</p>
        ) : null}
      </div>
    );
  }
}

export default App;
