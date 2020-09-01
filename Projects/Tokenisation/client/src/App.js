import React, { Component } from 'react';
import Tokens from './contracts/MyToken.json';
import TokenSale from './contracts/MyTokenSale.json';
import KycContract from './contracts/KycContract.json';
import getWeb3 from './getWeb3.js';

import './App.css';

class App extends Component {
  state = {
    loaded: false,
    kycAddress: '0x123...',
    tokenSaleAddress: '',
    userTokens: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      const tokensDeployedNetwork = Tokens.networks[this.networkId];
      this.TokensInstance = new this.web3.eth.Contract(
        Tokens.abi,
        tokensDeployedNetwork && tokensDeployedNetwork.address
      );

      const tokenSaleDeployedNetwork = TokenSale.networks[this.networkId];
      this.TokenSaleInstance = new this.web3.eth.Contract(
        TokenSale.abi,
        tokenSaleDeployedNetwork && tokenSaleDeployedNetwork.address
      );

      const KycContractDeployedNetwork = KycContract.networks[this.networkId];
      this.KycContractInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContractDeployedNetwork && KycContractDeployedNetwork.address
      );

      this.listenToTokenTransfer();
      this.setState(
        {
          loaded: true,
          tokenSaleAddress: this.TokenSaleInstance._address,
        },
        this.updateUserTokens
      );
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  listenToTokenTransfer = () => {
    this.TokensInstance.events
      .Transfer({ to: this.accounts[0] })
      .on('data', this.updateUserTokens);
  };

  handleBuyTokens = async () => {
    await this.TokenSaleInstance.methods.buyTokens(this.accounts[0]).send({
      from: this.accounts[0],
      value: this.web3.utils.toWei('1', 'wei'),
    });
  };

  updateUserTokens = async () => {
    let userTokens = await this.TokensInstance.methods
      .balanceOf(this.accounts[0])
      .call();
    this.setState({ userTokens });
  };

  handleKycSubmit = async () => {
    const { kycAddress } = this.state;
    await this.KycContractInstance.methods
      .setKycCompleted(kycAddress)
      .send({ from: this.accounts[0] });
    alert('Account ' + kycAddress + ' is now whitelisted.');
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>StarBugs Cappucino Tokens Sale</h1>
        <h2>Enable your account</h2>
        Allowed to allow:{' '}
        <input
          type="text"
          name="kycAddress"
          value={this.state.kycAddress}
          onChange={(event) =>
            this.setState({ kycAddress: event.target.value })
          }
        />
        &nbsp;
        <button type="button" onClick={this.handleKycSubmit}>
          Add Address to whitelist!
        </button>
        <h2>Buy Cappucino Tokens</h2>
        <p>
          Send Ether to this address: <b>{this.state.tokenSaleAddress}</b>
        </p>
        <p>
          You have <b> {this.state.userTokens}</b> CAPPU tokens
        </p>
        <button type="button" onClick={this.handleBuyTokens}>
          Buy more tokens!
        </button>
      </div>
    );
  }
}

export default App;
