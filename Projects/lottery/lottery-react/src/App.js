import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { web3, enableWb3 } from './getWeb3';
// import getWeb3 from './getWeb3';
import lottery from './lottery';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  componentDidMount = async () => {
    await enableWb3(); // for only first time

    const manager = await lottery.methods.manager().call(); // we font specifi { from : } whren working with metamask as default account is already set
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });

    // const web3 = await getWeb3();
    // console.log(web3.version);
    // web3.eth.getAccounts().then(console.log);
  };

  onSubmit = async event => {
    event.preventDefault(); //form doesnot submit on its owns
    //automatically 'this' is set to equal to our component dur to the create-react-app babel version other whise we use this.onSubmit.bind(this)

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transation success...' });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value)
    });

    this.setState({ message: 'You have been entered' });
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transation success...' });

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked' });
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is manage by {this.state.manager}</p>
        <p>
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')}
          ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Ammount of ther to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h4>Ready to pick a winner</h4>
        <button onClick={this.onClick}>Pick Winner!</button>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
