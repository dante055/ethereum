import React, { Component } from 'react';
import Navigation from './Navigation';
import Home from './Home';
import CreateWallet from './CreateWallet';
import Wallets from './Wallets';
import Wallet from './Wallet';
import Error from './Error';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      walletAddresses: [],
      path: [],
      approversInput: '',
      quorumInput: '',
      alert: '',
      newWalletAddresss: '',
      showAlert: false,
      shouldReset: false,
      isCreating: false,
    };
  }

  async componentDidMount() {
    const { factoryContract } = this.props;
    const walletAddresses = await factoryContract.methods
      .getAllWalletAddress()
      .call();
    const path = walletAddresses.map(address => {
      return `/wallet/${address}`;
    });
    this.setState({ walletAddresses, path });
  }

  // reset = () => {
  //   this.setState({
  //     showAlert: false,
  //     approversInput: '',
  //     quorumInput: '',
  //   });
  // };

  createMultisigWallet = async (approvers, quorum) => {
    this.setState({
      showAlert: false,
      isCreating: true,
      approversInput: approvers.toString(),
      quorumInput: quorum,
    });
    const { factoryContract, accounts } = this.props;
    let walletAddresses;
    let isWalletCreated;
    let newWalletAddresss;
    let path;
    try {
      await factoryContract.methods
        .createMultiSigWallet(approvers, quorum)
        .send({ from: accounts[0] });

      walletAddresses = await factoryContract.methods
        .getAllWalletAddress()
        .call();
      path = walletAddresses.map(address => {
        return `/wallet/${address}`;
      });
      newWalletAddresss = walletAddresses[walletAddresses.length - 1];
      isWalletCreated = true;
    } catch (error) {
      console.log(error);
      isWalletCreated = false;
    }
    const alertClass = isWalletCreated ? 'success' : 'danger';
    const alertMessage = isWalletCreated
      ? `Successfully created wallet at address ${newWalletAddresss} !!`
      : 'Something went wrong see console for more info!!';
    const alert = (
      <Alert variant={alertClass} className='mt-2'>
        {alertMessage}
      </Alert>
    );
    this.setState({
      walletAddresses,
      path,
      newWalletAddresss,
      isCreating: false,
      showAlert: true,
      alert,
      shouldReset: true,
    });
  };

  render() {
    console.log('parent');
    const { factoryOwner, accounts, web3 } = this.props;
    const {
      walletAddresses,
      path,
      isCreating,
      showAlert,
      alert,
      approversInput,
      quorumInput,
      shouldReset,
    } = this.state;
    return (
      <Router>
        <div className='App'>
          <Navigation />
          <Switch>
            <Route
              path='/'
              exact
              component={match => (
                <Home
                  factoryOwner={factoryOwner}
                  walletAddresses={walletAddresses}
                  shouldReset={shouldReset}
                  match={match}
                />
              )}
            />
            <Route
              path='/create'
              exact
              component={match => (
                <CreateWallet
                  match={match}
                  createMultisigWallet={this.createMultisigWallet}
                  isCreating={isCreating}
                  showAlert={showAlert}
                  alert={alert}
                  approversInput={approversInput}
                  quorumInput={quorumInput}
                />
              )}
            />
            <Route
              path='/wallet'
              exact
              component={match => (
                <Wallets
                  walletAddresses={walletAddresses}
                  shouldReset={shouldReset}
                  match={match}
                />
              )}
            />
            <Route
              path={path}
              exact
              strict
              component={match => (
                <Wallet
                  web3={web3}
                  accounts={accounts}
                  shouldReset={shouldReset}
                  match={match}
                />
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
