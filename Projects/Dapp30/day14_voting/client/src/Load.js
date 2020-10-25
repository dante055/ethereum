import React, { Component } from 'react';
import { getWeb3, getContract } from './utils/utils.js';
import App from './components/App.js';
import { Alert, Container } from 'react-bootstrap';

class Load extends Component {
  state = {
    web3: undefined,
    contract: undefined,
    contractAddress: '',
    admin: '',
  };

  async componentDidMount() {
    try {
      const web3 = await getWeb3();
      const { contract, contractAddress } = await getContract(web3);
      const admin = await contract.methods.admin().call();
      this.setState({ web3, contract, contractAddress, admin });
    } catch (error) {
      console.log(error);
    }
  }

  getAccounts = async () => {
    const { web3 } = this.state;
    const accounts = await web3.eth.getAccounts();
    return accounts;
  };

  render() {
    const { web3, contract, contractAddress, admin } = this.state;
    return typeof web3 !== 'undefined' ? (
      <App
        web3={web3}
        getAccounts={this.getAccounts}
        contract={contract}
        contractAddress={contractAddress}
        admin={admin}
      />
    ) : (
      <Container className='mt-5'>
        <Alert variant='danger'>
          <h1>Loading...</h1>
          <h4>
            Either Web3 is been loaded or you dont have the contract deployed
            yet!
          </h4>
          <p>See console for more info!</p>
        </Alert>
      </Container>
    );
  }
}

export default Load;
