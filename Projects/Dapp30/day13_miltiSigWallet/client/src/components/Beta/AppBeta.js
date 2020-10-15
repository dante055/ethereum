import React, { Component } from 'react';
import Navigation from './Navigation';
import Home from './Home';
import CreateWallet from './CreateWallet';
import Wallets from './Wallets';
import Wallet from './Wallet';
import Error from './Error';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      path: [],
    };
  }

  async componentDidMount() {
    const { factoryContract } = this.props;
    const walletAddresses = await factoryContract.methods
      .getAllWalletAddress()
      .call();
    const path = walletAddresses.map((address) => {
      return `/wallet/${address}`;
    });
    console.log(path);
    this.setState({ path });
  }

  render() {
    // console.log(this.props);
    const { factoryContract, factoryOwner, accounts, web3 } = this.props;
    const { path } = this.state;
    return (
      <Router>
        <div className="App">
          <Navigation />
          <Switch>
            <Route
              path="/"
              exact
              component={(match) => (
                <Home
                  factoryContract={factoryContract}
                  factoryOwner={factoryOwner}
                  accounts={accounts}
                  match={match}
                />
              )}
            />
            <Route
              path="/create"
              exact
              component={(match) => (
                <CreateWallet
                  factoryContract={factoryContract}
                  accounts={accounts}
                  updateAddress={this.updateAddress}
                  match={match}
                />
              )}
            />
            <Route
              path="/wallet"
              exact
              component={(match) => (
                <Wallets
                  factoryContract={factoryContract}
                  factoryOwner={factoryOwner}
                  accounts={accounts}
                  match={match}
                />
              )}
            />
            <Route
              path={path}
              exact
              strict
              component={(match) => (
                <Wallet web3={web3} accounts={accounts} match={match} />
              )}
            />
            <Route component={Error} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App; 
